// Quick test of import.meta.glob
const modules = import.meta.glob('/content/**/*.mdx', { eager: true, query: '?raw' });
console.log('Found MDX modules:', Object.keys(modules).length);
console.log('Sample paths:', Object.keys(modules).slice(0, 3));
