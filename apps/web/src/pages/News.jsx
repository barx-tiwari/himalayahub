import { Link, useParams } from 'react-router-dom';
import { Flame, TrendingUp } from 'lucide-react';
import NewsCard from '../components/news/NewsCard';
import LiveDataRefresh from '../components/live/LiveDataRefresh';
import DataState from '../components/live/DataState';
import Skeleton from '../components/live/Skeleton';
import { useLiveDataRefresh } from '../hooks/useLiveDataRefresh';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getNews, getMostRead, recentOnly, trendingTopics } from '../services/newsService';
import { REFRESH } from '../services/config';
import { relativeTime } from '../services/timezoneService';
import { getNewsCategory, newsCategories } from '../data/newsCategories';
import NotFound from './NotFound';

function SideFeed({ category, title }) {
  const feed = useLiveDataRefresh(`news:${category}`, () => getNews(category), { interval: REFRESH.news.base });
  return (
    <section className="card" aria-labelledby={`side-${category}`}>
      <div className="row-between"><h2 id={`side-${category}`} className="card-title">{title}</h2><Link to={`/news/${category}`} className="small">View all</Link></div>
      <DataState feed={feed} compact emptyText="No stories right now.">
        {(items) => (
          <ul className="news-list">
            {items.slice(0, 5).map((it) => (
              <li key={it.id}><a href={it.url} target="_blank" rel="noopener noreferrer nofollow"><span />
                <span>{it.title}<small>{it.source} · {relativeTime(it.publishedAt)}</small></span></a></li>
            ))}
          </ul>
        )}
      </DataState>
    </section>
  );
}

export default function News() {
  const { category = 'latest' } = useParams();
  const cat = getNewsCategory(category);
  useDocumentTitle(cat ? `${cat.label} News` : 'News');
  const feed = useLiveDataRefresh(`news:${category}`, () => getNews(category), { interval: REFRESH.news.base, enabled: Boolean(cat) });
  if (!cat) return <NotFound />;
  const mostRead = getMostRead(5);

  return (
    <div className="container page" data-domain="news">
      <header className="page-header">
        <h1>{category === 'latest' ? 'Live News' : `${cat.label} News`}</h1>
        <p>Headlines from Nepali and international publishers, with the source and publication time on every story. Stories open on the publisher&apos;s site.</p>
      </header>

      <nav aria-label="News categories" className="chip-tabs" style={{ marginBottom: 16 }}>
        {newsCategories.map((c) => (
          <Link key={c.id} to={c.id === 'latest' ? '/news' : `/news/${c.id}`} aria-current={c.id === category ? 'page' : undefined}>{c.label}</Link>
        ))}
      </nav>
      <LiveDataRefresh feed={feed} sourceLabel="News sources" updatedLabel="Updated" className="card-flat" />
      {feed.meta?.failedSources?.length > 0 && <p className="src-note" style={{ marginTop: 6 }}>Not reachable right now: {feed.meta.failedSources.join(', ')}.</p>}

      <div className="news-layout" style={{ marginTop: 16 }}>
        <div>
          <DataState feed={feed} skeleton={<Skeleton cards={6} label="Loading news" />} emptyText="No stories match this category right now. Try Latest or refresh in a few minutes.">
            {(items) => {
              const breaking = category === 'latest' ? recentOnly(items, 60) : [];
              const [lead, ...rest] = items;
              return (
                <>
                  {breaking.length > 0 && (
                    <section className="card breaking" aria-labelledby="breaking-title" style={{ marginBottom: 16 }}>
                      <h2 id="breaking-title" className="card-title"><Flame size={18} aria-hidden="true" style={{ verticalAlign: '-3px', color: 'var(--c-red)' }} /> Breaking News</h2>
                      <p className="src-note" style={{ marginBottom: 8 }}>Stories published in the last hour.</p>
                      <ul className="news-list">
                        {breaking.slice(0, 4).map((it) => <li key={it.id}><a href={it.url} target="_blank" rel="noopener noreferrer nofollow"><span />
                          <span>{it.title}<small>{it.source} · {relativeTime(it.publishedAt)}</small></span></a></li>)}
                      </ul>
                    </section>
                  )}
                  <h2 className="sr-only">Latest News</h2>
                  {lead && <div style={{ marginBottom: 16 }}><NewsCard item={lead} lead headingLevel={3} /></div>}
                  <div className="news-grid">{rest.map((it) => <NewsCard key={it.id} item={it} />)}</div>
                </>
              );
            }}
          </DataState>
        </div>

        <aside className="stack" aria-label="More news">
          <section className="card" aria-labelledby="trend-title">
            <h2 id="trend-title" className="card-title"><TrendingUp size={18} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> Trending</h2>
            {feed.data?.length ? (() => {
              const topics = trendingTopics(feed.data);
              return topics.length ? (
                <>
                  <div className="topic-cloud">{topics.map((t) => <Link key={t.word} to={`/search?q=${encodeURIComponent(t.word)}`} className="chip chip-domain">{t.word} · {t.count}</Link>)}</div>
                  <p className="src-note" style={{ marginTop: 8 }}>Words that appear across the most current headlines in this section.</p>
                </>
              ) : <p className="small muted" style={{ margin: 0 }}>No topic is repeating across headlines yet.</p>;
            })() : <p className="small muted" style={{ margin: 0 }}>Appears once headlines load.</p>}
          </section>
          <section className="card" aria-labelledby="mostread-title">
            <h2 id="mostread-title" className="card-title">Most Read</h2>
            {mostRead.length ? (
              <ol className="news-list">
                {mostRead.map((r, i) => <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer nofollow"><span className="rank">{i + 1}</span><span>{r.title}<small>{r.source}</small></span></a></li>)}
              </ol>
            ) : <p className="small muted" style={{ margin: 0 }}>Stories you open will be ranked here.</p>}
            <p className="src-note" style={{ marginTop: 8 }}>Based only on stories opened on this device. Nothing is tracked or sent anywhere.</p>
          </section>
          {category !== 'sports' && <SideFeed category="sports" title="Sports News" />}
          {category !== 'technology' && <SideFeed category="technology" title="Technology News" />}
        </aside>
      </div>
    </div>
  );
}
