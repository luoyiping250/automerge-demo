/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import {resolve} from 'path';
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), topLevelAwait(), wasm()],
  build:{
    lib: {
      entry: resolve(__dirname, './src/OnlineEditor.jsx'),
      name: 'OnlineEditor',
      fileName: 'OnlineEditor',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom']
    }
  },

  server: {
    proxy: {
      // 接口地址代理
      '/image': {
        target: 'http://xxx:8080', // 接口的域名
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        // rewrite: path => path.replace(/^\/demo/, '/demo')
      },
      '/doc': {
        target: 'http://xxx:8080', // 接口的域名
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
      },
    }
  }
})
