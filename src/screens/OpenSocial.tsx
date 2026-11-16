import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../components/ui'
import { saveSocial } from '../lib/storage'
import { back, go } from '../router'

const APPS = {
  instagram: { url: 'https://www.instagram.com/', badge: 'IG', cls: 'ig' },
  tiktok: { url: 'https://www.tiktok.com/', badge: 'TT', cls: 'tt' },
} as const

export function OpenSocial({ app }: { app: 'instagram' | 'tiktok' }) {
  const { t } = useTranslation()
  const [limit, setLimit] = useState(10)
  const cfg = APPS[app]

  const open = () => {
    saveSocial({ app, openedAt: Date.now(), limitMin: limit })
    // On Android, these links open the installed app.
    window.location.href = cfg.url
  }

  return (
    <div className="social-screen">
      <header>
        <button className="icon-btn light" aria-label={t('nav.back')} onClick={back}>{Icon.back}</button>
      </header>
      <main className="stack">
        <div className="stack-tight">
          <span className={`app-badge big ${cfg.cls}`} aria-hidden="true">{cfg.badge}</span>
          <h1>{t(`social.${app}.title`)}</h1>
          <p className="soft">{t(`social.${app}.intro`)}</p>
        </div>
        <ol className="steps">
          <li><span className="step-n">1</span>{t(`social.${app}.step1`)}</li>
          <li><span className="step-n">2</span>{t(`social.${app}.step2`)}</li>
        </ol>
        <section className="stack-tight">
          <h2 className="section-label light">{t('social.remind')}</h2>
          <div role="radiogroup" aria-label={t('social.remind')} className="limit-grid">
            {[5, 10, 15, 0].map((m) => (
              <button key={m} role="radio" aria-checked={limit === m} className={limit === m ? 'on' : ''} onClick={() => setLimit(m)}>
                {m === 0 ? t('social.off') : t('social.min', { count: m })}
              </button>
            ))}
          </div>
        </section>
      </main>
      <div className="social-bottom">
        <button className="btn-sun big" onClick={open}>{t(`social.${app}.open`)}</button>
        <button className="btn-link light" onClick={() => go()}>{t('social.notNow')}</button>
      </div>
    </div>
  )
}
