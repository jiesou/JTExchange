import makeResponse from '../makeResponse.js';
import { dbUser } from '../../index.js';
import {hash} from './hash.js';

async function authentication(request, response) {
    if (!request.headers['x-pk']) {
        makeResponse(response, 400, 'Missing pk.');
        return;
    }
    let users;
    if (request.headers['x-carddata']) {
        // 通过 NFC 卡号登录可以不用账号密码
        users = await dbUser.fetch({ cardData: request.headers['x-carddata'] }, { limit: 1 });
    } else {
        users = await dbUser.fetch({ pk: request.headers['x-pk'] }, { limit: 1 });
    }
    if (users.length === 0) {
        makeResponse(response, 403, 'User not found.');
        return;
    }
    const user = users[0];

    if (request.headers['x-carddata'] === user['cardData']) {
        return user;
    }

    if (user['password'] === hash(request.headers['x-password'] || '')) {
        return user;
    }

    makeResponse(response, 403, 'Authentication failed.');
    return;
}

export default authentication;
