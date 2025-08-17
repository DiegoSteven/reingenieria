'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateEspacioDialogProps {
  onEspacioCreated: () => void
}

export function CreateEspacioDialog({ onEspacioCreated }: CreateEspacioDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const espacioData = {
      zona: formData.get('zona'),
      estado: formData.get('estado')
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/espacios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(espacioData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear espacio')
      }

      setIsOpen(false)
      onEspacioCreated()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear espacio')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Espacio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Espacio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="zona">Zona</Label>
            <Input id="zona" name="zona" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select name="estado" required defaultValue="disponible">
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="ocupado">Ocupado</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
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
                'Crear Espacio'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
