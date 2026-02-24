import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    '../../../packages/flappy-nature-game/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal(config) {
    config.base = process.env.STORYBOOK_BASE_PATH || '/';
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@repo/engine': resolve(__dirname, '../../../packages/engine/src'),
      '@repo/flappy-nature-game': resolve(__dirname, '../../../packages/flappy-nature-game/src'),
    };
    config.server = config.server || {};
    config.server.watch = config.server.watch || {};
    config.server.watch.ignored = [
      '!**/packages/engine/src/**',
      '!**/packages/flappy-nature-game/src/**',
    ];
    return config;
  },
};

export default config;
