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
    if (!user) {
      return;
    }
    user['key'] = undefined;
    user['password'] = undefined;
    user['cardData'] = undefined;
    makeResponse(response, 0, 'Success.', user);
});

router.delete('/delete', async (request, response) => {
  const user = await authentication(request, response);
  if (!user) {
    return;
  }
  const result = await dbUser.delete({ pk: user.pk });
  if (!result) {
    makeResponse(response, 500, 'Failed to delete user.');
    return;
  }
  makeResponse(response, 0, 'Deleted.');
});

router.post('/new', async (request, response) => {
  const reqBody = reqParameterParser(request);
  if (!/^.{2,12}$/.test(reqBody.nick)) {
      makeResponse(response, 400, 'Invalid nick.');
      return
  }
  if (!/^\w{1,16}$/.test(request.headers['x-pk'])) {
      makeResponse(response, 400, 'Invalid pk.');
      return
  }
  if (!/^[\w\._+\-?!@#$%^&*()/]{8,64}$/.test(request.headers['x-password'])) {
      makeResponse(response, 400, 'Invalid password.');
      return
  }

  if (await dbUser.fetch({ pk: request.headers['x-pk'] }, { limit: 1 }).length > 0) {
      makeResponse(response, 400, 'User already exists.');
      return
  }

  // 构建新对象
  let user = {
      pk: request.headers['x-pk'],
      nick: reqBody.nick,
      password: hash(request.headers['x-password']),
      cardData: request.headers['x-carddata'],
  };
  const result = await dbUser.add(user);
  if (!result) {
      makeResponse(response, 500, 'Failed to create user.');
      return;
  }
  makeResponse(response, 0, 'Created.');
});

export default router;
