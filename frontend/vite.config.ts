/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Em desenvolvimento a API roda no Spring (porta 8080). O proxy mantém tudo na mesma origem,
// como em produção, onde o front é servido pelo próprio .jar
const api = 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/medicos': api,
      '/clientes': api,
      '/swagger-ui': api,
      '/v3': api,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    restoreMocks: true,
  },
})
