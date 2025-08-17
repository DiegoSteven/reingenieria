import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '../app/auth/login/page'

// Mock del router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('Autenticación', () => {
  const mockRouter = {
    push: jest.fn()
  }

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
    // Limpiar mocks
    jest.clearAllMocks()
    
    // Mock localStorage
    const store: { [key: string]: string } = {}
    const mockLocalStorage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => delete store[key]),
      clear: jest.fn(() => Object.keys(store).forEach(key => delete store[key])),
      key: jest.fn(),
      length: 0,
    }
    global.localStorage = mockLocalStorage as unknown as Storage
  })

  test('muestra formulario de login con campos requeridos', () => {
    render(<LoginPage />)
    
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  test('muestra error cuando las credenciales son inválidas', async () => {
    // Mock de respuesta de error
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Credenciales inválidas' })
      })
    )

    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'usuario_invalido' }
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'contraseña_invalida' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument()
    })
  })

  test('redirige al dashboard después de un login exitoso', async () => {
    const mockToken = 'token123'
    
    // Mock de respuesta exitosa
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: mockToken })
      })
    )

    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'usuario_valido' }
    })
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'contraseña_valida' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(mockToken)
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })
})
