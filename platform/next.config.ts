import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // جذر مساحة العمل = platform/ (توجد lockfiles متعددة في المستودع)
  outputFileTracingRoot: path.join(__dirname, "./"),
};

export default nextConfig;
