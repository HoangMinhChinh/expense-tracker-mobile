import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { ref, push, update, remove } from 'firebase/database';
import { auth, db } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';

interface Expense {
  id?: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editMode?: boolean;
  transaction?: Expense | null;
}

const AddServiceModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  editMode = false,
  transaction = null,
}) => {
  const { theme } = useTheme();

  const [name, setName] = useState(transaction?.name || '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');

  useEffect(() => {
    if (editMode && transaction) {
      setName(transaction.name || '');
      setAmount(transaction.amount?.toString() || '');
      setType(transaction.type || 'expense');
    } else {
      setName('');
      setAmount('');
      setType('expense');
    }
  }, [editMode, transaction]);

  const handleAdd = async () => {
    const parsedAmount = Number(amount);
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên giao dịch không được để trống!');
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Lỗi', 'Số tiền phải là một số hợp lệ và lớn hơn 0!');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const now = new Date().toISOString();

    try {
      await push(ref(db, 'transactions'), {
        name: name.trim(),
        amount: parsedAmount,
        type,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
        date: now,
      });
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Lỗi khi thêm giao dịch:', error);
      Alert.alert('Lỗi', 'Không thể thêm giao dịch');
    }
  };

  const handleSaveEdit = async () => {
    if (!transaction?.id) return;
    const parsedAmount = Number(amount);
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên giao dịch không được để trống!');
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Lỗi', 'Số tiền phải là một số hợp lệ và lớn hơn 0!');
      return;
    }
    try {
      await update(ref(db, `transactions/${transaction.id}`), {
        name: name.trim(),
        amount: parsedAmount,
        type,
        updatedAt: new Date().toISOString(),
      });
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Lỗi khi cập nhật giao dịch:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật giao dịch');
    }
  };

  const handleDelete = async () => {
    if (!transaction?.id) return;
    Alert.alert('Xác nhận xóa', 'Bạn có chắc muốn xóa giao dịch này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(ref(db, `transactions/${transaction.id}`));
            onSuccess?.();
            onClose();
            resetForm();
          } catch (error) {
            console.error('Lỗi khi xóa giao dịch:', error);
            Alert.alert('Lỗi', 'Không thể xóa giao dịch');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setType('expense');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={[styles.modalBox, { backgroundColor: theme.inputBg }]}>
              <Text style={[styles.title, { color: theme.text }]}>
                {editMode ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch'}
              </Text>

              {/* Loại giao dịch */}
              <Text style={[styles.label, { color: theme.text }]}>Loại giao dịch *</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'income' && styles.typeButtonActiveIncome,
                  ]}
                  onPress={() => setType('income')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeText, { color: type === 'income' ? '#fff' : theme.text }]}>
                    Thu
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'expense' && styles.typeButtonActiveExpense,
                  ]}
                  onPress={() => setType('expense')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.typeText, { color: type === 'expense' ? '#fff' : theme.text }]}>
                    Chi
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tên giao dịch */}
              <Text style={[styles.label, { color: theme.text }]}>Tên giao dịch *</Text>
              <TextInput
                placeholder="Ví dụ: gội đầu"
                placeholderTextColor={theme.placeholder}
                value={name}
                onChangeText={setName}
                style={[styles.input, { color: theme.inputText, borderColor: theme.border }]}
              />


              {/* Số tiền */}
              <Text style={[styles.label, { color: theme.text }]}>Số tiền (VND) *</Text>
              <TextInput
                placeholder="Nhập số tiền, ví dụ: 100000"
                placeholderTextColor={theme.placeholder}
                value={amount}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setAmount(numericValue);
                }}
                keyboardType="numeric"
                style={[styles.input, { color: theme.inputText, borderColor: theme.border }]}
              />
              <Text style={[styles.previewText, { color: theme.text }]}>
                {Number(amount || 0).toLocaleString('vi-VN')} VND {type === 'income' ? '(Thu)' : '(Chi)'}
              </Text>

              {/* Nút hành động */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: '#0288D1' }]}
                  onPress={editMode ? handleSaveEdit : handleAdd}
                >
                  <Text style={styles.buttonText}>{editMode ? 'Lưu' : 'Thêm'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: '#E0E0E0' }]}
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, { color: '#333' }]}>Hủy</Text>
                </TouchableOpacity>
                {editMode && (
                  <TouchableOpacity
                    style={[styles.secondaryButton, { backgroundColor: '#FF3B30' }]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.buttonText, { color: '#fff' }]}>Xóa</Text>
                  </TouchableOpacity>
                )}
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
    borderRadius: 16,
    width: '90%',
    maxWidth: 360,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    backgroundColor: '#F0F0F0',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#34C759',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typeButtonActiveExpense: {
    backgroundColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.8,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AddServiceModal;