/**
 * Drop this file at: gadget-shop-admin-panel/src/components/header.tsx
 * (replaces the existing version)
 *
 * Changes:
 * - Dark graphite top bar (matches the mobile app's brand color) instead
 *   of a plain white/background bar, so the admin panel reads as its
 *   own distinct "control room" surface.
 * - Active nav link now uses the amber signal accent with an underline
 *   instead of just a bold weight change.
 * - Added a small "TH" mark + "TechHive Admin" wordmark instead of a
 *   bare Package icon.
 */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleUser, Menu, Moon, Search, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { createClient } from "@/supabase/client";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
];

export const Header = ({ role }: { role?: string }) => {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const navLinks =
    role === "super_admin"
      ? [...NAV_LINKS, { href: "/admin/team", label: "Team" }]
      : NAV_LINKS;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-sidebar-border bg-sidebar px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-6 md:text-sm">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
            TH
          </span>
          <span className="hidden font-semibold text-sidebar-foreground lg:inline">
            TechHive Admin
          </span>
        </Link>
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative pb-1 text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground",
              pathname === href &&
                "font-semibold text-sidebar-foreground after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-full after:bg-primary after:content-['']"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-sidebar-border bg-transparent text-sidebar-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-mono text-xs font-bold text-primary-foreground">
                TH
              </span>
              TechHive Admin
            </Link>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn("hover:text-foreground text-muted-foreground", {
                  "text-foreground font-bold": pathname === href,
                })}
              >
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
            <Input
              type="search"
              placeholder="Search products, orders..."
              className="border-sidebar-border bg-sidebar-accent pl-8 text-sidebar-foreground placeholder:text-sidebar-foreground/50 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-sidebar-accent text-sidebar-foreground"
            >
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            <DropdownMenuItem asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full" variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
