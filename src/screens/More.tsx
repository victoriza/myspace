import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav, Icon, Switch } from '../components/ui'
import { go } from '../router'
import { useApp } from '../state'

export function More() {
  const { t } = useTranslation()
  const { settings, updateSettings, resetAll } = useApp()
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="screen with-nav">
      <header className="top-header">
        <h1>{t('more.title')}</h1>
        <p className="muted small">{t('more.subtitle')}</p>
      </header>
      <main className="stack">
        <h2 className="section-label">{t('more.shortcuts')}</h2>
        <div className="card list">
          <div className="row">
            <span className="app-badge ig" aria-hidden="true">IG</span>
            <span className="row-text"><strong>Instagram</strong><span className="muted small">{t('more.instagramHint')}</span></span>
            <Switch label="Instagram" checked={settings.shortcuts.instagram} onChange={(v) => updateSettings({ shortcuts: { ...settings.shortcuts, instagram: v } })} />
          </div>
          <div className="row">
            <span className="app-badge tt" aria-hidden="true">TT</span>
            <span className="row-text"><strong>TikTok</strong><span className="muted small">{t('more.tiktokHint')}</span></span>
            <Switch label="TikTok" checked={settings.shortcuts.tiktok} onChange={(v) => updateSettings({ shortcuts: { ...settings.shortcuts, tiktok: v } })} />
          </div>
        </div>

        <div className="card pad-card stack-tight">
          <strong>{t('more.youtube')}</strong>
          <p className="muted small">{t('more.youtubeHint')}</p>
        </div>

        <div className="card pad-card stack-tight">
          <strong>{t('more.install')}</strong>
          <p className="muted small">{t('more.installHint')}</p>
        </div>

        <div className="card list">
          <button className="row link-row" onClick={() => go('about')}>{t('about.title')}{Icon.chevron}</button>
          <button className="row link-row" onClick={() => go('why')}>{t('more.about')}{Icon.chevron}</button>
        </div>

        <h2 className="section-label">{t('more.data')}</h2>
        <div className="card pad-card stack-tight">
          <p className="muted small">{t('more.dataHint')}</p>
          <button
            className={`btn-secondary ${confirm ? 'danger' : ''}`}
            onClick={() => {
              if (!confirm) return setConfirm(true)
              resetAll()
              go('why')
            }}
          >
            {confirm ? t('more.resetConfirm') : t('more.reset')}
          </button>
        </div>
      </main>
      <BottomNav active="more" />
    </div>
  )
}
