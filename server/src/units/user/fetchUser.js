import { dbUser } from '../../index.js'

async function fetchUser(pk) {
  const results = await dbUser.select({ pk: pk }, { limit: 1 });
  results.forEach(user => {
    user['key'] = undefined;
    user['password'] = undefined;
    user['cardData'] = undefined;
  });
  return results[0];
}

export default fetchUser;
