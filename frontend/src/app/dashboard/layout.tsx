'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, Car, UserCircle, Settings, 
  Info, ShoppingCart, LogOut, MenuIcon, X 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState<{ role: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
    }
    // Aquí podrías decodificar el token JWT para obtener el rol del usuario
    // Por ahora usaremos un valor de ejemplo
    setUser({ role: 'admin' })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/auth/login')
  }

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: '/dashboard',
      roles: ['admin', 'empleado']
    },
    {
      title: 'Clientes',
      icon: <UserCircle className="w-4 h-4" />,
      href: '/dashboard/clientes',
      roles: ['admin', 'empleado']
    },
    {
      title: 'Usuarios',
      icon: <Users className="w-4 h-4" />,
      href: '/dashboard/usuarios',
      roles: ['admin']
    },
    {
      title: 'Espacios',
      icon: <Car className="w-4 h-4" />,
      href: '/dashboard/espacios',
      roles: ['admin', 'empleado']
    },
    {
      title: 'Ventas',
      icon: <ShoppingCart className="w-4 h-4" />,
      href: '/dashboard/ventas',
      roles: ['admin', 'empleado']
    },
    {
      title: 'Caja',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      href: '/dashboard/caja',
      roles: ['admin', 'empleado']
    },
    {
      title: 'Configuración',
      icon: <Settings className="w-4 h-4" />,
      href: '/dashboard/configuracion',
      roles: ['admin']
    },
    {
      title: 'Acerca de',
      icon: <Info className="w-4 h-4" />,
      href: '/dashboard/acerca',
      roles: ['admin', 'empleado']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar para pantallas grandes */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800 border-r">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Parqueamiento</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              item.roles.includes(user?.role || '') && (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              )
            ))}
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-3">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Botón de menú para móviles */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <MenuIcon className="h-4 w-4" />
      </Button>

      {/* Contenido principal */}
      <main className={`transition-all duration-200 ease-in-out ${
        isSidebarOpen ? 'lg:ml-64' : ''
      } p-4`}>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          {children}
        </div>
      </main>
    </div>
  )
}
