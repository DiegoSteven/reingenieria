'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Espacio {
  id_espacio: number
  zona: string
  estado: string
}

interface EditEspacioDialogProps {
  espacio: Espacio
  onEspacioUpdated: () => void
  onClose: () => void
}

export function EditEspacioDialog({ espacio, onEspacioUpdated, onClose }: EditEspacioDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState(espacio)

  useEffect(() => {
    setFormData(espacio)
  }, [espacio])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/espacios/${espacio.id_espacio}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar espacio')
      }

      onEspacioUpdated()
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar espacio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Espacio, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Espacio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="zona">Zona</Label>
            <Input
              id="zona"
              name="zona"
              value={formData.zona}
              onChange={(e) => handleChange('zona', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select 
              name="estado" 
              value={formData.estado} 
              onValueChange={(value) => handleChange('estado', value)}
            >
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
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                'Actualizar Espacio'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
