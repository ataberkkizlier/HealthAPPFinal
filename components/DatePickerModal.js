// components/DatePickerModal.js
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import { COLORS } from '../constants';

const DatePickerModal = ({
  open,
  startDate,
  maxDate, // Add maxDate prop
  selectedDate,
  onClose,
  onChangeStartDate,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState(selectedDate || startDate);

  const handleDateChange = (date) => {
    setSelectedStartDate(date);
    if (onChangeStartDate) {
      onChangeStartDate(date);
    }
  };

  const modalVisible = open;

  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <DatePicker
            mode="calendar"
            minimumDate={startDate}
            maximumDate={maxDate} // Add maximumDate to restrict future dates
            selected={selectedStartDate}
            onDateChange={handleDateChange}
            onSelectedChange={(date) => setSelectedStartDate(date)}
            options={{
              backgroundColor: COLORS.primary,
              textHeaderColor: COLORS.white,
              textDefaultColor: '#FFFFFF',
              selectedTextColor: COLORS.primary,
              mainColor: COLORS.white,
              textSecondaryColor: '#FFFFFF',
              borderColor: COLORS.primary,
            }}
          />
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 35,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default DatePickerModal;