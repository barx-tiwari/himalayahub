/**
 * News categories. The server proxy (api/_lib/feeds.js) maps each id to
 * RSS feeds or keyword filters, so ids here must match there.
 */
export const newsCategories = [
  { id: 'latest', label: 'Latest' },
  { id: 'nepal', label: 'Nepal' },
  { id: 'world', label: 'World' },
  { id: 'politics', label: 'Politics' },
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'ai', label: 'AI & Technology' },
  { id: 'science', label: 'Science' },
  { id: 'education', label: 'Education' },
  { id: 'health', label: 'Health' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'sports', label: 'Sports' },
  { id: 'football', label: 'Football' },
  { id: 'cricket', label: 'Cricket' },
  { id: 'weather', label: 'Weather' },
];
export const getNewsCategory = (id) => newsCategories.find((c) => c.id === id);
