export function getUser() {
    const pk = localStorage.getItem('pk')
    const nick = localStorage.getItem('nick')
    const password = localStorage.getItem('password')
    const cardData = localStorage.getItem('cardData')
    if (!pk || !(password || cardData)) {
        return null
    }

    return {
        pk: pk,
        nick: nick,
        password: password,
        cardData: localStorage.getItem('cardData'),
    }
}

export function setUser(pk, nick, password, cardData) {
    const items = { pk, nick, password, cardData };
    Object.keys(items).forEach(key => {
        if (items[key]) {
            localStorage.setItem(key, items[key]);
        } else {
            localStorage.removeItem(key);
        }
    });
}