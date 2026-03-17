import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { eliminarMedicamento, initDB, obtenerMedicamentos } from '../../src/database/db';

export default function HomeScreen() {
  const [dbLista, setDbLista] = useState(false);
  const [medicamentos, setMedicamentos] = useState<any[]>([]);

  useEffect(() => {
    const setupDatabase = async () => {
      await initDB();
      setDbLista(true);
    };
    setupDatabase();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (dbLista) cargarDatos();
    }, [dbLista])
  );

  const cargarDatos = async () => {
    const datos = await obtenerMedicamentos();
    setMedicamentos(datos);
  };

  const confirmarEliminacion = (id: number, nombre: string) => {
    Alert.alert("Eliminar Medicamento", `¿Estás seguro de que deseas eliminar ${nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí, eliminar", style: "destructive", onPress: async () => { await eliminarMedicamento(id); cargarDatos(); } }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.tarjeta}>
      <Text style={styles.tarjetaTitulo}>{item.nombre}</Text>
      <Text style={styles.tarjetaTexto}>🗓 Días: {item.dias_consumo} (Por {item.periodo} días)</Text>
      <Text style={styles.tarjetaTexto}>⏱ Frecuencia: Cada {item.intervalo_horas}h (Inicia a las {item.hora_inicio}:00)</Text>
      {item.descripcion ? <Text style={styles.tarjetaDesc}>{item.descripcion}</Text> : null}
      
      <View style={styles.accionesContainer}>
        <TouchableOpacity 
          style={styles.botonAccion}
          onPress={() => router.push({
            pathname: '/add',
            params: {
              id: item.id, nombre: item.nombre, periodo: item.periodo, 
              dias_consumo: item.dias_consumo, intervalo_horas: item.intervalo_horas, 
              hora_inicio: item.hora_inicio, descripcion: item.descripcion || '',
              fecha_creacion: item.fecha_creacion // Mantenemos la fecha original
            }
          })}
        >
          <Text style={styles.textoAccionModificar}>Modificar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.botonAccion} onPress={() => confirmarEliminacion(item.id, item.nombre)}>
          <Text style={styles.textoAccionEliminar}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!dbLista) return <View style={styles.container}><Text>Cargando base de datos...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Medicamentos</Text>
      {medicamentos.length === 0 ? (
        <View style={styles.listaVacia}><Text style={styles.textoVacio}>Aún no tienes medicamentos agendados.</Text></View>
      ) : (
        <FlatList data={medicamentos} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} />
      )}
      <View style={styles.botonContainer}>
        <Button title="+ Añadir Medicamento" onPress={() => router.push('/add')} color="#4CAF50" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20, textAlign: 'center', color: '#333' },
  listaVacia: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textoVacio: { fontSize: 16, color: '#666', fontStyle: 'italic' },
  botonContainer: { marginTop: 10, marginBottom: 10 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  tarjetaTitulo: { fontSize: 18, fontWeight: 'bold', color: '#2196F3', marginBottom: 5 },
  tarjetaTexto: { fontSize: 14, color: '#555', marginBottom: 3 },
  tarjetaDesc: { fontSize: 13, color: '#888', fontStyle: 'italic', marginTop: 5 },
  accionesContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  botonAccion: { marginLeft: 15 },
  textoAccionModificar: { color: '#FF9800', fontWeight: 'bold' },
  textoAccionEliminar: { color: '#F44336', fontWeight: 'bold' }
});