import { useEffect } from 'react';
import { BRAND } from '../data/site';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND.name}` : BRAND.seoTitle;
  }, [title]);
}
