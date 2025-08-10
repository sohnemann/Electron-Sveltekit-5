import adapter from '@sveltejs/adapter-node';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const useStatic = process.env.ADAPTER === 'static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: useStatic
			? adapterStatic({ strict: false })  // 👈 allow non-prerenderable routes
			: adapter()
	}
};

export default config;