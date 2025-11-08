import { OgTip } from '../../components/OgTip'
import { renderToString } from 'react-dom/server'

export async function GET({ url }: { url: URL }) {
  const creator = url.searchParams.get('creator') || 'Creator Name'
  const amount = url.searchParams.get('amount') || '10'
  const currency = url.searchParams.get('currency') || 'ETH'
  const message = url.searchParams.get('message') || 'Thanks for your amazing content!'
  const chain = url.searchParams.get('chain') || 'Base'

  const svg = renderToString(
    OgTip({ creator, amount, currency, message, chain })
  )

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, immutable, no-transform, max-age=3600'
    }
  })
}