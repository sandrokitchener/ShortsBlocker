import { defineExtensionMessaging } from '@webext-core/messaging';

import type { PageState } from './types';

export interface ExtensionProtocolMap {
  reportPageState(data: PageState): void;
  getActiveTabState(data: null): PageState | null;
  rescanActiveTab(data: null): PageState | null;
  scanNow(data: null): PageState;
}

export const { onMessage, sendMessage } =
  defineExtensionMessaging<ExtensionProtocolMap>();
