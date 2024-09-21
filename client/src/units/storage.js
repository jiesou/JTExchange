export function getUser() {
    const pk = localStorage.getItem('pk')
    const password = localStorage.getItem('password')
    if (!pk || !password) return {}

    return {
        pk: pk,
        password: password
    }
}
