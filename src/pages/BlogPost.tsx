import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { getBlogPost } from '@/data/blog-posts';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  useEffect(() => {
    if (post) {
      trackPageView(`/blog/${slug}`);
    }
  }, [post, slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.publishedDate,
    dateModified: post.modifiedDate || post.publishedDate,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TipChain',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tipchain.aipop.fun/api/og/hero',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tipchain.aipop.fun/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
  };

  return (
    <>
      <SEO
        title={post.title}
        description={post.description}
        ogType="article"
        ogImage={post.image}
        keywords={post.keywords}
        author={post.author}
        publishedTime={post.publishedDate}
        modifiedTime={post.modifiedDate}
        canonical={`https://tipchain.aipop.fun/blog/${post.slug}`}
        jsonLd={jsonLd}
      />

      <article className="mx-auto min-h-screen max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Back to Blog */}
        <Link
          to="/blog"
          className="mb-8 inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          {/* Meta */}
          <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
            <time dateTime={post.publishedDate}>
              {new Date(post.publishedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.readTime && (
              <>
                <span>•</span>
                <span>{post.readTime} min read</span>
              </>
            )}
            <span>•</span>
            <span>{post.author}</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-xl leading-relaxed text-gray-600">{post.description}</p>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {post.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-12 overflow-hidden rounded-2xl">
            <img
              src={post.image}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg prose-blue max-w-none">
          {post.content.split('\n').map((paragraph, index) => {
            if (!paragraph.trim()) return null;

            // Handle headers
            if (paragraph.startsWith('## ')) {
              return (
                <h2
                  key={index}
                  className="mb-4 mt-8 text-3xl font-bold text-gray-900"
                >
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }

            if (paragraph.startsWith('### ')) {
              return (
                <h3
                  key={index}
                  className="mb-3 mt-6 text-2xl font-bold text-gray-900"
                >
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }

            // Handle lists
            if (paragraph.startsWith('- ')) {
              return (
                <li
                  key={index}
                  className="ml-6 text-gray-700"
                >
                  {paragraph.replace('- ', '')}
                </li>
              );
            }

            // Handle bold text with ** **
            const formattedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Regular paragraphs
            return (
              <p
                key={index}
                className="mb-4 leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: formattedText }}
              />
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border-2 border-blue-200 bg-blue-50 p-8 text-center">
          <h3 className="mb-3 text-2xl font-bold text-gray-900">
            Ready to Maximize Your Creator Earnings?
          </h3>
          <p className="mb-6 text-lg text-gray-600">
            Join TipChain and keep 99% of what you earn with zero gas fees.
          </p>
          <Link
            to="/become-creator"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Create Free Profile
          </Link>
        </div>

        {/* Share */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="mb-4 text-sm font-semibold text-gray-900">Share this article</p>
          <div className="flex gap-4">
            <ShareButton
              platform="twitter"
              url={`https://tipchain.aipop.fun/blog/${post.slug}`}
              title={post.title}
            />
            <ShareButton
              platform="linkedin"
              url={`https://tipchain.aipop.fun/blog/${post.slug}`}
              title={post.title}
            />
            <ShareButton
              platform="facebook"
              url={`https://tipchain.aipop.fun/blog/${post.slug}`}
              title={post.title}
            />
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Read More Articles
          </Link>
        </div>
      </article>
    </>
  );
}

interface ShareButtonProps {
  platform: 'twitter' | 'linkedin' | 'facebook';
  url: string;
  title: string;
}

function ShareButton({ platform, url, title }: ShareButtonProps) {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const icons = {
    twitter: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    facebook: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  };

  return (
    <a
      href={shareUrls[platform]}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
      aria-label={`Share on ${platform}`}
    >
      {icons[platform]}
    </a>
  );
}
