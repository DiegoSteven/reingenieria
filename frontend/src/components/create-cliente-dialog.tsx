'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateClienteDialogProps {
  onClienteCreated: () => void
}

export function CreateClienteDialog({ onClienteCreated }: CreateClienteDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const clienteData = {
      nombres: formData.get('Nombre_Cliente'),
      apellidos: formData.get('Apellido_Cliente'),
      dni: formData.get('ruc_Cliente'),
      direccion: formData.get('direccion_Cliente'),
      telefono: formData.get('telefono_Cliente'),
      email: formData.get('correo_Cliente')
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clienteData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear cliente')
      }

      setIsOpen(false)
      onClienteCreated()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear cliente')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Nombre_Cliente">Nombre</Label>
              <Input id="Nombre_Cliente" name="Nombre_Cliente" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="Apellido_Cliente">Apellido</Label>
              <Input id="Apellido_Cliente" name="Apellido_Cliente" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ruc_Cliente">RUC/DNI</Label>
            <Input id="ruc_Cliente" name="ruc_Cliente" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion_Cliente">Dirección</Label>
            <Input id="direccion_Cliente" name="direccion_Cliente" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono_Cliente">Teléfono</Label>
            <Input id="telefono_Cliente" name="telefono_Cliente" type="tel" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo_Cliente">Email</Label>
            <Input id="correo_Cliente" name="correo_Cliente" type="email" />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                'Crear Cliente'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
