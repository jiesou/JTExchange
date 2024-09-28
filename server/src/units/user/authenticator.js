import makeResponse from '../makeResponse.js';
import { dbUser } from '../../index.js';
import {hash} from './hash.js';

async function authentication(request, response) {
    console.log(request.headers['x-pk']);
    if (!request.headers['x-pk'] || !request.headers['x-password']) {
        makeResponse(response, 400, 'Missing pk or password.');
        return;
    }
    let user = await dbUser.fetch({ pk: request.headers['x-pk'] }, { limit: 1 });
    if (user.length > 0 && user[0]['password'] === hash(request.headers['x-password'])) {
        return user[0];
    } else {
        makeResponse(response, 403, 'Authentication failed.');
        return;
    }
}

export default authentication;
