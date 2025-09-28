/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Permissions-Policy", value: "camera=(self), xr-spatial-tracking=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
