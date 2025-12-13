'use client';

import { NavMain } from '@/libs/components/dashboard-sidebar/nav-main';
import { NavSecondary } from '@/libs/components/dashboard-sidebar/nav-secondary';
import { NavUser } from '@/libs/components/dashboard-sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/libs/components/ui/sidebar';
import {
  BarChartIcon,
  BookIcon,
  CameraIcon,
  FileCodeIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboardIcon
    },
    {
      title: 'Courses',
      url: '/admin/courses',
      icon: BookIcon
    },
    {
      title: 'Analytics',
      url: '#',
      icon: BarChartIcon
    },
    {
      title: 'Projects',
      url: '#',
      icon: FolderIcon
    },
    {
      title: 'Team',
      url: '#',
      icon: UsersIcon
    }
  ],
  navClouds: [
    {
      title: 'Capture',
      icon: CameraIcon,
      isActive: true,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    },
    {
      title: 'Proposal',
      icon: FileTextIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    },
    {
      title: 'Prompts',
      icon: FileCodeIcon,
      url: '#',
      items: [
        {
          title: 'Active Proposals',
          url: '#'
        },
        {
          title: 'Archived',
          url: '#'
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '#',
      icon: SettingsIcon
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircleIcon
    },
    {
      title: 'Search',
      url: '#',
      icon: SearchIcon
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <Image src="/icon.png" alt="Logo" width={20} height={20} className="size-5" />
                <span className="text-base font-semibold">LMS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
