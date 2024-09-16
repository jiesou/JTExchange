import { Router } from 'express';
import makeResponse from "../units/makeResponse.js";
import authentication from "../units/user/authenticator.js";
import { dbUser } from '../index.js';
import reqParameterParser from "../units/reqParamsParser.js";
import { hashMD5, hash } from "../units/user/hash.js";

const router = Router();

router.get('/', async (request, response) => {
    // 在数据库中查找用户
    let user = await authentication(request, response);
    if (!user) return;
    user['password'] = undefined;
    user['key'] = undefined;
    makeResponse(response, 0, 'Success.', user);
})

router.post('/new', async (request, response) => {
    const reqBody = reqParameterParser(request);

    if (!/^.{2,12}$/.test(reqBody.nick)) {
        makeResponse(response, 400, 'Invalid nick.');
        return
    }
    if (!/^\d{1,2}$/.test(request.headers['x-pk'])) {
        makeResponse(response, 400, 'Invalid pk.');
        return
    }
    if (!/^[\w\._+\-?!@#$%^&*()/]{8,64}$/.test(request.headers['x-password'])) {
        makeResponse(response, 400, 'Invalid password.');
        return
    }

    const id = hashMD5(request.headers['x-pk'] + new Date().getTime()).substr(0, 8)

    if (await dbUser.fetch({ pk: request.headers['x-pk'], id: request.headers['x-pk'] }, { limit: 1 }).length > 0) {
        makeResponse(response, 400, 'User already exists.');
        return
    }

    // 构建新对象
    let user = {
        id: id,
        nick: reqBody.nick,
        pk: request.headers['x-pk'],
        password: hash(request.headers['x-password']),
    };
    const result = await dbUser.add(user);
    if (!result) {
        makeResponse(response, 500, 'Failed to create user.');
        return;
    }
    makeResponse(response, 0, 'Created.');
});

export default router;
