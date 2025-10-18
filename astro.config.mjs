// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mdx from '@astrojs/mdx';
// import shiki from '@astrojs/markdown-remark';

// https://astro.build/config
export default defineConfig({
    site: 'https://yokose-jin.github.io',
    base: '/mypage',
    integrations: [
        mdx({
                remarkPlugins: [remarkMath],
                rehypePlugins: [rehypeKatex],
                shikiConfig: {
                // theme: "material-theme-palenight",
                theme: "material-theme",
                // theme: "monokai",
                },
            }
        )]
});
