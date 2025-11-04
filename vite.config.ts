import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/dead-cells-route-planner/',
  plugins: [
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ['leader-line', 'anim-event']
  },
})