import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default defineConfig((opts) => {
  const { command, mode, ssrBuild } = opts;

  console.log(
    `执行command=${command}，执行mode=${mode}，ssrBuild=${ssrBuild}`,
    JSON.stringify(opts, null, 2)
  );

  if (command === "serve") {
    // dev 独有配置
    return {
      plugins: [react()],
    };
  } else {
    // build 独有配置
    return {
      plugins: [react()],
      build: {
        minify: false,
      },
    };
  }
});
