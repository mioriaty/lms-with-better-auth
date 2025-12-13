'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/libs/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/libs/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/libs/components/ui/sidebar';
import { useLogout } from '@/libs/hooks/use-logout';
import { authClient } from '@/libs/utils/auth-client';
import { BookIcon, HomeIcon, LayoutDashboardIcon, LogOutIcon, MoreVerticalIcon } from 'lucide-react';
import Link from 'next/link';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session, isPending } = authClient.useSession();
  const handleLogout = useLogout();

  if (isPending) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={session?.user.image ?? `https://avatar.vercel.sh/${session?.user.email}`}
                  alt={session?.user.email ?? ''}
                />
                <AvatarFallback className="rounded-lg">
                  {session?.user.name && session.user.name.length > 0
                    ? session.user.name.charAt(0).toUpperCase()
                    : session?.user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {session?.user.name && session.user.name.length > 0
                    ? session.user.name
                    : session?.user.email.split('@')[0]}
                </span>
                <span className="truncate text-xs text-muted-foreground">{session?.user.email ?? ''}</span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={session?.user.image ?? `https://avatar.vercel.sh/${session?.user.email}`}
                    alt={session?.user.email ?? ''}
                  />
                  <AvatarFallback className="rounded-lg">
                    {session?.user.name && session.user.name.length > 0
                      ? session.user.name.charAt(0).toUpperCase()
                      : session?.user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {session?.user.name && session.user.name.length > 0
                      ? session.user.name
                      : session?.user.email.split('@')[0]}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{session?.user.email ?? ''}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/" className="space-x-1">
                  <HomeIcon size={18} aria-hidden="true" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/admin" className="space-x-1">
                  <LayoutDashboardIcon size={18} aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/admin/courses" className="space-x-1">
                  <BookIcon size={18} aria-hidden="true" />
                  <span>Courses</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem className="space-x-1" onClick={handleLogout}>
              <LogOutIcon size={18} aria-hidden="true" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
