import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  PlaneTakeoff,
  Ticket,
  Users,
  CreditCard,
  Star,
  Settings,
  ScrollText,
  Gift,
  Mail,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const adminNav: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/flights", label: "Flights", icon: PlaneTakeoff },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/gift-cards", label: "Gift Cards", icon: Gift },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/emails", label: "Email Templates", icon: Mail },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
  { href: "/admin/logs", label: "Admin Logs", icon: ScrollText },
];
