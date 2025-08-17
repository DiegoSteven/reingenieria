'use client'

import { useState, useEffect } from 'react'
import { Search, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateClienteDialog } from '@/components/create-cliente-dialog'
import { EditClienteDialog } from '@/components/edit-cliente-dialog'

interface Cliente {
  idCliente: number
  Nombre_Cliente: string
  Apellido_Cliente: string
  razon_s_Cliente?: string
  ruc_Cliente?: string
  direccion_Cliente?: string
  telefono_Cliente?: string
  correo_Cliente?: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null)

  useEffect(() => {
    loadClientes()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = clientes.filter(cliente => 
        cliente.Nombre_Cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.Apellido_Cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.ruc_Cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefono_Cliente?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredClientes(filtered)
    } else {
      setFilteredClientes(clientes)
    }
  }, [searchTerm, clientes])

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
      setError(error instanceof Error ? error.message : 'Error al cargar clientes')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar cliente')
      }

      loadClientes()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar cliente')
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
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <CreateClienteDialog onClienteCreated={loadClientes} />
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder="Buscar por nombre, RUC o teléfono..."
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.idCliente}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{cliente.Nombre_Cliente} {cliente.Apellido_Cliente}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setClienteToEdit(cliente)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cliente.idCliente)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cliente.ruc_Cliente && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">RUC/DNI</p>
                    <p className="font-medium">{cliente.ruc_Cliente}</p>
                  </div>
                )}
                {cliente.telefono_Cliente && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="font-medium">{cliente.telefono_Cliente}</p>
                  </div>
                )}
                {cliente.correo_Cliente && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium">{cliente.correo_Cliente}</p>
                  </div>
                )}
                {cliente.direccion_Cliente && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                    <p className="font-medium">{cliente.direccion_Cliente}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clienteToEdit && (
        <EditClienteDialog
          cliente={clienteToEdit}
          onClienteUpdated={loadClientes}
          onClose={() => setClienteToEdit(null)}
        />
      )}
    </div>
  )
}
