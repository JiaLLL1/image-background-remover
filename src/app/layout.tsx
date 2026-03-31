import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapBackground - 移除图片背景",
  description: "简单、快速、免费，无需下载安装即可移除图片背景",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
