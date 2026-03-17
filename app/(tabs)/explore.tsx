import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { obtenerMedicamentos } from '../../src/database/db';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

const MAPEO_DIAS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function CalendarScreen() {
  const [medicamentos, setMedicamentos] = useState<any[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [medicamentosDelDia, setMedicamentosDelDia] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    const datos = await obtenerMedicamentos();
    setMedicamentos(datos);
  };

  const alPresionarDia = (day: any) => {
    setFechaSeleccionada(day.dateString);
    
    // Convertimos el string a Date local
    const [year, month, dayStr] = day.dateString.split('-');
    const fechaActual = new Date(Number(year), Number(month) - 1, Number(dayStr));
    const letraDia = MAPEO_DIAS[fechaActual.getDay()];

    const filtrados = medicamentos.filter(med => {
      // 1. ¿Toca tomarlo en este día de la semana?
      const tocaHoy = med.dias_consumo.includes(letraDia);
      
      // 2. ¿Está dentro de la vigencia del periodo?
      const fechaCreacionStr = med.fecha_creacion || day.dateString;
      const [yI, mI, dI] = fechaCreacionStr.split('-');
      
      const fechaInicio = new Date(Number(yI), Number(mI) - 1, Number(dI));
      const fechaFin = new Date(fechaInicio);
      
      // Le sumamos los días de periodo recetados
      fechaFin.setDate(fechaFin.getDate() + med.periodo - 1);

      // Verificamos si la fecha que el usuario tocó está entre el inicio y el fin
      const dentroDelPeriodo = fechaActual >= fechaInicio && fechaActual <= fechaFin;

      return tocaHoy && dentroDelPeriodo;
    });

    setMedicamentosDelDia(filtrados);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.tarjetaMini}>
      <Text style={styles.tarjetaTitulo}>{item.nombre}</Text>
      <Text style={styles.tarjetaTexto}>Cada {item.intervalo_horas}h (Inicia: {item.hora_inicio}:00)</Text>
      {item.descripcion ? <Text style={styles.tarjetaDesc}>{item.descripcion}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mi Calendario</Text>

      <Calendar
        onDayPress={alPresionarDia}
        markedDates={{
          [fechaSeleccionada]: { selected: true, disableTouchEvent: true, selectedColor: '#2196F3' }
        }}
        theme={{ todayTextColor: '#2196F3', arrowColor: '#2196F3' }}
      />

      <View style={styles.divisor} />

      <Text style={styles.subtitulo}>
        {fechaSeleccionada ? `Medicamentos para el ${fechaSeleccionada}` : 'Selecciona un día en el calendario'}
      </Text>

      {fechaSeleccionada && medicamentosDelDia.length === 0 ? (
        <Text style={styles.textoVacio}>No hay medicamentos programados para este día.</Text>
      ) : (
        <FlatList data={medicamentosDelDia} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20, textAlign: 'center', color: '#333' },
  divisor: { height: 1, backgroundColor: '#ddd', marginVertical: 20 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#555' },
  textoVacio: { fontSize: 16, color: '#888', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  tarjetaMini: { backgroundColor: '#fff', borderLeftWidth: 5, borderLeftColor: '#4CAF50', borderRadius: 8, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tarjetaTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  tarjetaTexto: { fontSize: 14, color: '#666', marginTop: 3 },
  tarjetaDesc: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: 5 }
});
