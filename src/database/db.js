import * as SQLite from 'expo-sqlite';

const DB_NAME = 'medicamentos_v5.db';
let dbInstance = null; // Aquí guardaremos la conexión única (Singleton)

// Esta función asegura que solo abramos la base de datos una vez en toda la app
const obtenerConexion = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
};

export const initDB = async () => {
  try {
    const db = await obtenerConexion();
    
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS medicamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        periodo INTEGER,
        dias_consumo TEXT,
        intervalo_horas INTEGER,
        hora_inicio INTEGER,
        descripcion TEXT,
        fecha_creacion TEXT
      );
    `);
    
    console.log("Base de datos v5 y tabla preparadas con Singleton");
    return db;
  } catch (error) {
    console.error("Error al inicializar la base de datos: ", error);
  }
};

export const agregarMedicamento = async (nombre, periodo, dias_consumo, intervalo_horas, hora_inicio, descripcion, fecha_creacion) => {
  try {
    const db = await obtenerConexion(); // Usamos la conexión única
    
    const safeNombre = String(nombre || '');
    const safePeriodo = Number(periodo) || 0;
    const safeDias = String(dias_consumo || '');
    const safeIntervalo = Number(intervalo_horas) || 0;
    const safeHoraInicio = Number(hora_inicio) || 0;
    const safeDescripcion = String(descripcion || '');
    const safeFecha = String(fecha_creacion || '');

    const result = await db.runAsync(
      `INSERT INTO medicamentos (nombre, periodo, dias_consumo, intervalo_horas, hora_inicio, descripcion, fecha_creacion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [safeNombre, safePeriodo, safeDias, safeIntervalo, safeHoraInicio, safeDescripcion, safeFecha]
    );
    
    console.log("Medicamento guardado con ID:", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error al guardar el medicamento: ", error);
    throw error;
  }
};

export const actualizarMedicamento = async (id, nombre, periodo, dias_consumo, intervalo_horas, hora_inicio, descripcion, fecha_creacion) => {
  try {
    const db = await obtenerConexion();
    
    const safeId = Number(id) || 0;
    const safeNombre = String(nombre || '');
    const safePeriodo = Number(periodo) || 0;
    const safeDias = String(dias_consumo || '');
    const safeIntervalo = Number(intervalo_horas) || 0;
    const safeHoraInicio = Number(hora_inicio) || 0;
    const safeDescripcion = String(descripcion || '');
    const safeFecha = String(fecha_creacion || '');

    await db.runAsync(
      `UPDATE medicamentos 
       SET nombre = ?, periodo = ?, dias_consumo = ?, intervalo_horas = ?, hora_inicio = ?, descripcion = ?, fecha_creacion = ? 
       WHERE id = ?`,
      [safeNombre, safePeriodo, safeDias, safeIntervalo, safeHoraInicio, safeDescripcion, safeFecha, safeId]
    );
    
    console.log("Medicamento actualizado con ID:", safeId);
    return true;
  } catch (error) {
    console.error("Error al actualizar el medicamento: ", error);
    throw error;
  }
};

export const obtenerMedicamentos = async () => {
  try {
    const db = await obtenerConexion();
    const todosLosMedicamentos = await db.getAllAsync('SELECT * FROM medicamentos ORDER BY id DESC');
    return todosLosMedicamentos;
  } catch (error) {
    console.error("Error al obtener los medicamentos: ", error);
    return [];
  }
};

export const eliminarMedicamento = async (id) => {
  try {
    const db = await obtenerConexion();
    await db.runAsync('DELETE FROM medicamentos WHERE id = ?', [id]);
    console.log("Medicamento eliminado con ID:", id);
    return true;
  } catch (error) {
    console.error("Error al eliminar el medicamento: ", error);
    throw error;
  }
};