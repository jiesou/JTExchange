import { dbUser } from '../../index.js'

async function fetchUsers() {
  const results = await dbUser.select();
  results.forEach(user => {
    user['key'] = undefined;
    user['password'] = undefined;
    user['cardData'] = undefined;
  });
  return results;
}

export default fetchUsers;
