import { createI18n } from 'vue-i18n'

import zh_hans from './locale/zh_hans.js'
import en_us from './locale/en_us.js'

const messages = {
    en: {
        ...en_us
    },
    zh: {
        ...zh_hans
    },
}

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    legacy: false,
    messages
})

export default i18n