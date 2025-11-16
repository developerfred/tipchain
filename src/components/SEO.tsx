import { Helmet } from 'react-helmet-async';
import type { SEOProps } from '@/types/seo';

const DEFAULT_SEO = {
  title: 'TipChain - Frictionless Multi-Chain Tipping for Creators',
  description:
    'Send crypto tips instantly with zero gas fees. Support creators across Base, Celo, Optimism & more. No wallet needed - use Google login.',
  ogType: 'website' as const,
  ogImage: 'https://tipchain.aipop.fun/api/og/hero',
  twitterCard: 'summary_large_image' as const,
  twitterSite: '@TipChain',
  keywords: [
    'crypto tipping',
    'web3 creator economy',
    'gasless transactions',
    'multi-chain tipping',
    'creator monetization',
    'blockchain tips',
    'zero fee tipping',
  ],
};

export function SEO({
  title,
  description = DEFAULT_SEO.description,
  canonical,
  ogType = DEFAULT_SEO.ogType,
  ogImage = DEFAULT_SEO.ogImage,
  ogImageAlt,
  twitterCard = DEFAULT_SEO.twitterCard,
  twitterSite = DEFAULT_SEO.twitterSite,
  twitterCreator,
  keywords = DEFAULT_SEO.keywords,
  author,
  publishedTime,
  modifiedTime,
  noindex = false,
  nofollow = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | TipChain` : DEFAULT_SEO.title;
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://tipchain.aipop.fun');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {author && <meta name="author" content={author} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots Meta */}
      {(noindex || nofollow) && (
        <meta
          name="robots"
          content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`}
        />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      <meta property="og:site_name" content="TipChain" />
      <meta property="og:locale" content="en_US" />

      {/* Article specific */}
      {ogType === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {keywords.map((keyword) => (
            <meta key={keyword} property="article:tag" content={keyword} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}

      {/* Default Schema.org Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'TipChain',
          description: DEFAULT_SEO.description,
          url: 'https://tipchain.aipop.fun',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          creator: {
            '@type': 'Organization',
            name: 'TipChain',
            url: 'https://tipchain.aipop.fun',
          },
        })}
      </script>
    </Helmet>
  );
}
