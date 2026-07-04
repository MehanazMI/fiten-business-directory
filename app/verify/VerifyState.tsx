export function VerifyState({ icon, spin, title, body, cta }: {
  icon: string; spin?: boolean; title: string; body: string
  cta?: { href: string; label: string }
}) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 480 }}>
      <i className={`ti ${icon}`} style={{ fontSize: '3.5rem', color: 'var(--teal)', marginBottom: '1rem', display: 'inline-block', animation: spin ? 'spin 1s linear infinite' : undefined }} aria-hidden="true" />
      <h1 style={{ color: 'var(--cream)', fontSize: '1.6rem', marginBottom: '0.75rem' }}>{title}</h1>
      <p style={{ color: 'var(--cream-70)', lineHeight: 1.7, marginBottom: cta ? '2rem' : 0 }}>{body}</p>
      {cta && <a href={cta.href} className="hdr-btn" style={{ display: 'inline-block' }}>{cta.label}</a>}
    </div>
  )
}
