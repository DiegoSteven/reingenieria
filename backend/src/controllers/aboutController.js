export function acercaDelPrograma(req, res) {
  res.json({
    nombre: 'Sistema de Parqueamiento',
    version: '1.0.0',
    autor: 'Reingeniería',
    descripcion: 'Aplicativo modernizado con Node.js, Express y PostgreSQL.'
  });
}
