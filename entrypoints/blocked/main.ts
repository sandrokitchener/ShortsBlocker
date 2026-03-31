import { browser } from 'wxt/browser';

import '~/assets/ui.css';

const versionNode = document.querySelector<HTMLElement>('#version');
const closeButton = document.querySelector<HTMLButtonElement>('#close-tab');

if (versionNode) {
  versionNode.textContent = browser.runtime.getManifest().version;
}

closeButton?.addEventListener('click', () => {
  window.close();
});
