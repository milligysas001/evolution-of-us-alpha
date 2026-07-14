const nextConfig = {
  // `npm run build` already performs an explicit TypeScript check.
  // Avoid running the same validation twice inside Next.js.
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
