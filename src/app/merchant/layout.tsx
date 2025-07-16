import React from 'react';
import { FaGamepad, FaWallet, FaServer } from 'react-icons/fa';
import DashboardLayout, { SidebarLink } from '@/components/layouts/DashboardLayout';

const links: SidebarLink[] = [
  { href: '/merchant', label: 'Мои сервера', icon: <FaServer /> },
  { href: '/merchant/earnings', label: 'Доход', icon: <FaWallet /> },
  { href: '/merchant/games', label: 'Игры', icon: <FaGamepad /> },
];

export default function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout links={links}>{children}</DashboardLayout>;
}
