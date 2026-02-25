import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file if it exists
const envPath = join(__dirname, '../.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  });
}

const basePath = process.env.VITE_BASE_PATH || "/";

const manifest = {
  name: "SG Voucher Manager",
  short_name: "SG Voucher",
  description: "Manage your Singapore vouchers easily",
  icons: [
    {
      src: `${basePath}favicon-16x16.png`,
      sizes: "16x16",
      type: "image/x-icon"
    },
    {
      src: `${basePath}favicon-32x32.png`,
      sizes: "32x32",
      type: "image/x-icon"
    },
    {
      src: `${basePath}favicon.ico`,
      sizes: "48x48",
      type: "image/x-icon"
    },
    {
      src: `${basePath}android-chrome-192x192.png`,
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable"
    },
    {
      src: `${basePath}android-chrome-512x512.png`,
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    }
  ],
  start_url: basePath,
  scope: basePath,
  display: "standalone",
  orientation: "portrait",
  theme_color: "#000000",
  background_color: "#ffffff"
};

const outputPath = join(__dirname, '../public/manifest.webmanifest');
writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

console.log(`✓ Generated manifest.webmanifest with base path: ${basePath}`);
