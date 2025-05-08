import { Router } from 'express';
import { dbPost } from '../index.js';
import makeResponse from '../units/makeResponse.js';
import authentication from "../units/user/authenticator.js";
import reqParamsParser from '../units/reqParamsParser.js';

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

import { dbTransaction } from '../index.js'; // 引入交易数据库
import fetchBalance from '../units/transaction/fetchBalance.js'; // 引入余额查询工具

// 支持正方或反方
router.post('/:postId/:type', async (request, response) => {
    const user = await authentication(request, response);
    if (!user) return;

    const { postId, type } = request.params;

    // 检查 type 是否合法
    if (!['support', 'oppose'].includes(type)) {
        return makeResponse(response, 400, '无效的操作类型');
    }

    // 转账目标用户 pk 为 -1 小法庭账号
    const targetPk = '-1';
    const amount = type === 'support' ? 1 : -1;

    // 检查余额是否足够（不用）
    // const balance = await fetchBalance(user.pk);
    // if (balance < Math.abs(amount)) {
    //     return makeResponse(response, 400, '余额不足');
    // }

    // 创建交易记录
    const transaction = {
        from_pk: user.pk,
        to_pk: targetPk,
        time: Date.now(),
        amount,
        comment: `支持${type === 'support' ? '正方' : '反方'} - 小法庭事件 ID: ${postId}`
    };

    try {
        const result = await dbTransaction.add(transaction);
        makeResponse(response, 0, '感谢您的参与', { transaction: result });
    } catch (error) {
        console.error('Transaction error:', error);
        makeResponse(response, 500, '操作失败');
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