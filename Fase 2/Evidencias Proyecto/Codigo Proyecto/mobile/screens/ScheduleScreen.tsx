import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import axios from "axios";

LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene.",
    "Feb.",
    "Mar.",
    "Abr.",
    "May.",
    "Jun.",
    "Jul.",
    "Ago.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dic.",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

type GymClass = {
  id: string;
  name: string;
  instructor: string;
  time: string;
};

const gymClasses: GymClass[] = [
  { id: "1", name: "Yoga", instructor: "Carlos", time: "7:00 AM" },
  { id: "2", name: "Pilates", instructor: "Ana", time: "9:00 AM" },
  { id: "3", name: "Zumba", instructor: "Lucía", time: "6:00 PM" },
  { id: "4", name: "Spinning", instructor: "Marcos", time: "8:00 AM" },
  { id: "5", name: "Boxeo", instructor: "Pedro", time: "11:00 AM" },
  { id: "6", name: "Crossfit", instructor: "Luisa", time: "1:00 PM" },
  { id: "7", name: "Funcional", instructor: "Andrea", time: "3:00 PM" },
];

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [holidays, setHolidays] = useState<{
    [date: string]: { marked: boolean; dotColor: string; isHoliday: boolean };
  }>({});
  const [loading, setLoading] = useState<boolean>(true);

  const API_KEY = "ugl2ZVosHYv2MwkTSZYAqNHMFnG5k0v0";

  // Obtener los feriados 
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axios.get(
          `https://calendarific.com/api/v2/holidays`,
          {
            params: {
              api_key: API_KEY,
              country: "CL",
              year: new Date().getFullYear(),
            },
          }
        );
        const holidayDates: {
          [date: string]: {
            marked: boolean;
            dotColor: string;
            isHoliday: boolean;
          };
        } = {};
        response.data.response.holidays.forEach((holiday: any) => {
          holidayDates[holiday.date.iso] = {
            marked: true,
            dotColor: "red",
            isHoliday: true,
          };
        });
        setHolidays(holidayDates);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los feriados:", error);
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);


  const isGymClosed = (date: string) => {
    const dayOfWeek = new Date(date).getUTCDay(); 
    return dayOfWeek === 0 || dayOfWeek === 6 || holidays[date]?.isHoliday;
  };


  const getScheduleInfo = (date: string) => {
    if (holidays[date]?.isHoliday) {
      return "El gimnasio está cerrado por ser día feriado";
    }
    if (isGymClosed(date)) {
      return "El gimnasio está cerrado";
    }
    return "Horario: 6:00 AM - 10:00 PM";
  };


  const renderClass = ({ item }: { item: GymClass }) => (
    <View style={styles.classContainer}>
      <Text style={styles.classTitle}>{item.name}</Text>
      <Text style={styles.classDetails}>Instructor: {item.instructor}</Text>
      <Text style={styles.classDetails}>Horario: {item.time}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E86C1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Calendar
        onDayPress={(day: { dateString: string }) =>
          setSelectedDate(day.dateString)
        }
        markedDates={{
          ...holidays,
          [selectedDate || ""]: { selected: true, selectedColor: "#2c3e50" },
        }}
        initialDate={selectedDate} 
        firstDay={1}
        hideExtraDays={true}
      />

      {selectedDate && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{getScheduleInfo(selectedDate)}</Text>
        </View>
      )}

      {selectedDate && !isGymClosed(selectedDate) && (
        <>
          <Text style={styles.availableClassesText}>
            Clases disponibles para hoy:
          </Text>
          <FlatList
            data={gymClasses}
            keyExtractor={(item) => item.id}
            renderItem={renderClass}
            style={styles.classList}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  infoContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  infoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  availableClassesText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginTop: 10,
  },
  classList: {
    marginTop: 20,
  },
  classContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E86C1",
  },
  classDetails: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
