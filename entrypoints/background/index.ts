import { browser } from 'wxt/browser';

import { onMessage, sendMessage } from '~/utils/messaging';
import type { PageState } from '~/utils/types';

const pageStates = new Map<number, PageState>();

export default defineBackground(() => {
  onMessage('reportPageState', ({ data, sender }) => {
    const tabId = sender.tab?.id;

    if (tabId != null) {
      pageStates.set(tabId, data);
    }
  });

  onMessage('getActiveTabState', async () => {
    const tabId = await getActiveTabId();
    return tabId == null ? null : pageStates.get(tabId) ?? null;
  });

  onMessage('rescanActiveTab', async () => {
    const tabId = await getActiveTabId();

    if (tabId == null) {
      return null;
    }

    try {
      const nextState = await sendMessage('scanNow', null, tabId);
      pageStates.set(tabId, nextState);
      return nextState;
    } catch {
      return pageStates.get(tabId) ?? null;
    }
  });

  browser.tabs.onRemoved.addListener((tabId) => {
    pageStates.delete(tabId);
  });
});

async function getActiveTabId(): Promise<number | null> {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return activeTab?.id ?? null;
}
