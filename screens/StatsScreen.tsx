import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { auth, db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { PieChart } from 'react-native-chart-kit';

interface Expense {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  userId: string;
}

const StatsScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const transactionsRef = ref(db, 'transactions');
    onValue(transactionsRef, (snapshot) => {
      const data: Expense[] = [];
      snapshot.forEach((child) => {
        const tx = child.val();
        if (tx.userId === user.uid && tx.type === 'expense') {
          data.push({ id: child.key, ...tx });
        }
        return true;
      });
      setExpenses(data);
    });
  }, []);

  const categoryTotals: { [category: string]: number } = {};
  expenses.forEach((item) => {
    const cat = item.category || 'Khác';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + item.amount;
  });

  const totalExpense = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  const COLORS = ['#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0', '#36A2EB', '#9966FF', '#C9CBCF'];

  const pieData = Object.keys(categoryTotals).map((cat, index) => {
    const amount = categoryTotals[cat];
    if (!amount || isNaN(amount)) return null;
    return {
      name: cat,
      population: amount,
      color: COLORS[index % COLORS.length] || '#ccc',
      legendFontColor: theme?.text || '#000',
      legendFontSize: 13,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const listData = Object.entries(categoryTotals).map(([cat, amount]) => ({
    category: cat,
    amount,
    percentage: ((amount / totalExpense) * 100).toFixed(1),
  })).sort((a, b) => b.amount - a.amount);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>      
      <Text style={[styles.title, { color: theme.text }]}>Báo cáo chi tiêu</Text>

      {pieData.length > 0 && (
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="20"
          absolute
        />
      )}

      <FlatList
        data={listData}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={[styles.itemCategory, { color: theme.text }]}>{item.category}</Text>
            <Text style={[styles.itemAmount, { color: theme.text }]}>              {item.amount.toLocaleString('vi-VN')}₫ ({item.percentage}%)
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  itemCategory: { fontSize: 16 },
  itemAmount: { fontSize: 16, fontWeight: '600' },
});

export default StatsScreen;
