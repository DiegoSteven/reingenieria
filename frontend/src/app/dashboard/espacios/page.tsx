'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateEspacioDialog } from '@/components/create-espacio-dialog'
import { EditEspacioDialog } from '@/components/edit-espacio-dialog'

interface Espacio {
  id_espacio: number
  zona: string
  estado: string
}

export default function EspaciosPage() {
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [filteredEspacios, setFilteredEspacios] = useState<Espacio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [espacioToEdit, setEspacioToEdit] = useState<Espacio | null>(null)

  useEffect(() => {
    loadEspacios()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = espacios.filter(espacio => 
        espacio.zona.toLowerCase().includes(searchTerm.toLowerCase()) ||
        espacio.estado.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEspacios(filtered)
    } else {
      setFilteredEspacios(espacios)
    }
  }, [searchTerm, espacios])

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

      setEspacios(data.data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar espacios')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este espacio?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/espacios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar espacio')
      }

      loadEspacios()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar espacio')
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'disponible':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
      case 'ocupado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400'
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
        <h1 className="text-3xl font-bold tracking-tight">Espacios</h1>
        <CreateEspacioDialog onEspacioCreated={loadEspacios} />
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder="Buscar por zona o estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredEspacios.map((espacio) => (
          <Card key={espacio.id_espacio}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Zona {espacio.zona}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEspacioToEdit(espacio)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(espacio.id_espacio)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`px-2.5 py-1 rounded-md inline-block text-xs font-medium ${getEstadoColor(espacio.estado)}`}>
                {espacio.estado}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {espacioToEdit && (
        <EditEspacioDialog
          espacio={espacioToEdit}
          onEspacioUpdated={loadEspacios}
          onClose={() => setEspacioToEdit(null)}
        />
      )}
    </div>
  )
}
