import { dbUser } from '../../index.js'

async function fetchUser(pk) {
  const results = await dbUser.select({ pk: pk }, { limit: 1 });
  if (results.length > 0) {
    const user = results[0];
    return { dataValues: {
      innerid: user.innerid,
      pk: user.pk,
      nick: user.nick,
    } };
  }
  return { dataValues: {} };
}

export default fetchUser;
