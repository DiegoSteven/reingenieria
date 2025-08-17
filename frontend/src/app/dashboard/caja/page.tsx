'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface MovimientoCaja {
  id_table_cajas: number
  fecha: string
  monto: number
  estado: string
  referencia?: string
  usuario?: string
}

interface EstadoCaja {
  abierta: boolean
  saldoActual: number
  fechaApertura?: string
  montoInicial?: number
}

interface Configuracion {
  nombre_empresa: string
  impuesto: string
  moneda: string
  simbolo_moneda: string
  direccion: string
  ruc: string
  celular: string
  dimension_x: string
  dimension_y: string
}

export default function CajaPage() {
  const { toast } = useToast()
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [date, setDate] = useState<Date>(new Date())
  const [montoTotal, setMontoTotal] = useState(0)
  const [configuracion, setConfiguracion] = useState<Configuracion>({
    nombre_empresa: '',
    impuesto: '',
    moneda: '',
    simbolo_moneda: 'S/',
    direccion: '',
    ruc: '',
    celular: '',
    dimension_x: '',
    dimension_y: ''
  })
  const [estadoCaja, setEstadoCaja] = useState<EstadoCaja>({
    abierta: false,
    saldoActual: 0
  })
  const [montoInicial, setMontoInicial] = useState('')
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    monto: '',
    estado: 'ingreso' as 'ingreso' | 'egreso',
    referencia: ''
  })

  useEffect(() => {
    loadConfiguracion()
    loadMovimientos()
  }, [date])

  const loadConfiguracion = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/configuracion', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok && data.data) {
        setConfiguracion(data.data)
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    }
  }

  const loadMovimientos = async () => {
    try {
      const token = localStorage.getItem('token')
      const formattedDate = format(date, 'yyyy-MM-dd')

      // Obtener el estado de la caja
      const estadoResponse = await fetch(`http://localhost:3001/api/caja/estado`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const estadoData = await estadoResponse.json()
      if (estadoResponse.ok && estadoData.data) {
        setEstadoCaja({
          abierta: estadoData.data.estaAbierta,
          saldoActual: estadoData.data.saldoActual,
          fechaApertura: estadoData.data.apertura?.fecha,
          montoInicial: estadoData.data.apertura?.monto
        })
      }

      // Obtener los movimientos
      const response = await fetch(`http://localhost:3001/api/caja?fecha=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar movimientos')
      }

      setMovimientos(data.data || [])
      
      // Calcular el monto total separando ingresos y egresos
      let ingresos = 0
      let egresos = 0
      data.data.forEach((mov: MovimientoCaja) => {
        const monto = Number(mov.monto)
        if (mov.estado === 'ingreso' || mov.estado === 'apertura') {
          ingresos += monto
        } else if (mov.estado === 'egreso') {
          egresos += monto
        }
      })
      setMontoTotal(ingresos - egresos)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar movimientos'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const abrirCaja = async () => {
    try {
      // Validar el monto inicial
      const montoInicialNum = parseFloat(montoInicial)
      if (!montoInicial || isNaN(montoInicialNum) || montoInicialNum <= 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor ingrese un monto inicial válido mayor a 0"
        })
        return
      }

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/caja/abrir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ montoInicial: montoInicialNum })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Caja abierta correctamente con un monto inicial de ${configuracion.simbolo_moneda} ${montoInicialNum.toFixed(2)}`
        })
        setMontoInicial('')
        await loadMovimientos()
      } else {
        throw new Error(data.message || 'Error al abrir la caja')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al abrir la caja'
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    }
  }

  const cerrarCaja = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/caja/cerrar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Caja cerrada correctamente"
        })
        loadMovimientos()
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Error al cerrar la caja')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar la caja'
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    }
  }

  const registrarMovimiento = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/caja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          monto: parseFloat(nuevoMovimiento.monto),
          estado: nuevoMovimiento.estado,
          referencia: nuevoMovimiento.referencia || undefined
        })
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Movimiento registrado correctamente"
        })
        setNuevoMovimiento({
          monto: '',
          estado: 'ingreso',
          referencia: ''
        })
        loadMovimientos()
      } else {
        const data = await response.json()
        throw new Error(data.message || 'Error al registrar movimiento')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar movimiento'
      toast({
        variant: "destructive",
        title: "Error",
        description: message
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Caja</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, 'PPP', { locale: es })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Estado de la Caja */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de la Caja</CardTitle>
          <CardDescription>
            {estadoCaja.abierta ? 'Caja Abierta' : 'Caja Cerrada'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {estadoCaja.abierta ? (
            <div className="space-y-4">
              <div>
                <Label>Fecha de Apertura</Label>
                <p className="text-sm">{estadoCaja.fechaApertura ? format(new Date(estadoCaja.fechaApertura), 'dd/MM/yyyy HH:mm') : '-'}</p>
              </div>
              <div>
                <Label>Monto Inicial</Label>
                <p className="text-sm">{configuracion.simbolo_moneda} {Number(estadoCaja.montoInicial || 0).toFixed(2)}</p>
              </div>
              <div>
                <Label>Saldo Actual</Label>
                <p className={`text-xl font-bold ${montoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {configuracion.simbolo_moneda} {montoTotal.toFixed(2)}
                </p>
              </div>
              <Button onClick={cerrarCaja} variant="destructive">Cerrar Caja</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="montoInicial">Monto Inicial</Label>
                <Input
                  type="number"
                  id="montoInicial"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  className="mt-1"
                  min="0"
                  step="0.01"
                  placeholder="Ingrese el monto inicial"
                />
              </div>
              <Button 
                onClick={abrirCaja} 
                disabled={!montoInicial || parseFloat(montoInicial) <= 0}
              >
                {montoInicial && parseFloat(montoInicial) > 0 ? (
                  `Abrir Caja con ${configuracion.simbolo_moneda} ${parseFloat(montoInicial).toFixed(2)}`
                ) : (
                  'Abrir Caja'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen del Día */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {configuracion.simbolo_moneda} {movimientos
                .filter(m => m.estado === 'ingreso' || m.estado === 'apertura')
                .reduce((acc, mov) => acc + Number(mov.monto), 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {movimientos.filter(m => m.estado === 'ingreso' || m.estado === 'apertura').length} movimientos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Egresos del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {configuracion.simbolo_moneda} {movimientos
                .filter(m => m.estado === 'egreso')
                .reduce((acc, mov) => acc + Number(mov.monto), 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {movimientos.filter(m => m.estado === 'egreso').length} movimientos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registrar Movimiento */}
      {estadoCaja.abierta && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Movimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monto">Monto</Label>
                  <Input
                    type="number"
                    id="monto"
                    value={nuevoMovimiento.monto}
                    onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, monto: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Tipo</Label>
                  <select
                    id="estado"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 mt-1"
                    value={nuevoMovimiento.estado}
                    onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, estado: e.target.value as 'ingreso' | 'egreso'})}
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="referencia">Referencia</Label>
                <Input
                  type="text"
                  id="referencia"
                  value={nuevoMovimiento.referencia}
                  onChange={(e) => setNuevoMovimiento({...nuevoMovimiento, referencia: e.target.value})}
                  className="mt-1"
                />
              </div>
              <Button onClick={registrarMovimiento}>Registrar Movimiento</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Historial de Movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay movimientos para esta fecha
                    </td>
                  </tr>
                ) : (
                  movimientos.map((movimiento) => (
                    <tr key={movimiento.id_table_cajas}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          movimiento.estado === 'ingreso' || movimiento.estado === 'apertura'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {movimiento.estado === 'apertura' ? 'Apertura' : movimiento.estado === 'ingreso' ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(movimiento.fecha), 'p', { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movimiento.referencia || '-'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        movimiento.estado === 'ingreso' || movimiento.estado === 'apertura' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimiento.estado === 'ingreso' || movimiento.estado === 'apertura' ? '+' : '-'}
                        {configuracion.simbolo_moneda} {Math.abs(movimiento.monto).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
