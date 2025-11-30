'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/libs/components/ui/avatar';
import { Button } from '@/libs/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/libs/components/ui/dropdown-menu';
import { authClient } from '@/libs/utils/auth-client';
import { BookOpenIcon, HomeIcon, LayoutDashboardIcon, LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserDropdownProps {
  name: string;
  email: string;
  image: string;
}

const UserDropdown = ({ name, email, image }: UserDropdownProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          toast.success('Logged out successfully');
        },
        onError: (error) => {
          toast.error(error.error.message);
        }
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-auto p-0 hover:bg-transparent rounded-full">
          <Avatar className="size-9">
            <AvatarImage src={image} alt={name} className="object-cover" />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="center">
        <DropdownMenuLabel className="flex flex-col min-w-0">
          <span className="text-foreground truncate text-sm font-medium">{name}</span>
          <span className="text-muted-foreground truncate text-xs font-normal">{email}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="space-x-2" asChild>
            <Link href="/">
              <HomeIcon size={16} className="opacity-60" aria-hidden="true" />
              <span className="text-popover-foreground">Home</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="space-x-2" asChild>
            <Link href="/courses">
              <BookOpenIcon size={16} className="opacity-60" aria-hidden="true" />
              <span className="text-popover-foreground">Courses</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="space-x-2" asChild>
            <Link href="/dashboard">
              <LayoutDashboardIcon size={16} className="opacity-60" aria-hidden="true" />
              <span className="text-popover-foreground">Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="space-x-2" onClick={handleLogout}>
            <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
            <span className="text-popover-foreground">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
