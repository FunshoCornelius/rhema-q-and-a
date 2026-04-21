// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      server: {
        preset: 'vercel',
        vercel: {
          functions: {
            runtime: 'bun1.x',
          },
        },
      },
    }),
    viteReact(),
  ],
})
