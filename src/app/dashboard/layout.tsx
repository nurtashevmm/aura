import React from 'react';
import { FaClock, FaUser, FaHistory } from 'react-icons/fa';
import DashboardLayout, { SidebarLink } from '@/components/layouts/DashboardLayout';

const links: SidebarLink[] = [
  { href: '/dashboard', label: 'Мои сессии', icon: <FaClock /> },
  { href: '/dashboard/history', label: 'История', icon: <FaHistory /> },
  { href: '/dashboard/profile', label: 'Профиль', icon: <FaUser /> },
];

export default function PlayerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout links={links}>{children}</DashboardLayout>;
}
