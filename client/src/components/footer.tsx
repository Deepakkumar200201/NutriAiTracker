import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Footer() {
  const [location] = useLocation();

  return (
    <div className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Nutri Snap. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy">
              <a className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
            </Link>
            <Link href="/contact">
              <a className="text-sm text-gray-500 hover:text-gray-700">Contact</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
