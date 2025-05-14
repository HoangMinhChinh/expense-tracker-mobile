// src/components/AddServiceModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
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

  // Khởi tạo state từ transaction nếu ở editMode
  const [name, setName] = useState(transaction?.name || '');
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');

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
        <View style={[styles.modalBox, { backgroundColor: theme.inputBg }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            {editMode ? 'Sửa giao dịch' : 'Thêm giao dịch'}
          </Text>

          {/* Phần chọn "Thu"/"Chi" */}
          <Text style={[styles.label, { color: theme.text }]}>Loại giao dịch *</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
              onPress={() => setType('income')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: type === 'income' ? '#fff' : theme.text },
                ]}
              >
                Thu
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
              onPress={() => setType('expense')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeText,
                  { color: type === 'expense' ? '#fff' : theme.text },
                ]}
              >
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
          <Text style={[styles.label, { color: theme.text }]}>Số tiền *</Text>
          <TextInput
            placeholder="Ví dụ: 30000"
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
            Số tiền sẽ hiển thị: {type === 'income' ? '+' : '-'}
            {Number(amount || 0).toLocaleString()} vnd
          </Text>

          {/* Nút hành động */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={editMode ? handleSaveEdit : handleAdd}
          >
            <Text style={styles.addText}>{editMode ? 'Lưu' : 'Thêm'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: theme.text }]}>Hủy</Text>
          </TouchableOpacity>
          {editMode && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleDelete}>
              <Text style={[styles.cancelText, { color: '#FF3B30' }]}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    padding: 20,
    borderRadius: 16,
    width: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeButtonActiveIncome: {
    backgroundColor: '#34C759', // Màu xanh cho "Thu"
    borderColor: '#34C759',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  typeButtonActiveExpense: {
    backgroundColor: '#FF3B30', // Màu đỏ cho "Chi"
    borderColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  addButton: {
    backgroundColor: '#d6336c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
  },
});

export default AddServiceModal;