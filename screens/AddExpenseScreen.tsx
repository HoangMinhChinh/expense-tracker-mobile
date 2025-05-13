import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref, push } from 'firebase/database';
import { db, auth } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

const predefinedCategories = [
  'Ăn uống',
  'Đi lại',
  'Giải trí',
  'Mua sắm',
  'Hóa đơn',
  'Khác',
];

export default function AddExpenseScreen() {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const navigation = useNavigation();

  const handleAddExpense = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!category.trim() || !amount.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    const newExpense = {
      name: category,
      amount: parseFloat(amount),
      createdAt: new Date().toISOString(),
    };

    try {
      await push(ref(db, `expenses/${user.uid}`), newExpense);
      Alert.alert('Thành công', 'Chi tiêu đã được thêm.');
      setCategory('');
      setAmount('');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm chi tiêu.');
      console.error(error);
    }
  };

  const handleAddCustomCategory = () => {
    if (!category.trim()) return;
    setCustomCategories([...customCategories, category]);
    setCategory('');
  };

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => setCategory(item)} style={styles.categoryItem}>
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Chọn hoặc thêm tên chi tiêu</Text>

      <FlatList
        data={[...predefinedCategories, ...customCategories]}
        horizontal
        renderItem={renderCategory}
        keyExtractor={(item, index) => item + index}
        contentContainerStyle={styles.categoryList}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={category}
          onChangeText={setCategory}
          placeholder="Tên chi tiêu mới..."
          style={styles.inputFlex}
        />
        <TouchableOpacity onPress={handleAddCustomCategory}>
          <Ionicons name="add-circle" size={28} color="#007bff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Số tiền</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Nhập số tiền"
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
        <Text style={styles.buttonText}>Lưu chi tiêu</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  categoryList: {
    marginBottom: 16,
    gap: 10,
  },
  categoryItem: {
    backgroundColor: '#eee',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
});
