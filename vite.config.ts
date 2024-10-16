import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		hmr: {
			overlay: false
		},
		port: 3002,
		proxy: {
			'/resourceUsage': {
				target: 'https://s1-ab21b1c9-205-185-116-53.traefik.me',
				changeOrigin: true,
				secure: false
			}
		}
	}
});
