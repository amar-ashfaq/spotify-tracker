"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Navbar() {
  const pathname = usePathname(); // gives you the current route
  return (
    <nav className="sticky top-0 z-50 bg-black text-white p-4 flex gap-4">
      <Link
        href="/recently-played"
        className={pathname === "/recently-played" ? "text-green-400" : ""}
      >
        Recently Played
      </Link>
      <Link
        href="/top-tracks"
        className={pathname === "/top-tracks" ? "text-green-400" : ""}
      >
        Top Tracks
      </Link>
    </nav>
  );
}
export default Navbar;
