import { Router } from 'express';
import makeResponse from "../units/makeResponse.js";
import authentication from "../units/user/authenticator.js";
import { dbUser } from '../index.js';
import reqParameterParser from "../units/reqParamsParser.js";
import { hashMD5, hash } from "../units/user/hash.js";

import fetchUsers from "../units/user/fetchUsers.js";

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
    makeResponse(response, 0, '成功', user);
});

router.get('/fetch', async (request, response) => {
  makeResponse(response, 0, '成功', await fetchUsers());
});

router.delete('/delete', async (request, response) => {
  const user = await authentication(request, response);
  if (!user) {
    return;
  }
  const result = await dbUser.delete({ pk: user.pk });
  if (!result) {
    makeResponse(response, 500, '删除用户失败');
    return;
  }
  makeResponse(response, 0, '成功删除用户');
});

router.post('/new', async (request, response) => {
  const reqBody = reqParameterParser(request);
  if (!/^.{2,12}$/.test(reqBody.nick)) {
      makeResponse(response, 400, '昵称无效');
      return
  }
  if (!/^[\w-]{1,16}$/.test(request.headers['x-pk'])) {
      makeResponse(response, 400, '用户名无效');
      return
  }
  if (!/^[\w\._+\-?!@#$%^&*()/]{6,64}$/.test(request.headers['x-password'])) {
      makeResponse(response, 400, '密码无效');
      return
  }

  if (await dbUser.fetch({ pk: request.headers['x-pk'] }, { limit: 1 }).length > 0) {
      makeResponse(response, 400, '同用户名的用户已存在');
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
      makeResponse(response, 500, '注册用户失败（数据库）');
      return;
  }
  makeResponse(response, 0, '注册用户成功', user);
});

export default router;
