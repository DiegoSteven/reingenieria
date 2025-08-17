export function acercaDelPrograma(req, res) {
  res.json({
    data: {
      nombre: 'Sistema de Parqueamiento',
      version: '1.0.0',
      autor: 'Diego Hidalgo',
      descripcion: 'Aplicativo modernizado con Node.js, Express y PostgreSQL.'
    }
  });
}
