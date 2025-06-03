import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Esto es útil si usas imágenes remotas también
    domains: ["unpkg.com", "cdn.jsdelivr.net"],
  },
  webpack(config) {
    // Permite importar archivos PNG (usado por leaflet para íconos)
    config.module.rules.push({
      test: /\.png$/,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next/static/images/",
            outputPath: "static/images/",
            name: "[name].[hash].[ext]",
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
