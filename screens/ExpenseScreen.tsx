import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AddServiceModal from './AddServiceModal';

interface Expense {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const ExpenseScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [allTransactions, setAllTransactions] = useState<Expense[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Expense | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      alert(t.userNotFound);
      return;
    }

    const transactionsRef = ref(db, 'transactions');
    const unsubscribe = onValue(transactionsRef, (snapshot) => {
      const data: Expense[] = [];
      const marked: { [key: string]: { dots: { key: string; color: string; selectedDotColor: string }[] } } = {};

      snapshot.forEach((child) => {
        const tx = child.val();
        if (tx.userId === user.uid) {
          const txDate = typeof tx.date === 'string' ? tx.date.slice(0, 10) : new Date(tx.date).toISOString().slice(0, 10);
          data.push({ id: child.key, ...tx, date: txDate });

          // Khởi tạo marked[txDate] nếu chưa tồn tại
          if (!marked[txDate]) {
            marked[txDate] = { dots: [] };
          }

          // Chỉ thêm một dấu chấm cho mỗi loại (income/expense) mỗi ngày
          if (tx.type === 'income' && !marked[txDate].dots.some((dot) => dot.key === `income-${txDate}`)) {
            marked[txDate].dots.push({
              key: `income-${txDate}`,
              color: '#34C759',
              selectedDotColor: '#34C759',
            });
          } else if (tx.type === 'expense' && !marked[txDate].dots.some((dot) => dot.key === `expense-${txDate}`)) {
            marked[txDate].dots.push({
              key: `expense-${txDate}`,
              color: '#FF3B30',
              selectedDotColor: '#FF3B30',
            });
          }
        }
      });

      // Lọc giao dịch theo ngày được chọn
      const filteredData = data.filter((tx) => tx.date === selectedDate);
      setTransactions(filteredData);
      setAllTransactions(data);
      setMarkedDates({
        ...marked,
        [selectedDate]: {
          ...marked[selectedDate],
          selected: true,
          selectedColor: theme.button,
        },
      });
    }, (error) => {
      console.error('Lỗi khi lấy giao dịch:', error);
      alert(t.genericError);
    });

    return () => unsubscribe();
  }, [selectedDate, t]);

  const handleSuccess = () => {
    // Làm mới dữ liệu sau khi thêm/sửa/xóa giao dịch
    const transactionsRef = ref(db, 'transactions');
    onValue(
      transactionsRef,
      (snapshot) => {
        const data: Expense[] = [];
        snapshot.forEach((child) => {
          const transaction = child.val();
          if (transaction.userId === auth.currentUser?.uid) {
            data.push({
              id: child.key,
              ...transaction,
            });
          }
        });
        const filteredData = data.filter((tx) => tx.date === selectedDate);
        setTransactions(filteredData);
        setAllTransactions(data);
      },
      { onlyOnce: true }
    );
  };

  const handleItemPress = (transaction: Expense) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  // Tính tổng thu/chi/tổng cho tháng hiện tại
  const monthTransactions = allTransactions.filter((t) => t.date.startsWith(currentMonth));
  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const total = income - expense;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t.expenses || 'Chi tiêu'}</Text>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        onMonthChange={(month) => setCurrentMonth(`${month.year}-${month.month.toString().padStart(2, '0')}`)}
        markedDates={markedDates}
        markingType={'multi-dot'}
        theme={{
          backgroundColor: theme.background,
          calendarBackground: theme.cardBackground,
          textSectionTitleColor: theme.text,
          selectedDayBackgroundColor: theme.button,
          selectedDayTextColor: theme.buttonText,
          todayTextColor: theme.button,
          dayTextColor: theme.text,
          textDisabledColor: theme.placeholder,
        }}
      />

      <View style={styles.summaryRow}>
        <Text style={[styles.income, { color: '#34C759' }]}>
          {t.income || 'Thu'}{'\n'}{income.toLocaleString('vi-VN')}₫
        </Text>
        <Text style={[styles.expense, { color: '#FF3B30' }]}>
          {t.expense || 'Chi'}{'\n'}{expense.toLocaleString('vi-VN')}₫
        </Text>
        <Text style={[styles.total, { color: total >= 0 ? '#34C759' : '#FF3B30' }]}>
          {t.total || 'Tổng'}{'\n'}
          {(total >= 0 ? '+' : '')}{total.toLocaleString('vi-VN')}₫
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.text }]}>{t.noData || 'Không có dữ liệu'}</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { borderColor: theme.border }]}
            onPress={() => handleItemPress(item)}
          >
            <View>
              <Text style={[styles.itemLabel, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.itemDate, { color: theme.placeholder }]}>
                {new Date(item.date).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <Text
              style={[
                styles.itemAmount,
                { color: item.type === 'income' ? '#34C759' : '#FF3B30' },
              ]}
            >
              {(item.type === 'income' ? '+' : '-')}{item.amount.toLocaleString('vi-VN')}₫
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />

      <View style={[styles.banner, { backgroundColor: theme.cardBackground }]}>
        <Text style={{ color: theme.text }}>[ {t.addService || 'Thêm dịch vụ'} ]</Text>
      </View>

      <AddServiceModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedTransaction(null);
        }}
        onSuccess={handleSuccess}
        editMode={!!selectedTransaction}
        transaction={selectedTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  income: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  expense: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDate: {
    fontSize: 14,
    marginTop: 4,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  banner: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default ExpenseScreen;