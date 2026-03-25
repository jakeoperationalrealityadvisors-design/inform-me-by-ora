import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminLayout from './AdminLayout';
import UserLayout from './UserLayout';

export default function RoleRouter({ children }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#070b14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <UserLayout>{children}</UserLayout>;
}