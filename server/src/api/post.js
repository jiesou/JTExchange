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