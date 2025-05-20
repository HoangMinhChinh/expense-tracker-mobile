import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../style/translations';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    type: string;
    startDate: string;
    endDate: string;
    keyword: string;
  }) => void;
}

const FilterModal = ({ visible, onClose, onApply }: FilterModalProps) => {
  const { theme, isDarkMode } = useTheme();
  const { language } = useLanguage();
  const t = translations[language || 'vi'];

  const [type, setType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const formatDateForDisplay = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleApply = () => {
    onApply({ type, startDate, endDate, keyword });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.modalBox, { backgroundColor: theme.inputBg || '#fff' }]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>{t.filter}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.text }]}>{t.typeLabel}</Text>
              <View style={styles.typeRow}>
                {['all', 'income', 'expense'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.typeButton, type === option && styles.activeType]}
                    onPress={() => setType(option)}
                  >
                    <Text style={{ color: type === option ? '#fff' : theme.text }}>
                      {option === 'all' ? t.all : option === 'income' ? t.income : t.expense}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>{t.keyword}</Text>
              <TextInput
                placeholder={t.transactionNamePlaceholder}
                placeholderTextColor={theme.placeholder || '#999'}
                value={keyword}
                onChangeText={setKeyword}
                style={[styles.input, { color: theme.inputText, borderColor: theme.border }]}
              />

              <Text style={[styles.label, { color: theme.text }]}>{t.fromDate}</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={[styles.dateText, { color: startDate ? theme.inputText : theme.placeholder || '#999' }]}>
                  {startDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={theme.text} style={styles.calendarIcon} />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showStartDatePicker}
                mode="date"
                onConfirm={(date) => {
                  setStartDate(formatDateForDisplay(date));
                  setShowStartDatePicker(false);
                }}
                onCancel={() => setShowStartDatePicker(false)}
                date={startDate ? new Date(startDate.split('/').reverse().join('-')) : new Date()}
                maximumDate={endDate ? new Date(endDate.split('/').reverse().join('-')) : undefined}
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                themeVariant={isDarkMode ? 'dark' : 'light'}
              />

              <Text style={[styles.label, { color: theme.text }]}>{t.toDate}</Text>
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={[styles.dateText, { color: endDate ? theme.inputText : theme.placeholder || '#999' }]}>
                  {endDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={theme.text} style={styles.calendarIcon} />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showEndDatePicker}
                mode="date"
                onConfirm={(date) => {
                  setEndDate(formatDateForDisplay(date));
                  setShowEndDatePicker(false);
                }}
                onCancel={() => setShowEndDatePicker(false)}
                date={endDate ? new Date(endDate.split('/').reverse().join('-')) : new Date()}
                minimumDate={startDate ? new Date(startDate.split('/').reverse().join('-')) : undefined}
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                themeVariant={isDarkMode ? 'dark' : 'light'}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleApply}>
                  <Text style={styles.addText}>{t.apply}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelText}>{t.cancel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    padding: 24,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
  calendarIcon: {
    marginLeft: 10,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  activeType: {
    backgroundColor: '#0288D1',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#0288D1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  addText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderWidth: 1,
    borderColor: '#999',
    marginLeft: 5,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default FilterModal;
