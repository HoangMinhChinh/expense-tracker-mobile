import React, { useState, useEffect } from 'react';
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
  Alert,
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

  // Đặt lại trạng thái khi modal đóng
  useEffect(() => {
    if (!visible) {
      setType('all');
      setKeyword('');
      setStartDate('');
      setEndDate('');
    }
  }, [visible]);

  const formatDateForDisplay = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForApply = (displayDate: string) => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`; // Chuyển thành YYYY-MM-DD
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const start = new Date(formatDateForApply(startDate));
      const end = new Date(formatDateForApply(endDate));
      if (start > end) {
        Alert.alert(t.error || 'Lỗi', 'Ngày bắt đầu phải trước ngày kết thúc');
        return;
      }
    }

    onApply({
      type,
      startDate: formatDateForApply(startDate),
      endDate: formatDateForApply(endDate),
      keyword: keyword.trim(),
    });
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
            <View
              style={[
                styles.modalBox,
                { backgroundColor: theme.inputBg || (isDarkMode ? '#333' : '#fff') },
              ]}
            >
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text || '#000' }]}>{t.filter || 'Lọc'}</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={theme.text || '#000'} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.text || '#000' }]}>{t.typeLabel || 'Loại giao dịch'}</Text>
              <View style={styles.typeRow}>
                {['all', 'income', 'expense'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.typeButton,
                      { backgroundColor: theme.cardBackground || (isDarkMode ? '#444' : '#eee') },
                      type === option && { backgroundColor: theme.button || '#0288D1' },
                    ]}
                    onPress={() => setType(option)}
                  >
                    <Text style={{ color: type === option ? theme.buttonText || '#fff' : theme.text || '#000' }}>
                      {option === 'all' ? t.all || 'Tất cả' : option === 'income' ? t.income || 'Thu' : t.expense || 'Chi'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.text || '#000' }]}>{t.keyword || 'Từ khóa'}</Text>
              <TextInput
                placeholder={t.keyword || 'Nhập từ khóa tìm kiếm'}
                placeholderTextColor={theme.placeholder || '#999'}
                value={keyword}
                onChangeText={setKeyword}
                style={[
                  styles.input,
                  { color: theme.inputText || '#000', borderColor: theme.border || '#ccc' },
                ]}
              />

              <Text style={[styles.label, { color: theme.text || '#000' }]}>{t.fromDate || 'Từ ngày'}</Text>
              <TouchableOpacity
                style={[styles.dateInputContainer, { borderColor: theme.border || '#ccc' }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text
                  style={[
                    styles.dateText,
                    { color: startDate ? theme.inputText || '#000' : theme.placeholder || '#999' },
                  ]}
                >
                  {startDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={theme.text || '#000'} style={styles.calendarIcon} />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showStartDatePicker}
                mode="date"
                onConfirm={(date) => {
                  setStartDate(formatDateForDisplay(date));
                  setShowStartDatePicker(false);
                }}
                onCancel={() => setShowStartDatePicker(false)}
                date={startDate ? new Date(formatDateForApply(startDate)) : new Date()}
                maximumDate={endDate ? new Date(formatDateForApply(endDate)) : new Date()} // Không chọn ngày tương lai
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                themeVariant={isDarkMode ? 'dark' : 'light'}
              />

              <Text style={[styles.label, { color: theme.text || '#000' }]}>{t.toDate || 'Đến ngày'}</Text>
              <TouchableOpacity
                style={[styles.dateInputContainer, { borderColor: theme.border || '#ccc' }]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text
                  style={[
                    styles.dateText,
                    { color: endDate ? theme.inputText || '#000' : theme.placeholder || '#999' },
                  ]}
                >
                  {endDate || 'DD/MM/YYYY'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={theme.text || '#000'} style={styles.calendarIcon} />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showEndDatePicker}
                mode="date"
                onConfirm={(date) => {
                  setEndDate(formatDateForDisplay(date));
                  setShowEndDatePicker(false);
                }}
                onCancel={() => setShowEndDatePicker(false)}
                date={endDate ? new Date(formatDateForApply(endDate)) : new Date()}
                minimumDate={startDate ? new Date(formatDateForApply(startDate)) : undefined}
                maximumDate={new Date()} // Không chọn ngày tương lai
                display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                themeVariant={isDarkMode ? 'dark' : 'light'}
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.button || '#0288D1' }]}
                  onPress={handleApply}
                >
                  <Text style={[styles.addText, { color: theme.buttonText || '#fff' }]}>{t.apply || 'Áp dụng'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.border || '#999' }]}
                  onPress={onClose}
                >
                  <Text style={[styles.cancelText, { color: theme.text || '#333' }]}>{t.cancel || 'Hủy'}</Text>
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
    padding: 16, // Giảm padding cho thiết bị nhỏ
    borderRadius: 16,
    width: '90%',
    maxWidth: 360, // Giảm maxWidth cho màn hình nhỏ
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20, // Giảm fontSize cho tiêu đề
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    fontSize: 14, // Giảm fontSize cho label
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
  },
  calendarIcon: {
    marginLeft: 8,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginLeft: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FilterModal;