import '~/assets/ui.css';

import { sendMessage } from '~/utils/messaging';
import { siteLabels } from '~/utils/types';
import type { PageState } from '~/utils/types';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('Popup root not found.');
}

const popupRoot = appRoot;

render(null, true);
void refresh();

async function refresh() {
  const state = await sendMessage('rescanActiveTab', null);
  render(state, false);
}

function render(state: PageState | null, isLoading: boolean) {
  popupRoot.innerHTML = `
    <main class="p-4">
      <section class="uk-card uk-card-default uk-card-body rounded-[28px] border border-slate-200/70 bg-white/95 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.45)]">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="uk-text-meta !m-0 uppercase tracking-[0.2em] text-amber-700">No More Reels</p>
            <h1 class="mt-2 text-2xl font-semibold leading-tight text-slate-900">Short videos stay out of the way.</h1>
          </div>
          <span class="uk-label rounded-full bg-amber-300 text-slate-900">MVP</span>
        </div>
        <div class="mt-5 rounded-3xl bg-slate-950 px-4 py-5 text-white">
          <p class="m-0 text-sm uppercase tracking-[0.18em] text-slate-400">Active tab</p>
          <p class="mt-2 text-3xl font-semibold">${isLoading ? '...' : formatCount(state)}</p>
          <p class="mt-2 text-sm text-slate-300">${formatStatus(state, isLoading)}</p>
        </div>
        <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <dt class="text-slate-500">Site</dt>
            <dd class="mt-1 font-medium text-slate-900">${state ? siteLabels[state.site] : 'Not detected'}</dd>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <dt class="text-slate-500">Last scan</dt>
            <dd class="mt-1 font-medium text-slate-900">${state ? new Date(state.lastScanAt).toLocaleTimeString() : 'Waiting'}</dd>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <dt class="text-slate-500">Hidden surfaces</dt>
            <dd class="mt-1 font-medium text-slate-900">${state ? state.hiddenCount : 0}</dd>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <dt class="text-slate-500">Placeholders</dt>
            <dd class="mt-1 font-medium text-slate-900">${state ? state.placeholderCount : 0}</dd>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <dt class="text-slate-500">Guarded links</dt>
            <dd class="mt-1 font-medium text-slate-900">${state ? state.guardedLinkCount : 0}</dd>
          </div>
        </dl>
        <div class="mt-5 flex flex-wrap gap-3">
          <button id="rescan" class="uk-button uk-button-secondary rounded-full normal-case">Rescan tab</button>
          <a class="uk-button uk-button-default rounded-full normal-case" href="https://github.com/sandrokitchener" target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <p class="mt-4 text-sm leading-6 text-slate-600">
          Built with WXT, TypeScript, Tailwind, UIkit, and typed extension messaging. Current heuristics target YouTube Shorts, Instagram and Facebook Reels, plus LinkedIn video-feed modules.
        </p>
      </section>
    </main>
  `;

  const rescanButton = document.querySelector<HTMLButtonElement>('#rescan');
  rescanButton?.addEventListener('click', async () => {
    render(state, true);
    const nextState = await sendMessage('rescanActiveTab', null);
    render(nextState, false);
  });
}

function formatCount(state: PageState | null) {
  if (!state) {
    return 'No data yet';
  }

  return `${state.placeholderCount} placeholders`;
}

function formatStatus(state: PageState | null, isLoading: boolean) {
  if (isLoading) {
    return 'Running a fresh scan on the active tab and checking navigation guards.';
  }

  if (!state) {
    return 'Open a supported site, then reload that tab once after installing the extension so the content script can start reporting in.';
  }

  return `${siteLabels[state.site]} detected on ${escapeHtml(state.hostname)}. Counts are heuristic, not a guarantee that every short-video surface was blocked.`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
