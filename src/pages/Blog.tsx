import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { getAllBlogPosts } from '@/data/blog-posts';
import type { BlogPost } from '@/types/seo';

export function Blog() {
  const posts = getAllBlogPosts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'TipChain Blog',
    description: 'Insights on crypto tipping, creator economy, and Web3 monetization',
    url: 'https://tipchain.aipop.fun/blog',
    publisher: {
      '@type': 'Organization',
      name: 'TipChain',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tipchain.aipop.fun/api/og/hero',
      },
    },
    blogPost: posts.map((post) => ({
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
      url: `https://tipchain.aipop.fun/blog/${post.slug}`,
    })),
  };

  return (
    <>
      <SEO
        title="Blog - Creator Economy Insights & Web3 Tips"
        description="Learn about crypto tipping, creator monetization strategies, Web3 platforms, and the future of the creator economy. Expert insights and real case studies."
        keywords={[
          'crypto tipping blog',
          'creator economy insights',
          'Web3 creator tips',
          'blockchain monetization',
          'TipChain blog',
        ]}
        jsonLd={jsonLd}
      />

      <div className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">
            Creator Economy Insights
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Expert guides, real case studies, and actionable strategies for maximizing your creator
            earnings with Web3 technology.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-2">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready to Start Earning More?</h2>
          <p className="mb-8 text-xl opacity-90">
            Join thousands of creators who've switched to zero-fee crypto tipping.
          </p>
          <Link
            to="/become-creator"
            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 transition-transform hover:scale-105"
          >
            Create Your Free Profile
          </Link>
        </div>
      </div>
    </>
  );
}

interface BlogPostCardProps {
  post: BlogPost;
}

function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl"
    >
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-8">
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
        </div>

        {/* Title */}
        <h2 className="mb-3 text-2xl font-bold leading-tight text-gray-900 group-hover:text-blue-600">
          {post.title}
        </h2>

        {/* Description */}
        <p className="mb-6 flex-1 text-gray-600">{post.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.keywords.slice(0, 3).map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Read More */}
        <div className="mt-6 flex items-center font-semibold text-blue-600 group-hover:text-blue-700">
          Read Article
          <svg
            className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
