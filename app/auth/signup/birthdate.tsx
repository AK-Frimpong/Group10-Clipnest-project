// Step-by-step wheel-style date picker with faded top/bottom using @react-native-picker/picker
// Install first: npm install @react-native-picker/picker

import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const defaultDays = Array.from({ length: 31 }, (_, i) => `${i + 1}`);

// Get days based on month and year
const getDaysInMonth = (month: string, year: string) => {
  if (!month || !year) return defaultDays;
  
  const monthIndex = months.indexOf(month);
  const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
};

const MIN_AGE = 13; // Minimum age requirement
const MAX_AGE = 100; // Maximum age requirement

// Generate years from current year minus MIN_AGE down to current year minus MAX_AGE
const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: MAX_AGE - MIN_AGE + 1 }, 
  (_, i) => `${currentYear - MIN_AGE - i}`
);

export default function BirthdateScreen() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [validDays, setValidDays] = useState(defaultDays);

  // Update available days when month or year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      const newDays = getDaysInMonth(selectedMonth, selectedYear);
      setValidDays(newDays);
      
      // If selected day is no longer valid, reset it
      if (selectedDay && parseInt(selectedDay) > newDays.length) {
        setSelectedDay('');
      }
    }
  }, [selectedMonth, selectedYear]);

  const isValidDate = () => {
    if (!selectedMonth || !selectedDay || !selectedYear) return false;

    const birthDate = new Date(
      parseInt(selectedYear),
      months.indexOf(selectedMonth),
      parseInt(selectedDay)
    );

    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      return false;
    }

    // Check if date is in the future
    if (birthDate > new Date()) {
      return false;
    }

    // Calculate age
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Check minimum age
    if (age < MIN_AGE || (age === MIN_AGE && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
      return false;
    }

    // Check maximum age
    if (age > MAX_AGE) {
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (isValidDate()) {
      router.push('/auth/signup/gender' as any);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Back button + dots */}
      <View style={styles.topNav}>
        <Pressable onPress={handleBack} style={styles.backWrapper}>
          <Image
            source={require('../../../assets/images/backIcon.png')}
            style={styles.backIcon}
          />
        </Pressable>
        <View style={styles.dots}>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === 2 && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <Text style={styles.title}>What's your birthdate?</Text>

        {/* Picker container */}
        <View style={styles.pickerWrapper}>
          <View style={styles.fadedOverlay} pointerEvents="none" />
          <View style={styles.pickerRow}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => {
                setSelectedMonth(itemValue);
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Month" value="" color="#AAAAAA" />
              {months.map((month) => (
                <Picker.Item key={month} label={month} value={month} />
              ))}
            </Picker>

            <Picker
              selectedValue={selectedDay}
              onValueChange={(itemValue) => {
                setSelectedDay(itemValue);
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Day" value="" color="#AAAAAA" />
              {validDays.map((day) => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>

            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => {
                setSelectedYear(itemValue);
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Year" value="" color="#AAAAAA" />
              {years.map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>
          <View style={[styles.fadedOverlay, { bottom: 0, top: 'auto' }]} pointerEvents="none" />
        </View>
      </View>

      {/* Next button */}
      <Pressable 
        style={[
          styles.nextButton,
          (!selectedMonth || !selectedDay || !selectedYear) && { opacity: 0.5 }
        ]} 
        onPress={handleNext}
        disabled={!selectedMonth || !selectedDay || !selectedYear}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181D1C',
    paddingTop: 60,
    alignItems: 'center',
  },
  topNav: {
    position: 'absolute',
    top: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backWrapper: {
    position: 'absolute',
    left: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AAAAAA',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#F3FAF8',
    backgroundColor: '#AAAAAA',
    marginTop: -1,
  },
  title: {
    color: '#F3FAF8',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  pickerWrapper: {
    height: 150,
    overflow: 'hidden',
    position: 'relative',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 340,
  },
  picker: {
    width: 110,
    height: 150,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: '#F3FAF8',
    fontSize: 22,
    height: 150,
  },
  fadedOverlay: {
    position: 'absolute',
    top: 0,
    height: 30,
    width: '100%',
    backgroundColor: '#181D1C',
    opacity: 0.7,
    zIndex: 1,
  },
  nextButton: {
    backgroundColor: '#7BDAC8',
    width: 334,
    height: 43,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '30%',
  },
  nextButtonText: {
    color: '#181D1C',
    fontSize: 18,
  },
  form: {
    position: 'absolute',
    top: 120,
    width: '100%',
    alignItems: 'center',
  },
});
