import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth, db } from '../config/firebaseConfig';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  User: undefined;
  AddService: undefined;
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
  const navigation = useNavigation<NavigationProp>();
  const [userName, setUserName] = useState('Người dùng');
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data and transactions
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetch user name from Realtime Database
        const userRef = ref(db, 'users/' + user.uid);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          setUserName(userSnapshot.val().fullName || 'Người dùng');
        }

        // Fetch transactions from Realtime Database
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
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
        }

        // Sắp xếp theo ngày mới nhất
        fetchedTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
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

      {/* Logo */}
      <Image
        source={require('../assets/firebase_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Danh sách thu chi */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Danh sách thu chi
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddService')}>
          <Ionicons name="add-circle" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.text} />
      ) : transactions.length === 0 ? (
        <Text style={[styles.noTransactions, { color: theme.text }]}>
          Không có giao dịch nào.
        </Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
              <View>
                <Text style={[styles.cardText, { color: theme.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.cardDate, { color: theme.text }]}>
                  {item.date}
                </Text>
              </View>
              <Text style={[styles.cardAmount, { color: item.type === 'income' ? 'green' : 'red' }]}>
                {item.type === 'income' ? '+' : '-'}${item.amount}
              </Text>
            </View>
          )}
        />
      )}
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