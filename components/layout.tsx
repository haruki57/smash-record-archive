import Header from "./header";
import Footer from "./footer";
import { GoogleAnalytics } from "@next/third-parties/google";
export const GA_TAG_ID = process.env.NEXT_PUBLIC_GA_ID || "";

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
      <GoogleAnalytics gaId="G-XYZ" />
    </>
  );
}
