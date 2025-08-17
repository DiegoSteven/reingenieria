'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Cliente {
  idCliente: number
  Nombre_Cliente: string
  Apellido_Cliente: string
  razon_s_Cliente?: string
  ruc_Cliente?: string
}

interface Espacio {
  id_espacio: number
  zona: string
  estado: string
}

interface CreateVentaDialogProps {
  onVentaCreated: () => void
}

export function CreateVentaDialog({ onVentaCreated }: CreateVentaDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [selectedCliente, setSelectedCliente] = useState<string>('')
  const [selectedEspacio, setSelectedEspacio] = useState<string>('')
  const [total, setTotal] = useState<string>('')

  const [isCajaOpen, setIsCajaOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadClientes()
      loadEspacios()
      checkCajaStatus()
    }
  }, [isOpen])

  const checkCajaStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/caja/estado', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const { estaAbierta, saldoActual } = data.data
        setIsCajaOpen(estaAbierta)
        setError('')

        if (!estaAbierta) {
          setError('La caja debe estar abierta para registrar ventas')
        }
      } else {
        setError('Error al verificar el estado de la caja')
      }
    } catch (error) {
      console.error('Error al verificar estado de caja:', error)
      setError('Error al verificar estado de caja')
    }
  }

  const loadClientes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/clientes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar clientes')
      }

      setClientes(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const loadEspacios = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/espacios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar espacios')
      }

      console.log('Espacios recibidos:', data.data)
      const espaciosDisponibles = data.data.filter((espacio: Espacio) => espacio.estado === 'disponible')
      console.log('Espacios disponibles:', espaciosDisponibles)
      setEspacios(espaciosDisponibles || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const ventaData = {
        cliente: parseInt(selectedCliente),
        id_mesas: parseInt(selectedEspacio),
        totals: parseFloat(total),
        fecha: new Date().toISOString().split('T')[0],
        // El backend generará automáticamente estos valores
        nro_boleta: 0,
        factura_boleta: 'F'
      }

      const response = await fetch('http://localhost:3001/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ventaData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear venta')
      }

      setIsOpen(false)
      onVentaCreated()

      // Generar PDF
      const pdfResponse = await fetch(`http://localhost:3001/api/facturas/${data.data.No_Facturas}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (pdfResponse.ok) {
        const blob = await pdfResponse.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear venta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Nueva Venta</DialogTitle>
          <DialogDescription>
            Ingrese los detalles de la venta. Seleccione el cliente y el espacio disponible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Select 
              value={selectedCliente} 
              onValueChange={setSelectedCliente}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem 
                    key={cliente.idCliente} 
                    value={cliente.idCliente.toString()}
                  >
                    {cliente.Nombre_Cliente} {cliente.Apellido_Cliente}
                    {cliente.razon_s_Cliente && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {cliente.razon_s_Cliente}
                      </span>
                    )}
                    {cliente.ruc_Cliente && (
                      <span className="text-sm text-gray-500 ml-2">
                        (RUC: {cliente.ruc_Cliente})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="espacio">Espacio</Label>
            <Select 
              value={selectedEspacio} 
              onValueChange={(value) => {
                setSelectedEspacio(value)
                // Marcar el espacio como ocupado al seleccionarlo
                const token = localStorage.getItem('token')
                fetch(`http://localhost:3001/api/espacios/${value}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ estado: 'ocupado', zona: espacios.find(e => e.id_espacio.toString() === value)?.zona })
                })
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un espacio" />
              </SelectTrigger>
              <SelectContent>
                {espacios.map((espacio) => (
                  <SelectItem 
                    key={espacio.id_espacio} 
                    value={espacio.id_espacio.toString()}
                  >
                    Zona {espacio.zona}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total S/</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              min="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button" 
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !isCajaOpen}
              title={!isCajaOpen ? "La caja debe estar abierta para registrar ventas" : ""}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                'Registrar Venta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
