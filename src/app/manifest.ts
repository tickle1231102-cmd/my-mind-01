import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "마음의 화분 | 감정 힐링 게임",
    short_name: "마음의 화분",
    description:
      "긍정의 말로 식물을 키우고, 부정의 감정을 비워내는 힐링 챗봇 게임",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: "#9caf88",
    icons: [
      {
        src: "/icons/icons_192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icons_512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icons_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
