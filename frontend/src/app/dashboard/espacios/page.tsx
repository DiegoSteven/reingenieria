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
  const [espaciosDisponibles, setEspaciosDisponibles] = useState(0)
  const [espaciosOcupados, setEspaciosOcupados] = useState(0)
  const [espaciosMantenimiento, setEspaciosMantenimiento] = useState(0)

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

      const espaciosData = data.data || []
      setEspacios(espaciosData)
      
      // Contar espacios por estado
      const disponibles = espaciosData.filter((e: Espacio) => e.estado === 'disponible').length
      const ocupados = espaciosData.filter((e: Espacio) => e.estado === 'ocupado').length
      const mantenimiento = espaciosData.filter((e: Espacio) => e.estado === 'mantenimiento').length
      
      setEspaciosDisponibles(disponibles)
      setEspaciosOcupados(ocupados)
      setEspaciosMantenimiento(mantenimiento)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar espacios')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLiberar = async (id: number, zona: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/espacios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          estado: 'disponible',
          zona: zona
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Error al liberar espacio')
      }

      loadEspacios()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al liberar espacio')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Control de Parqueadero</h1>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="flex items-center flex-1 sm:flex-initial">
              <Search className="w-5 h-5 text-gray-400 absolute ml-3" />
              <Input
                placeholder="Buscar espacio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <CreateEspacioDialog onEspacioCreated={loadEspacios} />
          </div>
        </div>
      </div>

      {/* Dashboard de estados */}
      <div className="grid gap-4 grid-cols-3 max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
          <span className="text-4xl font-bold text-green-600 dark:text-green-400">{espaciosDisponibles}</span>
          <span className="text-sm text-green-600 dark:text-green-400 mt-1">Disponibles</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
          <span className="text-4xl font-bold text-red-600 dark:text-red-400">{espaciosOcupados}</span>
          <span className="text-sm text-red-600 dark:text-red-400 mt-1">Ocupados</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
          <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{espaciosMantenimiento}</span>
          <span className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Mantenimiento</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 max-w-7xl mx-auto">
        {filteredEspacios.map((espacio) => (
          <div 
            key={espacio.id_espacio}
            className={`relative p-4 rounded-lg border transition-all hover:shadow-md ${
              espacio.estado === 'ocupado' 
                ? 'bg-white border-red-200 dark:bg-red-900/5 dark:border-red-800' 
                : espacio.estado === 'disponible'
                  ? 'bg-white border-green-200 dark:bg-green-900/5 dark:border-green-800'
                  : 'bg-white border-yellow-200 dark:bg-yellow-900/5 dark:border-yellow-800'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold mb-2">{espacio.zona}</span>
              <span className={`text-sm font-medium mb-3 ${
                espacio.estado === 'ocupado' 
                  ? 'text-red-600 dark:text-red-400'
                  : espacio.estado === 'disponible'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {espacio.estado.charAt(0).toUpperCase() + espacio.estado.slice(1)}
              </span>
              
              <div className="flex gap-1 mt-2">
                {espacio.estado === 'ocupado' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLiberar(espacio.id_espacio, espacio.zona)}
                    className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                  >
                    Liberar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEspacioToEdit(espacio)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(espacio.id_espacio)}
                  className="h-8 w-8 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
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
