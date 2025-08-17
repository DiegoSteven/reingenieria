'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, FileText, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreateVentaDialog } from '@/components/create-venta-dialog'
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Factura {
  No_Facturas: number
  cliente: number
  id_mesas: number
  fecha: string
  totals: number | string  // Puede venir como string desde la BD
  nro_boleta: number
  factura_boleta: string
  Cliente?: {
    Nombre_Cliente: string
    Apellido_Cliente: string
    ruc_Cliente?: string
    razon_s_Cliente?: string
  }
}

export default function VentasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [filteredFacturas, setFilteredFacturas] = useState<Factura[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [totalPeriodo, setTotalPeriodo] = useState(0)

  useEffect(() => {
    loadFacturas()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = facturas.filter(factura => 
        factura.Cliente?.Nombre_Cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factura.Cliente?.Apellido_Cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factura.No_Facturas.toString().includes(searchTerm) ||
        factura.Cliente?.ruc_Cliente?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFacturas(filtered)
    } else {
      setFilteredFacturas(facturas)
    }
  }, [searchTerm, facturas])

  const loadFacturas = async (start?: Date, end?: Date) => {
    try {
      const token = localStorage.getItem('token')
      let url = 'http://localhost:3001/api/facturas'
      
      if (start && end) {
        const startDate = format(start, 'yyyy-MM-dd')
        const endDate = format(end, 'yyyy-MM-dd')
        url += `?startDate=${startDate}&endDate=${endDate}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar facturas')
      }

      setFacturas(data.data || [])
      
      // Calcular total del periodo asegurando que los valores sean números
      const total = (data.data || []).reduce((acc: number, factura: Factura) => {
        const totalFactura = typeof factura.totals === 'string' ? parseFloat(factura.totals) : Number(factura.totals)
        return acc + (isNaN(totalFactura) ? 0 : totalFactura)
      }, 0)
      setTotalPeriodo(total)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar facturas')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerPDF = async (facturaId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/facturas/${facturaId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener el PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al obtener el PDF')
    }
  }

  const handlePrint = async (facturaId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/facturas/${facturaId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al obtener la factura para imprimir')
      }

      // Obtener el PDF como blob
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Abrir el PDF en una nueva ventana
      const printWindow = window.open(url, '_blank')
      
      if (printWindow) {
        // Esperar un momento para que el PDF se cargue
        setTimeout(() => {
          try {
            printWindow.print()
          } catch (err) {
            console.error('Error al imprimir:', err)
          }
        }, 1000)
        
        // Limpiar cuando la ventana se cierre
        printWindow.onafterprint = () => {
          printWindow.close()
          window.URL.revokeObjectURL(url)
        }
      } else {
        throw new Error('El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes para este sitio.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al imprimir la factura')
      console.error('Error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
        <CreateVentaDialog onVentaCreated={loadFacturas} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Total del Periodo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">S/ {totalPeriodo.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">
              {startDate && endDate ? 
                `Del ${format(startDate, 'PPP', { locale: es })} al ${format(endDate, 'PPP', { locale: es })}` :
                'Total general'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Cantidad de Ventas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{filteredFacturas.length}</p>
            <p className="text-sm text-gray-500 mt-2">Ventas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha Inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                        {startDate ? format(startDate, 'PPP', { locale: es }) : 'Seleccionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Fecha Fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                        {endDate ? format(endDate, 'PPP', { locale: es }) : 'Seleccionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (startDate && endDate) {
                      loadFacturas(startDate, endDate)
                    }
                  }}
                  disabled={!startDate || !endDate}
                >
                  Filtrar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStartDate(undefined)
                    setEndDate(undefined)
                    loadFacturas()
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Buscar por cliente, número de factura o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFacturas.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron ventas para mostrar</p>
          </div>
        ) : (
          filteredFacturas.map((factura) => (
            <Card key={factura.No_Facturas} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{factura.factura_boleta === 'F' ? 'Factura' : 'Boleta'}</span>
                    <span className="text-sm text-gray-500">#{factura.nro_boleta}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleVerPDF(factura.No_Facturas)}
                      title="Ver PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrint(factura.No_Facturas)}
                      title="Imprimir"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cliente</p>
                    <p className="font-medium text-lg">
                      {factura.Cliente ? 
                        `${factura.Cliente.Nombre_Cliente} ${factura.Cliente.Apellido_Cliente}` : 
                        'Cliente no encontrado'}
                    </p>
                    {factura.Cliente?.razon_s_Cliente && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {factura.Cliente.razon_s_Cliente}
                      </p>
                    )}
                    {factura.Cliente?.ruc_Cliente && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        RUC/DNI: {factura.Cliente.ruc_Cliente}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha</p>
                      <p className="text-sm">
                        {format(new Date(factura.fecha), 'PPP', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hora</p>
                      <p className="text-sm">
                        {format(new Date(factura.fecha), 'p', { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Espacio</p>
                      <p className="font-medium">Zona {factura.id_mesas}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                      <p className="font-medium text-lg text-green-600 dark:text-green-400">
                        S/ {(typeof factura.totals === 'string' ? parseFloat(factura.totals) : Number(factura.totals)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
