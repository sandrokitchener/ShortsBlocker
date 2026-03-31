import { browser } from 'wxt/browser';

import '~/assets/ui.css';

const versionNode = document.querySelector<HTMLElement>('#version');
const closeButton = document.querySelector<HTMLButtonElement>('#close-tab');
const targetNode = document.querySelector<HTMLElement>('#target');

if (versionNode) {
  versionNode.textContent = browser.runtime.getManifest().version;
}

const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('target');

if (targetNode && targetUrl) {
  targetNode.textContent = `Intercepted: ${targetUrl}`;
}

closeButton?.addEventListener('click', () => {
  window.close();
});
