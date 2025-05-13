import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { auth, db } from '../config/firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { translations } from '../style/translations';
import { lightTheme, darkTheme } from '../style/theme';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList>;

type Expense = {
  id: string;
  name: string;
  amount: string;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState('User');
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const theme = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language];

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.fullName) {
          setUsername(data.fullName);
        } else {
          setUsername(user.displayName || 'User');
        }
      });

      const expensesRef = ref(db, `expenses/${user.uid}`);
      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedExpenses: Expense[] = Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name,
            amount: `${data[key].amount.toLocaleString()} đ`,
          }));
          setExpenses(loadedExpenses);
        } else {
          setExpenses([]);
        }
      });
    }
  }, []);

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={[styles.expenseItem, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
      <Text style={[styles.expenseName, { color: theme.text }]}>{item.name}</Text>
      <Text style={[styles.expenseAmount, { color: theme.text }]}>{item.amount}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerControls}>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
        >
          <Text>{language === 'vi' ? '🇻🇳' : '🇺🇸'}</Text>
          <Text style={[styles.languageText, { color: theme.text }]}> {language.toUpperCase()} </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.themeButton} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Ionicons
            name={isDarkMode ? 'moon' : 'sunny'}
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.greeting, { color: theme.text }]}> {t.welcome}, {username}! </Text>

      {/* <Image
        source={require('../assets/Logomark_Full_Color.png')} // File phải nằm trong /src/assets
        style={styles.logo}
        resizeMode="contain"
      /> */}

      <Text style={[styles.title, { color: theme.text }]}>{t.expenses}</Text>

      <View style={styles.buttonBar}>
        <TouchableOpacity
          style={[styles.buttonBarItem, { backgroundColor: theme.button }]}
          onPress={() => navigation.navigate('AddExpense')}
        >
          <Text style={[styles.buttonBarText, { color: theme.buttonText }]}>{t.addExpense}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonBarItem, { backgroundColor: theme.button }]}
          onPress={() => alert('Filter expenses')}
        >
          <Text style={[styles.buttonBarText, { color: theme.buttonText }]}>{t.filter}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.expenseList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  headerControls: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
    gap: 5,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 80,
    marginBottom: 10,
    textAlign: 'center',
  },
  logo: {
    width: 180,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  buttonBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  buttonBarItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonBarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseList: {
    paddingBottom: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;