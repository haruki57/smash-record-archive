import Header from "./header";
import Footer from "./footer";
import { GoogleAnalytics } from "@next/third-parties/google";
export const GA_TAG_ID = process.env.NEXT_PUBLIC_GA_ID || "";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export default function Layout({
  children,
  noHeader = false,
}: {
  children: any;
  noHeader?: boolean;
}) {
  return (
    <>
      {!noHeader && <Header />}
      <main>{children}</main>
      <Footer />
      <GoogleAnalytics gaId={GA_TAG_ID} />
      <SpeedInsights />
      <Analytics />
    </>
  );
}
