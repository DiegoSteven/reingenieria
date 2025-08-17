'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, DollarSign, Users, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Registrar los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Espacio {
  id: number
  estado: 'disponible' | 'ocupado'
}

interface Venta {
  id: number
  totals: number
}

interface VentaPorHora {
  hora: string
  total: number
}

interface OcupacionPorHora {
  hora: string
  ocupados: number
}

interface DashboardStats {
  espaciosLibres: number
  espaciosOcupados: number
  ventasHoy: number
  dineroEnCaja: number
  totalClientes: number
  ventasPorHora: VentaPorHora[]
  ocupacionPorHora: OcupacionPorHora[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    espaciosLibres: 0,
    espaciosOcupados: 0,
    ventasHoy: 0,
    dineroEnCaja: 0,
    totalClientes: 0,
    ventasPorHora: [],
    ocupacionPorHora: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [configuracion, setConfiguracion] = useState({
    simbolo_moneda: 'S/'
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = {
          'Authorization': `Bearer ${token}`
        }

        // Cargar configuración
        const configResponse = await fetch('http://localhost:3001/api/configuracion', {
          headers
        })
        const configData = await configResponse.json()
        if (configResponse.ok && configData.data) {
          setConfiguracion(configData.data)
        }

        // Cargar espacios
        const espaciosResponse = await fetch('http://localhost:3001/api/espacios', {
          headers
        })
        const espaciosData = await espaciosResponse.json()
        const espacios: Espacio[] = espaciosData.data || []
        const disponibles = espacios.filter(e => e.estado === 'disponible').length
        const ocupados = espacios.filter(e => e.estado === 'ocupado').length

        // Cargar ventas del día
        const ventasResponse = await fetch('http://localhost:3001/api/facturas', {
          headers
        })
        const ventasData = await ventasResponse.json()
        const ventas: Venta[] = ventasData.data || []
        const totalVentas = ventas.reduce((acc: number, v) => acc + Number(v.totals), 0)

        // Cargar estado de caja
        const cajaResponse = await fetch('http://localhost:3001/api/caja/estado', {
          headers
        })
        const cajaData = await cajaResponse.json()
        const saldoCaja = cajaData.data?.saldoActual || 0

        // Cargar clientes
        const clientesResponse = await fetch('http://localhost:3001/api/clientes', {
          headers
        })
        const clientesData = await clientesResponse.json()
        const totalClientes = clientesData.data?.length || 0

        // Generar datos por hora (esto debería venir del backend idealmente)
        const ventasPorHora = Array.from({ length: 24 }, (_, i) => ({
          hora: i.toString().padStart(2, '0') + ':00',
          total: Math.random() * 1000
        }))

        const ocupacionPorHora = Array.from({ length: 24 }, (_, i) => ({
          hora: i.toString().padStart(2, '0') + ':00',
          ocupados: Math.floor(Math.random() * (ocupados + disponibles))
        }))

        setStats({
          espaciosLibres: disponibles,
          espaciosOcupados: ocupados,
          ventasHoy: totalVentas,
          dineroEnCaja: saldoCaja,
          totalClientes,
          ventasPorHora,
          ocupacionPorHora
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
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
      value: `${configuracion.simbolo_moneda}${stats.ventasHoy.toLocaleString()}`,
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por hora</CardTitle>
          </CardHeader>
          <CardContent>
            <Line 
              data={{
                labels: stats.ventasPorHora.map(v => v.hora),
                datasets: [{
                  label: 'Ventas (S/)',
                  data: stats.ventasPorHora.map(v => v.total),
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Monto (S/)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Hora'
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ocupación por hora</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: stats.ocupacionPorHora.map(o => o.hora),
                datasets: [{
                  label: 'Espacios ocupados',
                  data: stats.ocupacionPorHora.map(o => o.ocupados),
                  backgroundColor: 'rgba(54, 162, 235, 0.5)',
                  borderColor: 'rgb(54, 162, 235)',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Espacios ocupados'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Hora'
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
