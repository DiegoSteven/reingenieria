'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Settings, Upload } from 'lucide-react'

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

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState<Configuracion>({
    nombre_empresa: '',
    impuesto: '',
    moneda: '',
    simbolo_moneda: '',
    direccion: '',
    ruc: '',
    celular: '',
    dimension_x: '',
    dimension_y: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    cargarConfiguracion()
  }, [])

  const cargarLogo = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/configuracion/logo?${Date.now()}`)
      if (response.ok) {
        const blob = await response.blob()
        if (blob.size > 0) {
          setPreviewUrl(URL.createObjectURL(blob))
        }
      }
    } catch (error) {
      console.error('Error al cargar el logo:', error)
    }
  }

  const cargarConfiguracion = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/configuracion', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar la configuración')
      }

      const data = await response.json()
      setConfiguracion(data.data)
      
      // Cargar logo
      await cargarLogo()
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la configuración"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfiguracion(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setLogoFile(file)
        setPreviewUrl(URL.createObjectURL(file))
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Por favor seleccione un archivo de imagen válido"
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      
      // Actualizar configuración general
      const configResponse = await fetch('http://localhost:3001/api/configuracion', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configuracion)
      })

      if (!configResponse.ok) {
        throw new Error('Error al actualizar la configuración')
      }

      // Si hay un nuevo logo, subirlo
      if (logoFile) {
        const formData = new FormData()
        formData.append('logo', logoFile)

        const logoResponse = await fetch('http://localhost:3001/api/configuracion/logo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (!logoResponse.ok) {
          throw new Error('Error al actualizar el logo')
        }

        // Recargar el logo después de actualizar
        await cargarLogo()
      }

      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente"
      })

    } catch (error) {
      console.error('Error al guardar la configuración:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar la configuración"
      })
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Información General</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_empresa">Nombre de la Empresa</Label>
                <Input
                  id="nombre_empresa"
                  name="nombre_empresa"
                  value={configuracion.nombre_empresa}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="impuesto">Impuesto (%)</Label>
                <Input
                  id="impuesto"
                  name="impuesto"
                  type="number"
                  value={configuracion.impuesto}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda</Label>
                <Input
                  id="moneda"
                  name="moneda"
                  value={configuracion.moneda}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="simbolo_moneda">Símbolo de Moneda</Label>
                <Input
                  id="simbolo_moneda"
                  name="simbolo_moneda"
                  value={configuracion.simbolo_moneda}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruc">RUC/Documento Fiscal</Label>
                <Input
                  id="ruc"
                  name="ruc"
                  value={configuracion.ruc}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="celular">Teléfono/Celular</Label>
                <Input
                  id="celular"
                  name="celular"
                  value={configuracion.celular}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={configuracion.direccion}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Logo de la Empresa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Seleccionar Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500">
                  Formato recomendado: JPEG o PNG. Tamaño máximo: 2MB
                </p>
              </div>

              <div className="space-y-2">
                <Label>Vista Previa</Label>
                <div className="border rounded-lg p-4 w-full aspect-video flex items-center justify-center bg-gray-50">
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Logo de la empresa"
                        className="absolute top-0 left-0 w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Error cargando imagen');
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-400">No hay logo</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimension_x">Dimensión X (px)</Label>
                <Input
                  id="dimension_x"
                  name="dimension_x"
                  type="number"
                  value={configuracion.dimension_x}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimension_y">Dimensión Y (px)</Label>
                <Input
                  id="dimension_y"
                  name="dimension_y"
                  type="number"
                  value={configuracion.dimension_y}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="submit">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  )
}
