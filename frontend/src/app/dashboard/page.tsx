'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, DollarSign, Users } from 'lucide-react'

interface DashboardStats {
  espaciosLibres: number
  espaciosOcupados: number
  ventasHoy: number
  dineroEnCaja: number
  totalClientes: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    espaciosLibres: 0,
    espaciosOcupados: 0,
    ventasHoy: 0,
    dineroEnCaja: 0,
    totalClientes: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Aquí irían las llamadas a la API para obtener las estadísticas
        // Por ahora usaremos datos de ejemplo
        setStats({
          espaciosLibres: 15,
          espaciosOcupados: 5,
          ventasHoy: 1200,
          dineroEnCaja: 5000,
          totalClientes: 50
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const stats_items = [
    {
      title: "Espacios",
      value: `${stats.espaciosLibres}/${stats.espaciosLibres + stats.espaciosOcupados}`,
      description: "Espacios disponibles",
      icon: Car
    },
    {
      title: "Ventas del día",
      value: `$${stats.ventasHoy.toLocaleString()}`,
      description: "Total de ventas hoy",
      icon: DollarSign
    },
    {
      title: "Clientes",
      value: stats.totalClientes.toString(),
      description: "Total de clientes registrados",
      icon: Users
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats_items.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aquí irían los gráficos de ocupación y ventas */}
    </div>
  )
}
