import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'

// https://vite.dev/config/
export default defineConfig({
  base: isGitHubPages ? '/retro-jrpg-tracker/' : '/',
  plugins: [react()],
})
