import { useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import { relativeTime, formatLocalDateTime } from '../../services/timezoneService';
import { recordRead } from '../../services/newsService';
import { getNewsCategory } from '../../data/newsCategories';

/** One article. All fields were sanitised by newsService; links open the publisher's site. */
export default function NewsCard({ item, lead = false, headingLevel = 3 }) {
  const [imgOk, setImgOk] = useState(Boolean(item.image));
  const H = `h${headingLevel}`;
  const cat = getNewsCategory(item.category)?.label || item.region;
  return (
    <article className={`news-card${lead ? ' news-lead' : ''}${imgOk ? '' : ' no-img'}`}>
      <div className="thumb">
        {imgOk ? <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setImgOk(false)} />
          : <span className="ph" aria-hidden="true"><Newspaper /></span>}
      </div>
      <div className="body">
        <div className="meta">
          <strong>{item.source}</strong>
          {item.publishedAt && <time dateTime={item.publishedAt} title={formatLocalDateTime(item.publishedAt)}>{relativeTime(item.publishedAt)}</time>}
          {cat && <span className="chip chip-domain">{cat}</span>}
        </div>
        <H>{item.title}</H>
        {item.description && <p>{item.description}</p>}
        <div className="foot">
          <a className="btn btn-secondary btn-sm" href={item.url} target="_blank" rel="noopener noreferrer nofollow" onClick={() => recordRead(item)}>
            Read more <ExternalLink aria-hidden="true" /><span className="sr-only"> (opens {item.source} in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}
