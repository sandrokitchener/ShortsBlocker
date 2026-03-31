import { browser } from 'wxt/browser';

import '~/assets/content.css';
import { onMessage, sendMessage } from '~/utils/messaging';
import { getSiteConfig, isDirectShortPath, supportedMatches } from '~/utils/sites';
import type { PageState } from '~/utils/types';

export default defineContentScript({
  matches: supportedMatches,
  runAt: 'document_start',
  main() {
    const site = getSiteConfig(window.location.hostname);

    if (!site) {
      return;
    }

    const activeSite = site;

    document.documentElement.dataset.nmrSite = activeSite.id;

    if (isDirectShortPath(activeSite, window.location.pathname)) {
      navigateToBlockedPage(window.location.href);
      return;
    }

    let scheduled = false;
    let lastReportKey = '';

    const runScan = () => {
      removeSelectorMatches(document, activeSite.removeSelectors);
      removeLinkContainers(document, activeSite.linkRules);

      if (activeSite.id === 'linkedin') {
        removeLinkedInVideoModules(document, activeSite.textSectionPatterns ?? []);
      }

      reportState();
    };

    const scheduleScan = () => {
      if (scheduled) {
        return;
      }

      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        runScan();
      });
    };

    onMessage('scanNow', () => {
      runScan();
      return buildPageState(activeSite.id);
    });

    document.addEventListener(
      'click',
      (event) => {
        interceptShortNavigation(event, activeSite);
      },
      true,
    );

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          scheduleScan();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('popstate', scheduleScan, true);
    window.addEventListener('hashchange', scheduleScan, true);
    window.addEventListener('yt-navigate-finish', scheduleScan, true);
    document.addEventListener('readystatechange', scheduleScan, true);

    scheduleScan();

    function reportState() {
      const state = buildPageState(activeSite.id);
      const reportKey = JSON.stringify([state.url, state.hiddenCount, state.site]);

      if (reportKey === lastReportKey) {
        return;
      }

      lastReportKey = reportKey;
      void sendMessage('reportPageState', state);
    }
  },
});

function buildPageState(site: PageState['site']): PageState {
  return {
    site,
    hostname: window.location.hostname,
    url: window.location.href,
    hiddenCount: document.querySelectorAll('[data-nmr-hidden]').length,
    guardedLinkCount: document.querySelectorAll('[data-nmr-guarded]').length,
    directPathBlocked: false,
    lastScanAt: Date.now(),
  };
}

function removeSelectorMatches(root: ParentNode, selectors: string[]) {
  for (const selector of selectors) {
    const matches = root.querySelectorAll(selector);

    for (const match of matches) {
      hideNode(match, 'selector');
    }
  }
}

function removeLinkContainers(
  root: ParentNode,
  rules: Array<{ selector: string; closestSelectors: string[] }>,
) {
  for (const rule of rules) {
    const matches = root.querySelectorAll(rule.selector);

    for (const match of matches) {
      markGuardedLink(match);
      const container = findClosestContainer(match, rule.closestSelectors);
      hideNode(container ?? match, 'link');
    }
  }
}

function removeLinkedInVideoModules(root: ParentNode, patterns: RegExp[]) {
  const candidates = root.querySelectorAll("section, article, aside, div[role='region']");

  for (const candidate of candidates) {
    if (candidate instanceof HTMLElement && candidate.dataset.nmrHidden) {
      continue;
    }

    const text = (candidate.textContent || '').slice(0, 300).toLowerCase();
    const hasVideo = Boolean(candidate.querySelector("video, a[href*='/video/']"));

    if (!hasVideo) {
      continue;
    }

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        hideNode(candidate, 'linkedin-video-module');
        break;
      }
    }
  }
}

function findClosestContainer(node: Element, selectors: string[]) {
  for (const selector of selectors) {
    const container = node.closest(selector);

    if (container) {
      return container;
    }
  }

  return climb(node, 4);
}

function climb(node: Element, steps: number) {
  let current: Element | null = node;

  for (let index = 0; index < steps; index += 1) {
    current = current?.parentElement ?? null;

    if (!current) {
      break;
    }
  }

  return current;
}

function hideNode(node: Element | null, reason: string) {
  if (!(node instanceof HTMLElement) || node.dataset.nmrHidden) {
    return;
  }

  node.dataset.nmrHidden = reason;
}

function markGuardedLink(node: Element) {
  if (node instanceof HTMLElement) {
    node.dataset.nmrGuarded = 'true';
  }
}

function interceptShortNavigation(event: MouseEvent, site: ReturnType<typeof getSiteConfig>) {
  if (!site || event.defaultPrevented) {
    return;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const anchor = target.closest('a[href]');

  if (!(anchor instanceof HTMLAnchorElement)) {
    return;
  }

  let href: URL;

  try {
    href = new URL(anchor.href, window.location.href);
  } catch {
    return;
  }

  if (!isBlockedUrlForSite(site, href)) {
    return;
  }

  anchor.dataset.nmrGuarded = 'true';
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  navigateToBlockedPage(href.toString());
}

function isBlockedUrlForSite(
  site: NonNullable<ReturnType<typeof getSiteConfig>>,
  url: URL,
) {
  const hostnameMatches =
    site.hostPattern.test(url.hostname) || url.hostname === window.location.hostname;

  if (!hostnameMatches) {
    return false;
  }

  return isDirectShortPath(site, url.pathname);
}

function navigateToBlockedPage(targetUrl: string) {
  const blockedUrl = browser.runtime.getURL('/blocked.html');
  const nextUrl = `${blockedUrl}?target=${encodeURIComponent(targetUrl)}`;

  if (window.location.href === nextUrl) {
    return;
  }

  window.location.replace(nextUrl);
}
