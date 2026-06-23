import type { Metadata } from 'next';
import BackButton from '@/components/BackButton/BackButton';
import BgBlobs from '@/components/BgBlobs/BgBlobs';
import Footer from '@/components/Footer/Footer';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Newsletter – Arpit Agarwala | Fintech Horizon on Substack',
  description:
    'Read my newsletter Fintech Horizon — honest documentation of my ongoing readings and the frameworks I use to solve complex problems in finance and technology.',
  alternates: { canonical: 'https://arpitagarwala.online/newsletter' },
};

// Revalidate every hour so new posts appear quickly without a full redeploy
export const revalidate = 3600;

interface SubstackPost {
  id: number;
  title: string;
  subtitle: string;
  slug: string;
  canonical_url: string;
  post_date: string;
  cover_image: string | null;
  description: string;
  wordcount: number;
  truncated_body_text: string;
}

interface Post {
  title: string;
  subtitle: string;
  link: string;
  excerpt: string;
  pubDate: string;
  thumbnail: string | null;
  readingTime: string;
}

function formatDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return raw;
  }
}

function calcReadingTime(wordcount: number): string {
  const mins = Math.max(1, Math.round(wordcount / 200));
  return `${mins} min read`;
}

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(
      'https://fintechhorizon.substack.com/api/v1/posts?limit=20&offset=0',
      {
        next: { revalidate: 3600 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS reader)',
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) return [];

    const data: SubstackPost[] = await res.json();

    return data.map((post) => ({
      title: post.title,
      subtitle: post.subtitle || '',
      link: post.canonical_url,
      excerpt: post.truncated_body_text
        ? post.truncated_body_text.slice(0, 200) + '…'
        : post.subtitle || '',
      pubDate: formatDate(post.post_date),
      thumbnail: post.cover_image ?? null,
      readingTime: calcReadingTime(post.wordcount ?? 0),
    }));
  } catch {
    return [];
  }
}

export default async function NewsletterPage() {
  const posts = await getPosts();

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', overflowX: 'hidden' }}>
      <BgBlobs color1="rgba(99,102,241,0.15)" color2="rgba(34,211,238,0.12)" />
      <BackButton />

      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1rem 3rem' }}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <div>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                Newsletter
              </div>
              <a
                href="https://fintechhorizon.substack.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.titleLink}
              >
                <h1 className={styles.title}>
                  Fintech Horizon
                  <i className="ri-arrow-right-up-line" style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginLeft: '0.3rem', opacity: 0.6 }} />
                </h1>
              </a>
              <div className={styles.underline} />
            </div>
          </div>
          <p className={styles.subtitle}>
            Honest documentation of my ongoing readings and the frameworks I use to solve
            complex problems in finance and technology. Published on{' '}
            <a
              href="https://fintechhorizon.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.substackLink}
            >
              Substack <i className="ri-external-link-line" style={{ fontSize: '0.75em' }} />
            </a>
            .
          </p>

          {/* Stats row */}
          <div className={styles.statsRow}>
            <div className={styles.statPill}>
              <i className="ri-article-line" />
              <span>{posts.length} {posts.length === 1 ? 'Post' : 'Posts'}</span>
            </div>
            <a
              href="https://fintechhorizon.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.subscribeBtn}
            >
              <i className="ri-mail-add-line" />
              Subscribe Free
              <i className="ri-arrow-right-up-line" style={{ fontSize: '0.8em', opacity: 0.7 }} />
            </a>
          </div>
        </header>

        {/* ── Posts Grid ── */}
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className={styles.grid}>
            {posts.map((post, i) => (
              <PostCard key={post.link} post={post} index={i} />
            ))}
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}

/* ── Post Card ── */
function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Thumbnail */}
      {post.thumbnail ? (
        <div className={styles.thumb}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.thumbnail} alt={post.title} className={styles.thumbImg} />
          <div className={styles.thumbOverlay} />
        </div>
      ) : (
        <div className={styles.thumbFallback}>
          <i className="ri-newspaper-line" />
        </div>
      )}

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.date}>
            <i className="ri-calendar-line" />
            {post.pubDate}
          </span>
          <span className={styles.readTag}>
            <i className="ri-time-line" />
            {post.readingTime}
          </span>
        </div>

        <h2 className={styles.cardTitle}>{post.title}</h2>

        {post.subtitle && (
          <p className={styles.cardSubtitle}>{post.subtitle}</p>
        )}

        {post.excerpt && (
          <p className={styles.cardDesc}>{post.excerpt}</p>
        )}

        <div className={styles.cardFooter}>
          <span className={styles.readMore}>
            Read full post <i className="ri-arrow-right-up-line" />
          </span>
        </div>
      </div>
    </a>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <i className="ri-quill-pen-line" />
      </div>
      <h2 className={styles.emptyTitle}>First post is coming soon!</h2>
      <p className={styles.emptyDesc}>
        Subscribe to Fintech Horizon and be the first to know when I publish.
      </p>
      <a
        href="https://fintechhorizon.substack.com"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.emptyBtn}
      >
        <i className="ri-mail-add-line" />
        Subscribe on Substack
        <i className="ri-arrow-right-up-line" style={{ fontSize: '0.8em', opacity: 0.7 }} />
      </a>
    </div>
  );
}
