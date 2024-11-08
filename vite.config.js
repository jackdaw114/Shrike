import { defineConfig } from "vite";
import path from 'path';


export default defineConfig({
    server: {
        port: 3000,
    },
    build: {
        rollupOptions: {
            input: {
                editor: path.resolve(__dirname, './src/editor/editor'),
                core: path.resolve(__dirname, './src/core/core')
            }
        }
    },

});
