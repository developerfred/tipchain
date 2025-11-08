import { OgHero } from '../../components/OgHero'
import { renderToString } from 'react-dom/server'

export async function GET({ url }: { url: URL }) {
  const title = url.searchParams.get('title') || 'TipChain'
  const subtitle = url.searchParams.get('subtitle') || 'Support Creators with Multi-chain Tipping'
  const tagline = url.searchParams.get('tagline') || 'Gasless transactions • Social login • Multi-chain support'

  const svg = renderToString(
    OgHero({ title, subtitle, tagline })
  )

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, immutable, no-transform, max-age=3600'
    }
  })
}