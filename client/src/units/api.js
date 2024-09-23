import { getUser } from './storage.js'
import { useRouter } from 'vue-router'

export async function callApi(path, options) {
  const { pk, password } = getUser()
  if (!pk || !password) {
    useRouter().push('/login')
    return Promise.reject('No pk or password')
  }

  const overrideOptions = options || {
    method: 'GET'
  }
  overrideOptions.headers = overrideOptions.headers || {
    'X-Pk': pk,
    'X-Password': password
  }
  return fetch(`https://jtex.jiecs.top/api/${path}`, overrideOptions)
    .then(response => response.json())
    .then(data => data)
}
