import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true
  }
};

export default withBotId(nextConfig);
