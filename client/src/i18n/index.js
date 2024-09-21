import { createI18n } from 'vue-i18n'

import zh from './locale/zh.js'
import en from './locale/en.js'

const messages = {
    en: {
        ...en
    },
    zh: {
        ...zh
    },
}

const i18n = createI18n({
    locale: 'zh',
    fallbackLocale: 'en',
    legacy: false,
    messages
})

export default i18n