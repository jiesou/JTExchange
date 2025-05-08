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
        const posts = await dbPost.select({},{
            desc: 'time', limit: reqBody.limit || 10, offset: reqBody.offset || 0
        });
        console.log(posts);
        makeResponse(response, 0, '成功获取', posts);
    }
});

// 获取投票结果
router.get('/:postId/votes', async (request, response) => {
    const { postId } = request.params;

    try {
        // 计算支持和反对票数
        const supportVotes = await dbVote.select({
            post_id: postId,
            type: 'support'
        });
        
        const opposeVotes = await dbVote.select({
            post_id: postId,
            type: 'oppose'
        });
        
        const supportCount = supportVotes.length;
        const opposeCount = opposeVotes.length;

        makeResponse(response, 0, '投票结果获取成功', { 
            support: supportCount, 
            oppose: opposeCount,
            total: supportCount + opposeCount
        });
    } catch (error) {
        console.error('Error fetching votes:', error);
        makeResponse(response, 500, '获取投票结果失败');
    }
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

    try {
        // 1. 创建投票记录
        const vote = {
            user_pk: user.pk,
            post_id: postId,
            type,
            time: Date.now()
        };
        await dbVote.add(vote);

        // 2. 创建交易记录 (小法庭账号 pk 为 -1)
        const targetPk = '-1';
        const amount = type === 'support' ? 1 : -1;
        const transaction = {
            from_pk: user.pk,
            to_pk: targetPk,
            time: Date.now(),
            amount,
            comment: `支持${type === 'support' ? '正方' : '反方'} - 小法庭事件 ID: ${postId}`
        };
        await dbTransaction.add(transaction);

        makeResponse(response, 0, '投票成功', { 
            post_id: postId, 
            vote_type: type
        });
    } catch (error) {
        console.error('Vote/Transaction error:', error);
        makeResponse(response, 500, '投票失败');
    }
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