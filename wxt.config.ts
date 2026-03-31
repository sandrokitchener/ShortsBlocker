import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'No More Reels',
    description:
      'Blocks or strips short-form video surfaces like Shorts, Reels, and LinkedIn video modules before they can pull you in.',
    permissions: ['declarativeNetRequest'],
    host_permissions: [
      '*://*.youtube.com/*',
      '*://*.instagram.com/*',
      '*://*.facebook.com/*',
      '*://*.linkedin.com/*',
    ],
    declarative_net_request: {
      rule_resources: [
        {
          id: 'block-short-routes',
          enabled: true,
          path: 'rules.json',
        },
      ],
    },
    web_accessible_resources: [
      {
        resources: ['blocked.html', 'assets/*'],
        matches: ['<all_urls>'],
      },
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
