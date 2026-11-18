import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav, Icon } from '../components/ui'
import { APP_VERSION } from '../lib/changelog'
import { useInstall } from '../lib/install'
import { landingUrl, shareLink } from '../lib/share'
import { loadLastVersion } from '../lib/storage'
import type { Lang } from '../lib/types'
import { useUpdate } from '../lib/update'
import { go } from '../router'
import { useApp } from '../state'

/** Small line icons for the rows (decorative; the row text says what it is). */
const glyph = (d: ReactNode) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
)
const G = {
  install: glyph(<><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M12 7v7m-3-3 3 3 3-3" /></>),
  play: glyph(<><rect x="3" y="5" width="18" height="14" rx="3.5" /><path d="m10.5 9.5 4 2.5-4 2.5z" /></>),
  sun: glyph(<><circle cx="12" cy="13" r="4" /><path d="M3 18c2-1.3 4 1.3 6 0s4 1.3 6 0 4 1.3 6 0M12 4v2M5.6 6.6l1.4 1.4M18.4 6.6 17 8" /></>),
  rules: glyph(<><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="2.6" /></>),
  spark: glyph(<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z" />),
  share: glyph(<><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" /><path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" /></>),
  person: glyph(<><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" /></>),
}

function Row({ icon, title, hint, onClick, dot, dotLabel }: { icon: ReactNode; title: string; hint?: string; onClick?: () => void; dot?: boolean; dotLabel?: string }) {
  const body = (
    <>
      <span className="more-icon">{icon}</span>
      <span className="row-text">
        <span className="more-title">{title}{dot ? <span className="new-dot" role="img" aria-label={dotLabel} /> : null}</span>
        {hint ? <span className="muted small">{hint}</span> : null}
      </span>
      {onClick ? Icon.chevron : null}
    </>
  )
  return onClick ? (
    <button className="row link-row more-row" onClick={onClick}>{body}</button>
  ) : (
    <div className="row more-row">{body}</div>
  )
}

export function More() {
  const { t, i18n } = useTranslation()
  const { resetAll } = useApp()
  const install = useInstall()
  const update = useUpdate()
  const [confirm, setConfirm] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [note, setNote] = useState('')
  const lang = i18n.language as Lang
  const shareApp = async () => {
    const r = await shareLink({ title: 'Space Feed', text: t('share.appText'), url: landingUrl(lang) })
    if (r === 'shared') return
    setNote(r === 'copied' ? t('share.copied') : t('share.failed'))
    setTimeout(() => setNote(''), 3000)
  }
  const unread = loadLastVersion() !== null && loadLastVersion() !== APP_VERSION

  return (
    <div className="screen with-nav">
      <header className="top-header">
        <h1>{t('more.title')}</h1>
        <p className="muted small">{t('more.subtitle')}</p>
      </header>
      <main className="stack">
        <h2 className="section-label">{t('more.onPhone')}</h2>
        <div className="card list">
          {!install.installed ? (
            <Row
              icon={G.install}
              title={t('more.install')}
              hint={showSteps ? (install.ios ? t('more.installIos') : t('more.installOther')) : t('more.installHint')}
              onClick={() => (install.canPrompt ? void install.install() : setShowSteps((v) => !v))}
            />
          ) : null}
          <Row icon={G.play} title={t('more.youtube')} hint={t('more.youtubeHint')} />
        </div>

        <h2 className="section-label">{t('more.aboutSection')}</h2>
        <div className="card list">
          <Row icon={G.sun} title={t('more.why')} hint={t('more.whyHint')} onClick={() => go('why')} />
          <Row icon={G.rules} title={t('more.rules')} hint={t('more.rulesHint')} onClick={() => go('rules')} />
          <Row icon={G.spark} title={t('more.news')} hint={t('more.newsHint', { version: APP_VERSION })} onClick={() => go('changelog')} dot={unread} dotLabel={t('more.newsUnread')} />
          <Row icon={G.person} title={t('more.who')} hint={t('more.whoHint')} onClick={() => go('about')} />
          <Row icon={G.share} title={t('share.app')} hint={note || t('share.appHint')} onClick={shareApp} />
        </div>

        <h2 className="section-label">{t('more.data')}</h2>
        <div className="card pad-card stack-tight">
          <p className="muted small">{t('more.dataHint')}</p>
          {confirm ? (
            <div className="stack-tight" role="group" aria-label={t('more.reset')}>
              <p className="small warn">{t('more.resetAsk')}</p>
              <div className="row-start">
                <button className="btn-link danger-link" onClick={() => { resetAll(); go('why') }}>{t('more.resetYes')}</button>
                <button className="btn-link" onClick={() => setConfirm(false)}>{t('more.cancel')}</button>
              </div>
            </div>
          ) : (
            <button className="btn-link danger-link align-start" onClick={() => setConfirm(true)}>{t('more.reset')}</button>
          )}
        </div>

        <p className="more-footer muted small">
          {t('more.footer', { version: APP_VERSION })}
          {update.available ? <> · <button className="link-btn" onClick={update.apply}>{t('update.apply')}</button></> : null}
        </p>
      </main>
      <BottomNav active="more" />
    </div>
  )
}
