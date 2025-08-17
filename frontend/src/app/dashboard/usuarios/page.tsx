'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { CreateUserDialog } from "@/components/create-user-dialog"

interface Usuario {
  id: number
  usuario: string
  nombres: string
  apellidos: string
  tipo: 'Administrador' | 'Empleado'
  dni: string
  telefono?: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar usuarios')
      }

      setUsuarios(data.data || [])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar usuarios')
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
        <CreateUserDialog onUserCreated={loadUsuarios} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {usuarios.map((usuario) => (
          <Card key={usuario.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{usuario.usuario}</span>
                <span className={`text-sm px-2 py-1 rounded-full 
                  ${usuario.tipo === 'Administrador' 
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                  }`}>
                  {usuario.tipo}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nombre completo</p>
                  <p className="font-medium">{usuario.nombres} {usuario.apellidos}</p>
                </div>
                {usuario.dni && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">DNI</p>
                    <p className="font-medium">{usuario.dni}</p>
                  </div>
                )}
                {usuario.telefono && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                    <p className="font-medium">{usuario.telefono}</p>
                  </div>
                )}
                <ChangePasswordDialog
                  userId={usuario.id}
                  username={usuario.usuario}
                  onPasswordChanged={loadUsuarios}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
