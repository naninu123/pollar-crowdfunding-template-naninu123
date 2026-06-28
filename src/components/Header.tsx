'use client';

import Link from 'next/link';
import { usePollar } from '@pollar/react';

export default function Header() {
  const { connect, isConnected, address, disconnect } = usePollar();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Pollar</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Campaigns
            </Link>
            <Link href="/campaign/new" className="text-gray-600 hover:text-gray-900 transition-colors">
              Create
            </Link>
          </nav>

          {isConnected ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}