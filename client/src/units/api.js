import { getUser } from './storage.js'
import { useRouter } from 'vue-router'
import { router } from '@/main'

export async function callApi(path, options) {

  const overrideOptions = options || {
    method: 'GET'
  }
  if (overrideOptions.headers.length === 0) {
    const { pk, password } = getUser()
    if (!pk || !password) {
      router.push('/login')
      return Promise.reject({ message: 'No user logged in' })
    }
    overrideOptions.headers = {
      'X-Pk': pk,
      'X-Password': password
    }
  }
  return fetch(import.meta.env.VITE_SERVER_BASEURL + path, overrideOptions)
    .then(response => response.json())
    .then(data => data)
    .catch(error => {
      console.error('Error:', error)
      return Promise.reject(error)
    })
}
