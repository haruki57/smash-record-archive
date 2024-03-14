import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full ">
      <hr className="w-full" />
      <div className="flex justify-center">
        <div className="mx-auto max-w-7xl py-6 px-8 text-gray-500">
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
        </div>
      </div>
    </footer>
  );
}
