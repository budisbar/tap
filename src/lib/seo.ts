import { faqs } from '../components/sections/FAQ';

export const SITE_BASE_URL = 'https://tapncon.online';

export interface RouteSeo {
  title: string;
  description: string;
  canonical: string;
  robots: string;
}

const DEFAULT_ROBOTS = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

export const ROUTE_SEO: Record<string, RouteSeo> = {
  '/': {
    title: 'tap&con — Boost Reviews, Dominate Local Search',
    description: 'Boost Reviews, Dominate Local Search, Effortlessly. Custom NFC cards & boards for instant Google reviews, digital menus, and seamless connections.',
    canonical: `${SITE_BASE_URL}/`,
    robots: DEFAULT_ROBOTS,
  },
  '/studio': {
    title: 'NFC Card & Board Design Studio — tap&con',
    description: 'Customize your NFC business cards and review boards in the tap&con 3D Design Studio. Choose stainless steel, wood, or PVC and add your brand logo.',
    canonical: `${SITE_BASE_URL}/studio`,
    robots: DEFAULT_ROBOTS,
  },
  '/portal': {
    title: 'Client Portal & Saved Designs — tap&con',
    description: 'Access and manage your saved custom NFC card and tabletop review board designs in the tap&con Client Portal.',
    canonical: `${SITE_BASE_URL}/portal`,
    robots: 'noindex, nofollow',
  },
  '/account': {
    title: 'Account Settings — tap&con',
    description: 'Manage your tap&con profile, account preferences, and security settings.',
    canonical: `${SITE_BASE_URL}/account`,
    robots: 'noindex, nofollow',
  },
  '/admin': {
    title: 'Admin Dashboard — tap&con',
    description: 'Internal operations, orders, and CRM dashboard for tap&con.',
    canonical: `${SITE_BASE_URL}/admin`,
    robots: 'noindex, nofollow',
  },
  '/404': {
    title: 'Page Not Found — tap&con',
    description: 'The page you are looking for could not be found. Return to tap&con to explore custom NFC cards and review boards.',
    canonical: `${SITE_BASE_URL}/404`,
    robots: 'noindex, follow',
  },
};

export function normalizeRoutePath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean.startsWith('/admin')) {
    return '/admin';
  }
  return ROUTE_SEO[clean] ? clean : '/404';
}

export function getRouteSeo(pathname: string): RouteSeo {
  const normalized = normalizeRoutePath(pathname);
  return ROUTE_SEO[normalized];
}

export function getStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_BASE_URL}/#website`,
        url: `${SITE_BASE_URL}/`,
        name: 'tap&con',
        alternateName: ['tapncon', 'tapncon.online', 'Tap & Con', 'TapConnect'],
        description: ROUTE_SEO['/'].description,
        publisher: {
          '@id': `${SITE_BASE_URL}/#organization`,
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_BASE_URL}/#organization`,
        name: 'tap&con',
        url: `${SITE_BASE_URL}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_BASE_URL}/favicon-512x512.png`,
          width: 512,
          height: 512,
        },
        email: 'tapncon.info@gmail.com',
        sameAs: ['https://wa.me/351914422906'],
        slogan: 'Boost Reviews, Dominate Local Search, Effortlessly.',
      },
      {
        '@type': 'Product',
        '@id': `${SITE_BASE_URL}/#product`,
        name: 'tap&con Custom NFC Business Cards & Review Boards',
        description: 'Custom NFC cards and tabletop review boards crafted in Stainless Steel, Bamboo & Wood, and Premium PVC for instant Google reviews, digital menus, and contactless connections.',
        image: `${SITE_BASE_URL}/og-image.png`,
        brand: {
          '@type': 'Brand',
          name: 'tap&con',
        },
        material: ['Stainless Steel', 'Bamboo & Wood', 'Premium PVC Plastic'],
        category: 'NFC Business Hardware',
        url: `${SITE_BASE_URL}/studio`,
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_BASE_URL}/#faq`,
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

function setMetaContent(selector: string, content: string) {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.setAttribute('content', content);
  }
}

export function applyRouteSeo(pathname: string) {
  if (typeof document === 'undefined') return;
  const seo = getRouteSeo(pathname);

  document.title = seo.title;
  setMetaContent('meta[name="title"]', seo.title);
  setMetaContent('meta[name="description"]', seo.description);
  setMetaContent('meta[name="robots"]', seo.robots);
  setMetaContent('meta[name="googlebot"]', seo.robots);

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', seo.canonical);
  }

  setMetaContent('meta[property="og:url"]', seo.canonical);
  setMetaContent('meta[property="og:title"]', seo.title);
  setMetaContent('meta[property="og:description"]', seo.description);

  setMetaContent('meta[name="twitter:url"]', seo.canonical);
  setMetaContent('meta[name="twitter:title"]', seo.title);
  setMetaContent('meta[name="twitter:description"]', seo.description);
}
