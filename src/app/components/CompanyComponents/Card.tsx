import React from 'react';

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-xl rounded-xl p-8">
      {children}
    </div>
  );
} 