import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="bg-white border-t border-gray-200 py-4 sm:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around">
          <NavItem
            href="/"
            label="Home"
            isActive={location === "/"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </NavItem>
          <NavItem
            href="/history"
            label="History"
            isActive={location === "/history"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </NavItem>
          <NavItem
            href="/"
            label="Snap"
            isActive={false}
            isSnap={true}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </NavItem>
          <NavItem
            href="/insights"
            label="Insights"
            isActive={location === "/insights"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M10 3a7 7 0 1 0 0 14 7 7 0 1 0 0-14Z" />
              <path d="M17 17a5 5 0 1 0 0 10 5 5 0 1 0 0-10Z" />
              <path d="M19.5 14.5 16 18" />
            </svg>
          </NavItem>
          <NavItem
            href="/meal-plans"
            label="Meal Plans"
            isActive={location === "/meal-plans"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
              <path d="M9 21v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
            </svg>
          </NavItem>
          <NavItem
            href="/settings"
            label="Settings"
            isActive={location === "/settings"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </NavItem>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  isActive: boolean;
  isSnap?: boolean;
  children: React.ReactNode;
}

function NavItem({ href, label, isActive, isSnap = false, children }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "p-2 flex flex-col items-center cursor-pointer",
          isActive ? "text-primary" : "text-gray-600 hover:text-primary"
        )}
      >
        {isSnap ? (
          <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center -mt-5 shadow-md">
            {children}
          </div>
        ) : (
          <div className={isActive ? "text-primary" : "text-gray-600"}>
            {children}
          </div>
        )}
        <span className="text-xs mt-1">{label}</span>
      </div>
    </Link>
  );
}
