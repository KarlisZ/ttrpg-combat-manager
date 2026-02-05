import * as esbuild from 'esbuild';

console.log('Starting Dev Server with Preact...');

const ctx = await esbuild.context({
  entryPoints: ['src/main.tsx'],
  bundle: true,
  sourcemap: true,
  outfile: 'public/dist/bundle.js',
  alias: {
    'react': 'preact/compat',
    'react-dom/test-utils': 'preact/test-utils',
    'react-dom': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime',
  },
});

await ctx.watch();
console.log('Watching...');

const { host, port } = await ctx.serve({
  servedir: 'public',
});

console.log(`Serving at http://${host || 'localhost'}:${port}`);
