import { getUser } from './storage.js'
import { useRouter } from 'vue-router'
import { router } from '@/main'

export async function callApi(path, options) {

  const overrideOptions = options || {
    method: 'GET'
  }
  if (!overrideOptions.headers) {
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
    .then(response => {
      if (!response.code || response.code !== 200) {
        throw new Error(response.message)
      }
      return response
    })
    .catch(error => {
      console.error('Error:', error)
      return Promise.reject(error)
    })
}
