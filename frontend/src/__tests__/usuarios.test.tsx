import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreateUserDialog } from '@/components/create-user-dialog'
import { ChangePasswordDialog } from '@/components/change-password-dialog'

// Mock fetch globally
global.fetch = jest.fn()

describe('Gestión de Usuarios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => key === 'token' ? 'fake-token' : null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      key: jest.fn(),
      length: 0
    }
    global.localStorage = mockLocalStorage
  })

  describe('Crear Usuario', () => {
    test('muestra formulario de creación con campos requeridos', () => {
      render(<CreateUserDialog onUserCreated={() => {}} />)
      
      // Abrir el diálogo
      fireEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }))
      
      expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rol/i)).toBeInTheDocument()
    })

    test('crea un nuevo usuario exitosamente', async () => {
      const onUserCreated = jest.fn()
      
      // Mock de respuesta exitosa
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            data: {
              idUsuario: 1,
              usuario: 'nuevo_usuario',
              rol: 'admin'
            }
          })
        })
      )

      render(<CreateUserDialog onUserCreated={onUserCreated} />)
      
      // Abrir el diálogo
      fireEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }))
      
      // Llenar el formulario
      fireEvent.change(screen.getByLabelText(/usuario/i), {
        target: { value: 'nuevo_usuario' }
      })
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'contraseña123' }
      })
      fireEvent.change(screen.getByLabelText(/rol/i), {
        target: { value: 'admin' }
      })
      
      // Enviar el formulario
      fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }))
      
      await waitFor(() => {
        expect(onUserCreated).toHaveBeenCalled()
      })
      
      // Verificar la llamada a la API
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/usuarios',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token'
          },
          body: JSON.stringify({
            usuario: 'nuevo_usuario',
            password: 'contraseña123',
            rol: 'admin'
          })
        })
      )
    })

    test('muestra error cuando falla la creación', async () => {
      // Mock de respuesta con error
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ 
            message: 'Error al crear usuario'
          })
        })
      )

      render(<CreateUserDialog onUserCreated={() => {}} />)
      
      // Abrir el diálogo
      fireEvent.click(screen.getByRole('button', { name: /nuevo usuario/i }))
      
      // Llenar el formulario
      fireEvent.change(screen.getByLabelText(/usuario/i), {
        target: { value: 'usuario_error' }
      })
      fireEvent.change(screen.getByLabelText(/contraseña/i), {
        target: { value: 'contraseña123' }
      })
      
      // Enviar el formulario
      fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/error al crear usuario/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cambiar Contraseña', () => {
    const mockUser = {
      idUsuario: 1,
      usuario: 'test_user'
    }

    test('muestra formulario de cambio de contraseña', () => {
      render(
        <ChangePasswordDialog 
          userId={mockUser.idUsuario}
          username={mockUser.usuario}
          onPasswordChanged={() => {}} 
        />
      )
      
      // Abrir el diálogo
      fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))
      
      expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    })

    test('cambia la contraseña exitosamente', async () => {
      const onPasswordChanged = jest.fn()
      
      // Mock de respuesta exitosa
      ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            success: true,
            message: 'Contraseña actualizada correctamente'
          })
        })
      )

      render(
        <ChangePasswordDialog 
          userId={mockUser.idUsuario}
          username={mockUser.usuario}
          onPasswordChanged={onPasswordChanged} 
        />
      )
      
      // Abrir el diálogo
      fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))
      
      // Llenar el formulario
      fireEvent.change(screen.getByLabelText(/contraseña actual/i), {
        target: { value: 'actual123' }
      })
      fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
        target: { value: 'nueva123' }
      })
      fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
        target: { value: 'nueva123' }
      })
      
      // Enviar el formulario
      fireEvent.click(screen.getByRole('button', { name: /actualizar contraseña/i }))
      
      await waitFor(() => {
        expect(onPasswordChanged).toHaveBeenCalled()
      })
      
      // Verificar la llamada a la API
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/usuarios/change-password',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-token'
          },
          body: JSON.stringify({
            oldPassword: 'actual123',
            newPassword: 'nueva123'
          })
        })
      )
    })
  })
})
