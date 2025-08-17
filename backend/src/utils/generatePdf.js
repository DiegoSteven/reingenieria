import * as PDFKit from 'pdfkit';
import fs from 'fs';
import path from 'path';

const PDFDocument = PDFKit.default;
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const numeroALetras = (numero, moneda = 'SOLES') => {
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = {
    11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
    16: 'DIECISEIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE'
  };

  const entero = Math.floor(numero);
  const decimales = Math.round((numero - entero) * 100);

  let resultado = '';

  if (entero === 0) {
    resultado = 'CERO';
  } else if (entero <= 9) {
    resultado = unidades[entero];
  } else if (entero in especiales) {
    resultado = especiales[entero];
  } else {
    const decena = Math.floor(entero / 10);
    const unidad = entero % 10;
    if (unidad === 0) {
      resultado = decenas[decena];
    } else {
      resultado = decenas[decena] + ' Y ' + unidades[unidad];
    }
  }

  return `${resultado} ${decimales}/100 ${moneda.toUpperCase()}`;
};

export async function generateFacturaPDF(factura, cliente, configuracion) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Crear directorio si no existe
      const dir = path.join(__dirname, '..', '..', 'facturas');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, `${factura.No_Facturas}.pdf`);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Logo
      const logoPath = path.join(__dirname, '..', '..', 'logo', 'logo.png');
      if (fs.existsSync(logoPath)) {
        const logoWidth = configuracion?.dimension_x ? parseInt(configuracion.dimension_x) : 100;
        const logoHeight = configuracion?.dimension_y ? parseInt(configuracion.dimension_y) : 100;
        doc.image(logoPath, 50, 45, { width: logoWidth, height: logoHeight });
      }

      // Encabezado
      doc.fontSize(12)
         .text(configuracion?.nombre_empresa || 'tusolutionweb tutos', 160, 50)
         .text(`Celular: ${configuracion?.celular || '95464564'}`, 160, 65)
         .text(`${configuracion?.direccion || 'av. san francisco'}`, 160, 80)
         .text(`RUC: ${configuracion?.ruc || '20113322'}`, 160, 95);

      // Tipo de documento y número
      doc.fontSize(12)
         .text(`${factura.factura_boleta === 'F' ? 'Factura' : 'Boleta'} de venta: ${String(factura.nro_boleta).padStart(10, '0')}`, 50, 130);

      // Información del cliente
      doc.text(`Cliente: ${cliente.Nombre_Cliente} ${cliente.Apellido_Cliente}`, 50, 160)
         .text(`RUC/DNI cliente: ${cliente.ruc_Cliente || ''}`, 50, 175);

      // Detalles de la venta
      const total = typeof factura.totals === 'string' ? parseFloat(factura.totals) : Number(factura.totals);

      // Si no hay configuración de impuesto, lanzar error
      if (!configuracion?.impuesto) {
        throw new Error('No se ha configurado el impuesto en el sistema');
      }

      // Asegurarnos de que el impuesto sea un número desde la configuración
      const impuestoRate = parseFloat(configuracion.impuesto) / 100;
      
      // Calcular valores correctamente usando el método directo:
      // 1. Total es el monto ingresado por el usuario (incluye impuesto)
      // 2. Subtotal (monto base) = Total / (1 + impuestoRate)
      // 3. Impuesto = Subtotal * impuestoRate
      const subtotal = total / (1 + impuestoRate);
      const igv = subtotal * impuestoRate;
      const simboloMoneda = configuracion?.simbolo_moneda || 'S/';
      const nombreMoneda = configuracion?.moneda || 'SOLES';

      doc.text('Valor operaciones gravadas:', 50, 220)
         .text(`${simboloMoneda} ${subtotal.toFixed(2)}`, 400, 220)
         .text(`Impuesto (${(impuestoRate * 100).toFixed(0)}%):`, 50, 235)
         .text(`${simboloMoneda} ${igv.toFixed(2)}`, 400, 235)
         .text('Importe total:', 50, 250)
         .text(`${simboloMoneda} ${total.toFixed(2)}`, 400, 250)
         .text(numeroALetras(total, nombreMoneda), 50, 280);

      // Finalizar PDF
      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}
