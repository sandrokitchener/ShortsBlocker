import type { SupportedSite } from './types';

export interface LinkRule {
  selector: string;
  closestSelectors: string[];
}

export interface SiteConfig {
  id: SupportedSite;
  hostPattern: RegExp;
  directPathPatterns: RegExp[];
  removeSelectors: string[];
  linkRules: LinkRule[];
  textSectionPatterns?: RegExp[];
}

export const supportedMatches = [
  '*://*.youtube.com/*',
  '*://*.instagram.com/*',
  '*://*.facebook.com/*',
  '*://*.linkedin.com/*',
];

const siteConfigs: SiteConfig[] = [
  {
    id: 'youtube',
    hostPattern: /(^|\.)youtube\.com$/i,
    directPathPatterns: [/^\/shorts(\/|$)/i],
    removeSelectors: [
      'ytd-reel-shelf-renderer',
      'ytd-reel-video-renderer',
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytm-shorts-lockup-view-model',
    ],
    linkRules: [
      {
        selector: "a[href='/shorts/'], a[href^='/shorts/']",
        closestSelectors: [
          'ytd-rich-item-renderer',
          'ytd-rich-section-renderer',
          'ytd-video-renderer',
          'ytd-grid-video-renderer',
          'ytd-compact-video-renderer',
          'ytd-reel-item-renderer',
          'ytd-guide-entry-renderer',
          'ytd-mini-guide-entry-renderer',
          'tp-yt-paper-item',
        ],
      },
    ],
  },
  {
    id: 'instagram',
    hostPattern: /(^|\.)instagram\.com$/i,
    directPathPatterns: [/^\/reels?(\/|$)/i],
    removeSelectors: [],
    linkRules: [
      {
        selector: "a[href='/reels/'], a[href^='/reel/'], a[href^='/reels/']",
        closestSelectors: ['article', 'section', 'li', "div[role='presentation']"],
      },
    ],
  },
  {
    id: 'facebook',
    hostPattern: /(^|\.)facebook\.com$/i,
    directPathPatterns: [/^\/reels?(\/|$)/i],
    removeSelectors: [],
    linkRules: [
      {
        selector:
          "a[href*='/reel/'], a[href*='/reels/'], [aria-label='Reels']",
        closestSelectors: ['[role="article"]', 'section', 'li', 'div[data-pagelet]'],
      },
    ],
  },
  {
    id: 'linkedin',
    hostPattern: /(^|\.)linkedin\.com$/i,
    directPathPatterns: [],
    removeSelectors: [],
    linkRules: [],
    textSectionPatterns: [/videos?\s+for\s+you/i, /short-form\s+video/i],
  },
];

export function getSiteConfig(hostname: string): SiteConfig | null {
  return siteConfigs.find((site) => site.hostPattern.test(hostname)) ?? null;
}

export function isDirectShortPath(site: SiteConfig, pathname: string): boolean {
  return site.directPathPatterns.some((pattern) => pattern.test(pathname));
}
