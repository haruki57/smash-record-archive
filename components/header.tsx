import Link from "next/link";
import GoogleAnalytics from "./ga";
import Head from "next/head";

export default function Header() {
  return (
    <>
      <Head>
        <GoogleAnalytics />
      </Head>
      <header className="bg-gray-200">
        <nav className=" mx-auto flex max-w-7xl items-center justify-between py-2 px-8">
          <div className="flex lg:flex-1 font-bold">
            <Link href="/">Smash Record Archive</Link>
          </div>
          <div className="flex gap-x-12">
            <Link href="/tournaments" className="text-m leading-6">
              Tournaments
            </Link>
            <Link href="/about" className="text-m leading-6">
              About
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
