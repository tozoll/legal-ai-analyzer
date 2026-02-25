import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: tüm bağımlılıkları .next/standalone/ altında toplar.
  // Docker deploy için idealdir — node_modules kopyalamaya gerek kalmaz.
  output: "standalone",
};

export default nextConfig;
