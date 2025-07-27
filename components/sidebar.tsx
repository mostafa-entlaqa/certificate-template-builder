"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { FileText, TestTube, Users, X, Home, Settings, LogOut, ChevronRight } from "lucide-react"
import { cn } from "../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  user: any
  onSignOut: () => void
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    description: "Main dashboard overview",
  },
  {
    name: "Certificate Templates",
    href: "/templates",
    icon: FileText,
    description: "Manage certificate templates",
  },
  {
    name: "Test Generation",
    href: "/test",
    icon: TestTube,
    description: "Test certificate generation",
  },
  {
    name: "User Management",
    href: "/users",
    icon: Users,
    description: "Manage users and permissions",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Application settings",
  },
]

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const getUserInitials = (user: any) => {
    const name = user.user_metadata?.full_name || user.email
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 rounded-xl p-2.5 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Certificate Builder</h1>
                <p className="text-xs text-gray-500 font-medium">Professional Edition v1.0</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <X className="h-4 w-4 text-gray-600" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className={cn("mb-4", isCollapsed && "hidden")}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Navigation</p>
        </div>

        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 shadow-sm border border-purple-100"
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900",
                  isCollapsed && "justify-center",
                )}
              >
                <div className={cn("flex items-center gap-3 w-full", isCollapsed && "justify-center")}>
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                  )}
                </div>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {!isCollapsed ? (
          <div className="space-y-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full p-3 h-auto rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                      <AvatarImage
                        src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                        alt={user.user_metadata?.full_name || user.email}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                      alt={user.user_metadata?.full_name || user.email}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold text-xs">
                      {getUserInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
}
