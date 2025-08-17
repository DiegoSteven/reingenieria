'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from 'lucide-react'

interface AboutInfo {
  nombre: string
  version: string
  autor: string
  descripcion: string
}

export default function AboutPage() {
  const [aboutInfo, setAboutInfo] = useState<AboutInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAboutInfo = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3001/api/about', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Error al cargar la información')
        }

        const data = await response.json()
        if (data && data.data) {
          setAboutInfo(data.data)
        } else {
          throw new Error('Formato de respuesta inválido')
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar la información')
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAboutInfo()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Acerca del Sistema</h1>
      
      <div className="max-w-2xl">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {aboutInfo?.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Versión</p>
                <p className="mt-1">{aboutInfo?.version}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Autor</p>
                <p className="mt-1">{aboutInfo?.autor}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</p>
              <p className="mt-1">{aboutInfo?.descripcion}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
