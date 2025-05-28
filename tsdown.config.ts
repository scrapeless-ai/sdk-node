import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ['es', 'cjs'],
  dts: {
    resolve: true,
  },
});
