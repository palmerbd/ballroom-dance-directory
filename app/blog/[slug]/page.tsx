import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getBlogSlugs } from "@/lib/wordpress";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {
    title: "Post Not Found",
    alternates: { canonical: `https://www.ballroomdancedirectory.com/blog` },
  };

  return {
    title: `${post.title} | Ballroom Dance Directory`,
    description: post.excerpt,
    alternates: { canonical: `https://www.ballroomdancedirectory.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "url": `https://www.ballroomdancedirectory.com/blog/${post.slug}`,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Organization",
      "name": "Ballroom Dance Directory",
      "url": "https://www.ballroomdancedirectory.com",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ballroom Dance Directory",
      "url": "https://www.ballroomdancedirectory.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.ballroomdancedirectory.com/logo.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.ballroomdancedirectory.com/blog/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.ballroomdancedirectory.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.ballroomdancedirectory.com/blog",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://www.ballroomdancedirectory.com/blog/${post.slug}`,
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section
        className="py-14 px-6"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">Home</Link>
            <span className="text-white/30 mx-2">/</span>
            <Link href="/blog" className="text-white/50 hover:text-white transition-colors">Blog</Link>
            <span className="text-white/30 mx-2">/</span>
            <span className="text-white/70 line-clamp-1">{post.title}</span>
          </nav>

          {post.categories.length > 0 && (
            <p className="text-amber-400 font-semibold text-xs uppercase tracking-widest mb-3">
              {post.categories[0]}
            </p>
          )}

          <h1
            className="font-display text-white font-bold mb-4 leading-tight"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
          >
            {post.title}
          </h1>

          <p className="text-white/50 text-sm">{formatDate(post.date)}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div
            className="bdd-post-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <style>{`
            .bdd-post-body { color: #374151; font-size: 1.0625rem; line-height: 1.75; }
            .bdd-post-body p  { margin-bottom: 1.25rem; }
            .bdd-post-body h2 { font-size: 1.4rem; font-weight: 700; color: #111827; margin: 2rem 0 0.75rem; }
            .bdd-post-body h3 { font-size: 1.15rem; font-weight: 700; color: #1f2937; margin: 1.5rem 0 0.5rem; }
            .bdd-post-body ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
            .bdd-post-body ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
            .bdd-post-body li { margin-bottom: 0.4rem; }
            .bdd-post-body a  { color: #b45309; text-decoration: none; }
            .bdd-post-body a:hover { text-decoration: underline; }
            .bdd-post-body strong { color: #111827; font-weight: 600; }
            .bdd-post-body blockquote { border-left: 3px solid #e8c560; padding-left: 1rem; margin: 1.5rem 0; color: #6b7280; font-style: italic; }
          `}</style>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <Link
              href="/blog"
              className="text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-14 px-6"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Find a Dance Studio Near You
          </h2>
          <p className="text-white/60 mb-6">
            Browse 4,000+ private dance studios across the US — filter by city,
            style, and more.
          </p>
          <Link
            href="/studios"
            className="inline-block px-8 py-3 rounded-full font-bold text-white transition-colors"
            style={{ background: "#c9a227" }}
          >
            Browse Studios →
          </Link>
        </div>
      </section>
    </main>
  );
}
