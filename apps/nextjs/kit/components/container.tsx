import type { PropsWithChildren } from 'react'

import Link from 'next/link'

export const Container = ({ children }: PropsWithChildren) => (
  <div className="max-w-7xl mx-auto px-0 md:px-22 p-6 md:p-12">
    <Link
      href="/"
      title="戻る"
      className="fixed top-0 left-0 z-50 w-24 h-24 bg-linear-to-br from-gray-300 to-gray-500 text-gray-900 font-bold shadow-[2px_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[3px_3px_12px_rgba(0,0,0,0.4)] hover:brightness-110 active:brightness-95 transition-all duration-150 flex items-center justify-center [clip-path:polygon(0_0,100%_0,0_100%)]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7 -translate-x-5 -translate-y-5"
      >
        <title>Home</title>
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
      </svg>
    </Link>
    <div className="mx-4 md:mx-0">{children}</div>
  </div>
)
