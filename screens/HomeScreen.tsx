import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, db } from '../config/firebaseConfig';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import AddServiceModal from '../screens/AddServiceModal';
import FilterModal from '../screens/FilterModal';
import { useLanguage } from '../context/LanguageContext';

export type RootStackParamList = {
  Home: undefined;
  User: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

const HomeScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const [userName, setUserName] = useState(t('user'));
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({ type: 'all', startDate: '', endDate: '', keyword: '' });

  const isFocused = useIsFocused();

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      const userRef = ref(db, 'users/' + user.uid);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        setUserName(userSnapshot.val().fullName || t('user'));
      }

      const transactionsRef = ref(db, 'transactions');
      const userTransactionsQuery = query(
        transactionsRef,
        orderByChild('userId'),
        equalTo(user.uid)
      );

      const transactionSnapshot = await get(userTransactionsQuery);
      const fetchedTransactions: Expense[] = [];

      if (transactionSnapshot.exists()) {
        transactionSnapshot.forEach((childSnapshot) => {
          fetchedTransactions.push({
            id: childSnapshot.key!,
            ...childSnapshot.val(),
          });
        });
      }

      fetchedTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setTransactions(fetchedTransactions);
      applyFilters(fetchedTransactions, filters);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: Expense[], currentFilters: { type: string; startDate: string; endDate: string; keyword: string }) => {
    let filtered = [...data];

    if (currentFilters.type !== 'all') {
      filtered = filtered.filter((transaction) => transaction.type === currentFilters.type);
    }

    if (currentFilters.keyword) {
      const keywordLower = currentFilters.keyword.toLowerCase();
      filtered = filtered.filter((transaction) =>
        transaction.name.toLowerCase().includes(keywordLower)
      );
    }

    if (!currentFilters.startDate && !currentFilters.endDate) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      });
    } else {
      if (currentFilters.startDate) {
        const start = new Date(currentFilters.startDate.split('/').reverse().join('-'));
        filtered = filtered.filter((transaction) => new Date(transaction.date) >= start);
      }
      if (currentFilters.endDate) {
        const end = new Date(currentFilters.endDate.split('/').reverse().join('-'));
        filtered = filtered.filter((transaction) => new Date(transaction.date) <= end);
      }
    }

    setFilteredTransactions(filtered);
  };

  const handleApplyFilters = (newFilters: { type: string; startDate: string; endDate: string; keyword: string }) => {
    setFilters(newFilters);
    applyFilters(transactions, newFilters);
  };

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  const openAddModal = () => {
    setEditMode(false);
    setSelectedTransaction(null);
    setModalVisible(true);
  };

  const openEditModal = (item: Expense) => {
    setEditMode(true);
    setSelectedTransaction(item);
    setModalVisible(true);
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerProfile}
          onPress={() => navigation.navigate('User')}
        >
          <Text style={[styles.headerName, { color: theme.text }]}>
            {userName.toUpperCase()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('User')}>
          <Image
            source={require('../assets/avatar-placeholder.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <Image
        source={require('../assets/firebase_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('transactionList')}
        </Text>
        <View style={styles.sectionButtons}>
          <TouchableOpacity onPress={openAddModal}>
            <Ionicons name="add-circle" size={28} color={theme.text} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openFilterModal}>
            <Ionicons name="filter" size={28} color={theme.text} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.text} />
      ) : filteredTransactions.length === 0 ? (
        <Text style={[styles.noTransactions, { color: theme.text }]}>
          {t('noTransactions')}
        </Text>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openEditModal(item)}
              style={[styles.card, { backgroundColor: theme.cardBackground }]}
            >
              <View>
                <Text style={[styles.cardText, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.cardDate, { color: theme.text }]}>
                  {formatDate(item.date)}
                </Text>
              </View>
              <Text
                style={[
                  styles.cardAmount,
                  { color: item.type === 'income' ? 'green' : 'red' },
                ]}
              >
                {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString('vi-VN')} vnd
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 45 }}
        />
      )}

      <AddServiceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={fetchData}
        editMode={editMode}
        transaction={selectedTransaction}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  headerName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logo: {
    width: 120,
    height: 40,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionButtons: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 10,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardDate: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noTransactions: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    opacity: 0.7,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeScreen;
