import { pagesConfig } from '@/pages.config';

export function createPageUrl(pageName: string) {
    const { Pages, mainPage } = pagesConfig;
    const [rawBase, query = ''] = pageName.split('?');
    const base = rawBase.trim();
    const pageKeys = Object.keys(Pages);
    const matchedKey = pageKeys.find((key) => key.toLowerCase() === base.toLowerCase());
    const finalKey = matchedKey ?? base;
    const path = finalKey === mainPage ? '/' : `/${finalKey.replace(/ /g, '-')}`;
    return query ? `${path}?${query}` : path;
}
