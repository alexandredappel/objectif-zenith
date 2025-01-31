import { Calendar, Grid, Home, List } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const navigationItems = [
  { icon: Home, label: "Tableau de bord", path: "/" },
  { icon: Grid, label: "Objectifs du jour", path: "/daily" },
  { icon: List, label: "Objectifs périodiques", path: "/periods" },
  { icon: Calendar, label: "Calendrier", path: "/calendar" },
]

export const DesktopNavigation = () => {
  const location = useLocation()

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold px-4">Objectifs</h2>
      </div>
      <nav className="space-y-1">
        {navigationItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === path
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export const MobileNavigation = () => {
  const location = useLocation()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <nav className="flex justify-around">
        {navigationItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center py-3 px-4 ${
              location.pathname === path ? "text-primary" : "text-gray-600"
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}