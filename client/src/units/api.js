import { getUser } from './storage.js'

export async function callApi(path, options) {

  const overrideOptions = options || {
    method: 'GET'
  }
  if (!overrideOptions.headers) {
    const user = getUser()
    if (!user) {
      return Promise.reject({ message: 'No user logged in' })
    }
    overrideOptions.headers = {
      'Content-Type': 'application/json',
      'X-Pk': user.pk,
      ...(user.password && { 'X-Password': user.password }),
      ...(user.cardData && { 'X-Carddata': user.cardData })
    }
  }
  if (overrideOptions.body) {
    overrideOptions.body = JSON.stringify(overrideOptions.body)
    overrideOptions.headers['Content-Type'] = 'application/json'
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
      console.error(error)
      return Promise.reject(error)
    })
}
