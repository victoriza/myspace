import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ca } from './ca'
import { en } from './en'
import { es } from './es'

export type Strings = typeof es

void i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en }, ca: { translation: ca } },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n
