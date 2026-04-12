import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold text-gray-900 text-lg">
            AutoDeploy
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.github_login}</span>
              {user.avatar_url && (
                <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
              )}
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
