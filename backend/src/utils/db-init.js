import sequelize from '../config/database.js';
import Usuario from '../models/Usuario.js';

export async function initDB() {
  try {
    // Sincronizar todos los modelos
    await sequelize.sync({ force: false });
    console.log('Base de datos sincronizada');


  } catch (error) {
    console.error('Error inicializando la base de datos:', error);
    throw error;
  }
}
