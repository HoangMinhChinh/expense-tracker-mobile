import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert
} from 'react-native';
import { ref, push } from 'firebase/database';
import { auth, db } from '../config/firebaseConfig';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddServiceModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = async () => {
    const parsedAmount = Number(amount);
    if (!name.trim() || !amount || isNaN(parsedAmount)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ và hợp lệ');
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const now = new Date().toISOString();

    try {
      await push(ref(db, 'transactions'), {
        name,
        amount: parsedAmount,
        type: 'expense', // hoặc thêm nút chọn type nếu muốn
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
        date: now,
      });
      onSuccess?.();
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm giao dịch');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Thêm giao dịch</Text>

          <Text style={styles.label}>Tên giao dịch *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ví dụ: gội đầu"
            style={styles.input}
          />

          <Text style={styles.label}>Số tiền *</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Ví dụ: 30000"
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addText}>Thêm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '85%',
    elevation: 8,
    shadowColor: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#d6336c',
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
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
    color: '#555',
  },
});

export default AddServiceModal;
