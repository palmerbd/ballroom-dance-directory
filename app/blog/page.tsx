import { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/wordpress";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Dance Tips & Guides | Ballroom Dance Directory Blog",
  description:
    "Expert advice on private dance lessons, studio costs, dance styles, and finding the right instructor near you. Your guide to the world of ballroom and Latin dance.",
  alternates: { canonical: "https://www.ballroomdancedirectory.com/blog" },
  openGraph: {
    title: "Dance Tips & Guides | Ballroom Dance Directory",
    description:
      "Expert advice on private dance lessons, studio costs, dance styles, and finding the right instructor near you.",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts(12);

  return (
    <main>
      {/* Hero */}
      <section
        className="py-16 px-6"
        style={{ background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Dance Knowledge Hub
          </p>
          <h1
            className="font-display text-white font-bold mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            Tips, Guides &amp; Dance Advice
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Everything you need to find the right studio, understand lesson costs,
            and choose the dance style that fits your goals.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No posts yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden
                             hover:shadow-lg hover:border-amber-300 transition-all group"
                >
                  {/* Placeholder image strip */}
                  <div
                    className="h-40 flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #0c1428 0%, #1a2d5a 100%)",
                    }}
                  >
                    {post.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">💃</span>
                    )}
                  </div>

                  <div className="p-5">
                    {post.categories.length > 0 && (
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
                        {post.categories[0]}
                      </p>
                    )}
                    <h2 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-amber-800 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{formatDate(post.date)}</span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA — find a studio */}
      <section className="py-14 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to find a studio near you?
          </h2>
          <p className="text-gray-500 mb-6">
            Browse 4,000+ private dance studios across the country — from
            independent instructors to nationally recognised chains.
          </p>
          <Link
            href="/studios"
            className="inline-block px-8 py-3 rounded-full font-bold text-white transition-colors"
            style={{ background: "#c9a227" }}
          >
            Browse Studios
          </Link>
        </div>
      </section>
    </main>
  );
}
