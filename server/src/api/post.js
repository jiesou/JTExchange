import { Router } from 'express';
import { dbPost, dbTransaction, dbVote } from '../index.js';
import makeResponse from '../units/makeResponse.js';
import authentication from "../units/user/authenticator.js";
import reqParamsParser from '../units/reqParamsParser.js';
import fetchBalance from '../units/transaction/fetchBalance.js';

const router = Router();

router.get('/', async (request, response) => {
    let reqBody = reqParamsParser(request);
    // 判断 id 是否合法
    if (/^[\da-f]{1,12}$/.test(String(reqBody.innerid))) {
        // 在数据库中查找帖子
        const post = await dbPost.select({
            innerid: reqBody.id
        }, {
            limit: 1,
            select: ['-content', '-comments.data']
        });
        if (post) {
            makeResponse(response, 0, 'Success.', post);
        } else {
            makeResponse(response, 400, '找不到该消息');
        }
    } else {
        const posts = await dbPost.select({}, {
            desc: 'time', limit: reqBody.limit || 10, offset: reqBody.offset || 0
        });
        console.log(posts);
        makeResponse(response, 0, '成功获取', posts);
    }
});



async function calculateVoteCounts(postId) {
    const supportVotes = await dbVote.select({
        post_innerid: postId,
        type: 'support'
    });
    const opposeVotes = await dbVote.select({
        post_innerid: postId,
        type: 'oppose'
    });
    return {
        supportCount: supportVotes.length,
        opposeCount: opposeVotes.length
    };
}

// 获取投票结果
router.get('/:postId/votes', async (request, response) => {
    const { postId } = request.params;

    const { supportCount, opposeCount } = await calculateVoteCounts(postId);

    makeResponse(response, 0, '投票结果获取成功', {
        supportCount: supportCount,
        opposeCount: opposeCount
    });
});

// 支持正方或反方 - 整合投票和转账功能
router.post('/:postId/:type', async (request, response) => {
    const user = await authentication(request, response);
    if (!user) return;

    const { postId, type } = request.params;

    // 检查 type 是否合法
    if (!['support', 'oppose'].includes(type)) {
        return makeResponse(response, 400, '无效的操作类型');
    }

    // 检查用户是否已经投票
    const existingVote = await dbVote.select({
        user_pk: user.pk,
        post_id: postId
    }, { limit: 1 });

    if (existingVote.length > 0) {
        return makeResponse(response, 400, '您已经投过票了');
    }

    // 创建投票记录
    await dbVote.add({
        user_pk: user.pk,
        post_innerid: postId,
        type,
        time: Date.now()
    });

    const { supportCount, opposeCount } = await calculateVoteCounts(postId);

    makeResponse(response, 0, '投票成功', {
        post_innerid: postId,
        type: type,
        supportCount: supportCount,
        opposeCount: opposeCount
    });
});

// 添加新帖子
router.post('/new', async (request, response) => {
    const user = await authentication(request, response);
    const reqBody = reqParamsParser(request);
    const newPost = {
        title: reqBody.title,
        content: reqBody.content,
        author: user.pk,
        author_nick: user.nick,
        time: Date.now()
    };
    const result = await dbPost.add(newPost);
    makeResponse(response, 0, '成功', {
        post: result
    });
});

// 删除帖子
router.post('/delete', async (request, response) => {
    const reqBody = reqParamsParser(request);
    const result = await dbPost.delete({ innerid: reqBody.innerid });
    if (result) {
        makeResponse(response, 0, '成功');
    } else {
        makeResponse(response, 400, '找不到该消息');
    }
});

export default router;