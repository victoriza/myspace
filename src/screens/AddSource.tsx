import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, Icon, Segmented } from '../components/ui'
import { discoverSource, type Discovered } from '../lib/fetchers'
import { INTERESTS, type Lang, type Source, type Topic } from '../lib/types'
import { useApp } from '../state'

const EXAMPLES = ['quantamagazine.org', 'youtube.com/@kurzgesagt', 'fixthenews.substack.com']

export function AddSource() {
  const { t } = useTranslation()
  const { settings, updateSettings, refresh } = useApp()
  const [link, setLink] = useState('')
  const [state, setState] = useState<'idle' | 'checking' | 'found' | 'notfound' | 'added'>('idle')
  const [result, setResult] = useState<Discovered | null>(null)
  const [type, setType] = useState<Source['type']>('news')
  const [lang, setLang] = useState<Lang>(settings.lang)
  const [topic, setTopic] = useState<Topic | null>(null)
  const isYoutube = /(^|\/\/|\.)(youtube\.com|youtu\.be)/i.test(link)

  const check = async (value = link) => {
    if (!value.trim()) return
    setState('checking')
    try {
      const r = await discoverSource(value, settings.lang)
      setResult(r)
      if (r) {
        setType(r.source.type)
        setLang(r.source.lang)
        setTopic(null)
      }
      setState(r ? 'found' : 'notfound')
    } catch {
      setState('notfound')
    }
  }

  const add = () => {
    if (!result) return
    const source: Source = { ...result.source, type, lang, ...(topic ? { topic } : {}) }
    updateSettings({
      customSources: [...settings.customSources, source],
      enabledSources: [...settings.enabledSources, source.id],
    })
    setState('added')
    setTimeout(() => void refresh({ force: true }), 0)
  }

  const tryExample = (ex: string) => {
    setLink(ex)
    void check(ex)
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

        {state === 'idle' && !link ? (
          <>
            <div className="stack-tight">
              <span className="small muted">{t('add.examples')}</span>
              <div className="word-chips">
                {EXAMPLES.map((ex) => (
                  <button key={ex} className="word-chip example" onClick={() => tryExample(ex)}>{ex}</button>
                ))}
              </div>
            </div>
            <section className="card pad-card stack-tight works">
              <h2 className="card-title">{t('add.works')}</h2>
              <ul className="check-list">
                {(t('add.worksList', { returnObjects: true }) as string[]).map((w) => <li key={w}>{Icon.check}{w}</li>)}
              </ul>
              <h2 className="card-title">{t('add.notWorks')}</h2>
              <p className="muted small">{t('add.notWorksText')}</p>
            </section>
          </>
        ) : null}

        {(state === 'found' || state === 'added') && result ? (
          <section className="card pad-card stack-tight" aria-live="polite">
            <div className="row-start">
              <span className="ok-dot">{Icon.check}</span>
              <strong>{state === 'added' ? t('add.added') : t('add.found')}</strong>
            </div>
            <div className="bordered stack-tight">
              <strong>{result.source.name}</strong>
              {result.sample[0] ? <span className="muted small">{t('add.latest')} {result.sample[0].title}</span> : null}
            </div>
            {state === 'found' ? (
              <>
                {result.source.kind !== 'youtube' ? (
                  <div className="stack-tight">
                    <span className="small strong" id="add-type">{t('add.whatIs')}</span>
                    <Segmented<Source['type']>
                      label={t('add.whatIs')}
                      value={type}
                      onChange={setType}
                      options={(['news', 'newsletter', 'tech'] as const).map((v) => ({ value: v, label: t(`types.${v}`) }))}
                    />
                  </div>
                ) : null}
                <div className="stack-tight">
                  <span className="small strong">{t('add.language')}</span>
                  <Segmented<Lang> label={t('add.language')} value={lang} onChange={setLang} options={(['es', 'ca', 'en'] as const).map((l) => ({ value: l, label: t(`langs.${l}`), lang: l }))} />
                </div>
                <div className="stack-tight">
                  <span className="small strong" id="add-topic">{t('add.topic')}</span>
                  <div className="interest-chips" role="radiogroup" aria-labelledby="add-topic">
                    {[null, ...INTERESTS].map((tp) => (
                      <button key={tp ?? 'none'} role="radio" aria-checked={topic === tp} className={`chip small-chip ${topic === tp ? 'on' : ''}`} onClick={() => setTopic(tp)}>
                        {tp ? t(`interests.${tp}`) : t('add.noTopic')}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={add}>{t('add.addToFeed')}</button>
              </>
            ) : null}
            {type === 'newsletter' ? <p className="muted small">{t('add.tip')}</p> : null}
          </section>
        ) : null}

        {state === 'notfound' ? (
          <section className="card pad-card stack-tight" aria-live="polite">
            <strong>{t('add.notFound')}</strong>
            {isYoutube ? (
              <p className="muted small">{t('add.youtubeNotFound')}</p>
            ) : (
              <>
                <p className="muted small">{t('add.notFoundText')}</p>
                <a className="btn-outline" href="https://kill-the-newsletter.com/" target="_blank" rel="noopener noreferrer">{t('add.openKtn')} {Icon.external}</a>
              </>
            )}
          </section>
        ) : null}
      </main>
    </div>
  )
}
