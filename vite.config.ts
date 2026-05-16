import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// Conditionally load MeDo plugin (only available in MeDo environment)
let miaodaDevPlugin: any = null;
try {
  const mod = await import("miaoda-sc-plugin");
  miaodaDevPlugin = mod.miaodaDevPlugin;
} catch {
  // Not in MeDo environment, skip
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    ...(miaodaDevPlugin ? [miaodaDevPlugin()] : []),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
