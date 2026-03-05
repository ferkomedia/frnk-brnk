import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://frnk-brnk.sk',
  output: 'static',
  build: {
    assets: 'assets'
  }
});
