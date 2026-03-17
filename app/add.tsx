import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { actualizarMedicamento, agregarMedicamento } from '../src/database/db';

const DIAS_SEMANA = [
  { id: 'L', nombre: 'Lunes' }, { id: 'M', nombre: 'Martes' }, { id: 'X', nombre: 'Miércoles' },
  { id: 'J', nombre: 'Jueves' }, { id: 'V', nombre: 'Viernes' }, { id: 'S', nombre: 'Sábado' }, { id: 'D', nombre: 'Domingo' },
];

export default function AddMedScreen() {
  const params = useLocalSearchParams();
  const esEdicion = !!params.id;

  const [nombre, setNombre] = useState(params.nombre?.toString() || '');
  const [periodo, setPeriodo] = useState(params.periodo?.toString() || '');
  
  const diasIniciales = params.dias_consumo ? params.dias_consumo.toString().split(',') : [];
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(diasIniciales);
  
  const [intervaloHoras, setIntervaloHoras] = useState(params.intervalo_horas?.toString() || '');
  const [horaInicio, setHoraInicio] = useState(params.hora_inicio?.toString() || '');
  const [descripcion, setDescripcion] = useState(params.descripcion?.toString() || '');
  
  // Guardamos la fecha actual (formato YYYY-MM-DD) o la que ya traía si estamos editando
  const [fechaCreacion, setFechaCreacion] = useState(params.fecha_creacion?.toString() || new Date().toISOString().split('T')[0]);

  const toggleDia = (idDia: string) => {
    if (diasSeleccionados.includes(idDia)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== idDia));
    } else {
      setDiasSeleccionados([...diasSeleccionados, idDia]);
    }
  };

  const guardarMedicamento = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del medicamento es obligatorio');
      return;
    }

    const diasParaGuardar = diasSeleccionados.join(',');

    try {
      if (esEdicion) {
        await actualizarMedicamento(
          Number(params.id), nombre, parseInt(periodo) || 0, diasParaGuardar, 
          parseInt(intervaloHoras) || 0, parseInt(horaInicio) || 0, descripcion, fechaCreacion
        );
        Alert.alert('Éxito', 'Medicamento actualizado correctamente');
      } else {
        await agregarMedicamento(
          nombre, parseInt(periodo) || 0, diasParaGuardar, 
          parseInt(intervaloHoras) || 0, parseInt(horaInicio) || 0, descripcion, fechaCreacion
        );
        Alert.alert('Éxito', 'Medicamento guardado en tu dispositivo');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al procesar el medicamento');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nombre del medicamento:</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej. Paracetamol" />

      <Text style={styles.label}>Periodo de consumo (días totales):</Text>
      <TextInput style={styles.input} value={periodo} onChangeText={setPeriodo} placeholder="Ej. 7" keyboardType="numeric" />

      <Text style={styles.label}>Días de consumo:</Text>
      <View style={styles.diasContainer}>
        {DIAS_SEMANA.map((dia) => (
          <TouchableOpacity 
            key={dia.id} 
            style={[styles.diaCirculo, diasSeleccionados.includes(dia.id) ? styles.diaSeleccionado : null]}
            onPress={() => toggleDia(dia.id)}
          >
            <Text style={[styles.diaTexto, diasSeleccionados.includes(dia.id) ? styles.diaTextoSeleccionado : null]}>{dia.id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>¿Cada cuántas horas?:</Text>
      <TextInput style={styles.input} value={intervaloHoras} onChangeText={setIntervaloHoras} placeholder="Ej. 8" keyboardType="numeric" />

      <Text style={styles.label}>Hora de la primera toma (0-23):</Text>
      <TextInput style={styles.input} value={horaInicio} onChangeText={setHoraInicio} placeholder="Ej. 14" keyboardType="numeric" />

      <Text style={styles.label}>Descripción / Notas:</Text>
      <TextInput style={[styles.input, styles.textArea]} value={descripcion} onChangeText={setDescripcion} placeholder="Ej. Tomar en ayunas" multiline />

      <TouchableOpacity style={styles.botonGuardar} onPress={guardarMedicamento}>
        <Text style={styles.botonTexto}>{esEdicion ? 'Actualizar Medicamento' : 'Guardar Medicamento'}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 80, textAlignVertical: 'top' },
  diasContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  diaCirculo: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  diaSeleccionado: { backgroundColor: '#2196F3' },
  diaTexto: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  diaTextoSeleccionado: { color: '#fff' },
  botonGuardar: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  botonTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});