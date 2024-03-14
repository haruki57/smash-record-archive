import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <hr />
      <div className="mx-auto flex max-w-7xl items-center justify-center py-6 px-8 text-gray-500">
        <div>
          Developed By{" "}
          <a
            href="https://twitter.com/harukisb"
            className="text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            @harukisb
          </a>
        </div>
        {/* <div className="flex lg:flex-1 font-bold">
          <Link href="/">Smash Record Archive</Link>
        </div>
        <div className="flex gap-x-12">
          <Link href="/tournaments" className="text-m leading-6">
            トーナメント一覧
          </Link>
          <Link href="/about" className="text-m leading-6">
            About
          </Link>
        </div> */}
      </div>
    </footer>
  );
}
