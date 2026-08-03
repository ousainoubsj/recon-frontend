import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Reconcil — Automated Financial Reconciliation Software'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const logo = await readFile(join(process.cwd(), 'public/images/Reconcil-logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #050F20 0%, #0B122B 60%, #0E182D 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={340} height={113} alt="Reconcil" />
        <div
          style={{
            display: 'flex',
            marginTop: 56,
            fontSize: 58,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          Reconcile with&nbsp;<span style={{ color: '#34d399' }}>Speed.</span>&nbsp;
          <span style={{ color: '#38bdf8' }}>Trust.</span>&nbsp;
          <span style={{ color: '#a78bfa' }}>Confidence.</span>
        </div>
        <div style={{ display: 'flex', marginTop: 28, fontSize: 30, color: '#94a3b8', maxWidth: 900 }}>
          Automate financial reconciliation, eliminate manual work, and close faster with complete accuracy.
        </div>
      </div>
    ),
    { ...size },
  )
}
