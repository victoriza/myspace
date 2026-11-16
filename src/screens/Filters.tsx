import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, Segmented, Switch } from '../components/ui'
import type { Strictness } from '../lib/types'
import { useApp } from '../state'

export function Filters() {
  const { t } = useTranslation()
  const { settings, updateSettings, refresh } = useApp()
  const [word, setWord] = useState('')
  const change = (patch: Parameters<typeof updateSettings>[0]) => {
    updateSettings(patch)
    setTimeout(() => void refresh({ force: true }), 0)
  }
  const addWord = () => {
    const w = word.trim()
    if (w && !settings.blockWords.includes(w)) change({ blockWords: [...settings.blockWords, w] })
    setWord('')
  }

  return (
    <div className="screen">
      <Header title={t('filters.title')} />
      <main className="stack">
        <section className="card pad-card stack-tight">
          <h2 className="card-title">{t('filters.strictness')}</h2>
          <Segmented<Strictness>
            label={t('filters.strictness')}
            value={settings.strictness}
            onChange={(strictness) => change({ strictness })}
            options={(['relaxed', 'balanced', 'strict'] as const).map((v) => ({ value: v, label: t(`filters.${v}`) }))}
          />
          <p className="muted small">{t(`filters.${settings.strictness}Help`)}</p>
        </section>

        <section className="card list">
          <div className="row">
            <span className="row-text">
              <strong>{t('filters.hidePolitics')}</strong>
              <span className="muted small">{t('filters.hidePoliticsHelp')}</span>
            </span>
            <Switch label={t('filters.hidePolitics')} checked={settings.hidePolitics} onChange={(hidePolitics) => change({ hidePolitics })} />
          </div>
          <div className="row">
            <span className="row-text"><strong>{t('filters.skipShorts')}</strong></span>
            <Switch label={t('filters.skipShorts')} checked={settings.skipShorts} onChange={(skipShorts) => change({ skipShorts })} />
          </div>
        </section>

        <section className="card pad-card stack-tight">
          <h2 className="card-title">{t('filters.alwaysHide')}</h2>
          <div className="word-chips">
            {settings.blockWords.map((w) => (
              <button key={w} className="word-chip" aria-label={`${w} ×`} onClick={() => change({ blockWords: settings.blockWords.filter((x) => x !== w) })}>
                {w} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
          <form className="input-row" onSubmit={(e) => { e.preventDefault(); addWord() }}>
            <label className="sr-only" htmlFor="new-word">{t('filters.addWord')}</label>
            <input id="new-word" value={word} onChange={(e) => setWord(e.target.value)} placeholder={t('filters.addWord')} />
            <button className="btn-primary small" type="submit">+</button>
          </form>
        </section>

      </main>
    </div>
  )
}
