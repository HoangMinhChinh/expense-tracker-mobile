import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
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

interface Service {
  id: string;
  name: string;
  amount: number;
}

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [userName, setUserName] = useState('Huyền Trinh');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = ref(db, 'users/' + user.uid);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          setUserName(userSnapshot.val().fullName || 'Huyền Trinh');
        }

        const serviceRef = ref(db, 'transactions');
        const q = query(serviceRef, orderByChild('userId'), equalTo(user.uid));
        const snapshot = await get(q);

        const data: Service[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((child) => {
            const item = child.val();
            data.push({
              id: child.key!,
              name: item.name,
              amount: item.amount,
            });
          });
        }

        setServices(data);
      } catch (error) {
        console.log('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.userName, { color: theme.text }]}>
          {userName.toUpperCase()}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('User')}>
          <Ionicons name="person-circle" size={32} color={theme.text} />
        </TouchableOpacity>
      </View>

      <Image
        source={require('../assets/firebase_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Danh sách dịch vụ</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddService')}>
          <Ionicons name="add-circle" size={28} color="#d9534f" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.text} />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text numberOfLines={1} style={styles.cardText}>{item.name}</Text>
              <Text style={styles.cardAmount}>{item.amount.toLocaleString()} đ</Text>
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 60,
    alignSelf: 'center',
    marginBottom: 20,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 15,
    fontWeight: '500',
    maxWidth: '70%',
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HomeScreen;
