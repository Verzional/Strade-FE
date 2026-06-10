import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-white px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-3xl font-black tracking-tighter text-black uppercase hover:-translate-y-0.5 transition-transform">
          Strade<span className="text-[#EF476F]">.</span>
        </Link>
        
        {/* Main Navigation Links */}
        <div className="hidden md:flex gap-8 font-bold text-black">
          <Link href="/skill" className="hover:text-[#118AB2] transition-colors hover:-translate-y-1 transform">Skill Matching</Link>
          <Link href="/schedules" className="hover:text-[#118AB2] transition-colors hover:-translate-y-1 transform">Schedules</Link>
          <Link href="/chat" className="hover:text-[#118AB2] transition-colors hover:-translate-y-1 transform">Chat</Link>
        </div>

        {/* User / Auth Buttons */}
        <div className="flex gap-4">
          <Link href="/profile" className="px-5 py-2 font-bold text-black border-2 border-black hover:bg-[#06D6A0] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md">
            Profile
          </Link>
          <Link href="/login" className="hidden sm:inline-block px-5 py-2 font-bold text-white bg-black hover:bg-[#EF476F] hover:text-black border-2 border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}