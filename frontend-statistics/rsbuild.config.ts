import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    template: './index.html',
  },
  server: {
    port: 3000,
  },
  output: {
    distPath: {
      root: 'dist',
    },
  },
});

