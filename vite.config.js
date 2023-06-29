import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), topLevelAwait(), wasm()],
    // This is only necessary if you are using `SharedWorker` or `WebWorker`, as 
    // documented in https://vitejs.dev/guide/features.html#import-with-constructors
  worker: { 
      format: "es",
      plugins: [topLevelAwait(), wasm()] 
  },

  optimizeDeps: {
      // This is necessary because otherwise `vite dev` includes two separate
      // versions of the JS wrapper. This causes problems because the JS
      // wrapper has a module level variable to track JS side heap
      // allocations, initializing this twice causes horrible breakage
      exclude: ["@automerge/automerge-wasm"]
  },

  server: {
    proxy: {
      // 接口地址代理
      '/image': {
        target: 'http://xxxx', // 接口的域名
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        // rewrite: path => path.replace(/^\/demo/, '/demo')
      },
    }
  }
})
