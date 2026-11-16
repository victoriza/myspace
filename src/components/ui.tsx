import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { back, go } from '../router'
import type { ContentType, Lang } from '../lib/types'

export const Icon = {
  back: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>,
  chevron: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>,
  feed: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h10" /></svg>,
  customize: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>,
  more: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10" /></svg>,
  play: <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>,
  external: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>,
  arrow: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>,
  logo: (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="7" fill="#1E2952" />
      <circle cx="14" cy="11" r="5" fill="#E9B949" />
      <path d="M6 18c2.7-2 5.3 2 8 0s5.3 2 8 0M6 22c2.7-2 5.3 2 8 0s5.3 2 8 0" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  ),
}

export function TypeTag({ type }: { type: ContentType }) {
  const { t } = useTranslation()
  return <span className={`tag tag-${type}`}>{t(`types.${type}`)}</span>
}

export function Header({ title, onBack = back, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <header className="sub-header">
      <button className="icon-btn" aria-label={t('nav.back')} onClick={onBack}>
        {Icon.back}
      </button>
      <h1>{title}</h1>
      {right ? <div className="sub-header-right">{right}</div> : null}
    </header>
  )
}

export function BottomNav({ active }: { active: 'feed' | 'customize' | 'more' }) {
  const { t } = useTranslation()
  const tabs = [
    { id: 'feed', icon: Icon.feed, path: [] as string[] },
    { id: 'customize', icon: Icon.customize, path: ['customize'] },
    { id: 'more', icon: Icon.more, path: ['more'] },
  ] as const
  return (
    <nav className="bottom-nav" aria-label="Main">
      {tabs.map((tab) => (
        <button key={tab.id} className={tab.id === active ? 'active' : ''} aria-current={tab.id === active ? 'page' : undefined} onClick={() => go(...tab.path)}>
          {tab.icon}
          {t(`nav.${tab.id}`)}
        </button>
      ))}
    </nav>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} className={`switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

export function Segmented<T extends string | number>({ options, value, onChange, label, dark }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string; dark?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={`segmented ${dark ? 'dark' : ''}`}>
      {options.map((o) => (
        <button key={String(o.value)} role="radio" aria-checked={o.value === value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function LangSwitch({ value, onChange, dark }: { value: Lang; onChange: (l: Lang) => void; dark?: boolean }) {
  return (
    <Segmented
      label="Idioma · Language · Idioma"
      dark={dark}
      value={value}
      onChange={onChange}
      options={[
        { value: 'es', label: 'ES' },
        { value: 'en', label: 'EN' },
        { value: 'ca', label: 'CA' },
      ]}
    />
  )
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
