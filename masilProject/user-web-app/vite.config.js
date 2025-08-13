import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/map-geocode'로 시작하는 요청을 Naver API로 전달합니다.
      '/map-geocode': {
        target: 'https://maps.apigw.ntruss.com',
        changeOrigin: true,
      },
    },
  },
})
