import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        root: './root.html',
        new: './new.html',
        projects: './projects.html',
        project: './project.html'
      }
    }
  }
})
