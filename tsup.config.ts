import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts"],
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  minify: true,
});
