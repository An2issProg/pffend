'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/superadmin');

  return (
    <>
      {!isAdminPage && <Navbar />}
      <main className={!isAdminPage ? "pt-20" : ""}>{children}</main>
    </>
  )
}
