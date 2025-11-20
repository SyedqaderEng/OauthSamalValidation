import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

async function DashboardNav() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-500 bg-clip-text text-transparent">
          MockAuth
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/dashboard/oauth" className="text-gray-300 hover:text-white transition">
            OAuth Apps
          </Link>
          <Link href="/dashboard/saml" className="text-gray-300 hover:text-white transition">
            SAML Environments
          </Link>
          <Link href="/dashboard/tools" className="text-gray-300 hover:text-white transition">
            Tools
          </Link>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="text-gray-400 text-sm">
            {session.user.email}
          </div>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="text-gray-400 hover:text-white transition text-sm">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background Animation */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-20">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-gradient-to-r from-pink-600/50 to-transparent top-[-200px] right-[-200px]"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[120px] bg-gradient-to-r from-purple-600/50 to-transparent bottom-[-200px] left-[-200px]"></div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DashboardNav />
      </Suspense>

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
