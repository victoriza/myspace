import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, Icon, TypeTag } from '../components/ui'
import { discoverSource, type Discovered } from '../lib/fetchers'
import { useApp } from '../state'

export function AddSource() {
  const { t } = useTranslation()
  const { settings, updateSettings, refresh } = useApp()
  const [link, setLink] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'found' | 'notfound' | 'added'>('idle')
  const [result, setResult] = useState<Discovered | null>(null)

  const check = async () => {
    if (!link.trim()) return
    setState('checking')
    try {
      const r = await discoverSource(link)
      setResult(r)
      setState(r ? 'found' : 'notfound')
    } catch {
      setState('notfound')
    }
  }

  const add = () => {
    if (!result) return
    const source = { ...result.source, lang: settings.lang }
    updateSettings({
      customSources: [...settings.customSources, source],
      enabledSources: [...settings.enabledSources, source.id],
    })
    setState('added')
    setTimeout(() => void refresh({ force: true }), 0)
  }

  return (
    <div className="screen">
      <Header title={t('add.title')} />
      <main className="stack pad">
        <p className="muted">{t('add.intro')}</p>
        <form className="stack-tight" onSubmit={(e) => { e.preventDefault(); void check() }}>
          <label htmlFor="link" className="small strong">{t('add.label')}</label>
          <div className="input-row">
            <input id="link" type="url" inputMode="url" autoComplete="off" value={link} onChange={(e) => { setLink(e.target.value); setState('idle') }} placeholder={t('add.placeholder')} />
            <button className="btn-primary small" type="submit" disabled={state === 'checking'}>
              {state === 'checking' ? t('add.checking') : t('add.check')}
            </button>
          </div>
        </form>

        {(state === 'found' || state === 'added') && result ? (
          <section className="card pad-card stack-tight" aria-live="polite">
            <div className="row-start">
              <span className="ok-dot">{Icon.check}</span>
              <strong>{state === 'added' ? t('add.added') : t('add.found')}</strong>
            </div>
            <div className="bordered stack-tight">
              <span className="meta"><TypeTag type={result.source.type} /><strong>{result.source.name}</strong></span>
              {result.sample[0] ? <span className="muted small">{t('add.latest')} {result.sample[0].title}</span> : null}
            </div>
            {state === 'found' ? <button className="btn-primary" onClick={add}>{t('add.addToFeed')}</button> : null}
            {result.source.type === 'newsletter' ? <p className="muted small">{t('add.tip')}</p> : null}
          </section>
        ) : null}

        {state === 'notfound' ? (
          <section className="card pad-card stack-tight" aria-live="polite">
            <strong>{t('add.notFound')}</strong>
            <p className="muted small">{t('add.notFoundText')}</p>
            <a className="btn-outline" href="https://kill-the-newsletter.com/" target="_blank" rel="noopener noreferrer">{t('add.openKtn')} {Icon.external}</a>
          </section>
        ) : null}
      </main>
    </div>
  )
}
