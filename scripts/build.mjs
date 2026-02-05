import * as esbuild from 'esbuild';

console.log('Building with Preact...');

try {
  await esbuild.build({
    entryPoints: ['src/main.tsx'],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: 'public/dist/bundle.js',
    alias: {
      'react': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  });
  console.log('Build complete.');
} catch (e) {
  console.error(e);
  process.exit(1);
}
