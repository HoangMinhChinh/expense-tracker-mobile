import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, EventArg } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { ref, get, set } from 'firebase/database';
import { db } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';

// Add type definition for RootStackParamList
type RootStackParamList = {
  Home: undefined;
  User: undefined;
  Login: undefined;
};

// Update the navigation type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UserScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [userData, setUserData] = useState({
    fullName: '',
    age: '',
    gender: '',
    avatarUrl: '',
  });

  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const fileName = uri.split('/').pop() ?? `avatar_${Date.now()}.jpg`;
        const localUri = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({ from: uri, to: localUri });
        setUserData((prev) => ({ ...prev, avatarUrl: localUri }));
        await AsyncStorage.setItem('avatarUri', localUri);

        const user = auth.currentUser;
        if (user) {
          // First get existing data
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          const existingData = snapshot.exists() ? snapshot.val() : {};
          
          // Then update with new data while preserving existing data
          await set(userRef, {
            ...existingData,
            avatarUrl: localUri
          });
        }
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đăng xuất!');
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Validate required fields
      if (!userData.fullName.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập họ tên!');
        return;
      }

      if (!userData.age || parseInt(userData.age, 10) > 150) {
        Alert.alert('Lỗi', 'Tuổi không hợp lệ!');
        return;
      }

      if (!userData.gender) {
        Alert.alert('Lỗi', 'Vui lòng chọn giới tính!');
        return;
      }

      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, {
        fullName: userData.fullName,
        age: userData.age,
        gender: userData.gender,
        avatarUrl: userData.avatarUrl,
      });

      Alert.alert(
        '✅ Thành công', 
        'Đã lưu thông tin thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (err) {
      Alert.alert('❌ Lỗi', 'Không thể lưu thông tin!');
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          // Check if all required fields are present
          if (data.fullName?.trim() && data.age && data.gender) {
            navigation.navigate('Home');
            return;
          }
          // If any field is missing, set existing data and stay on UserScreen
          setUserData({
            fullName: data.fullName || '',
            age: data.age || '',
            gender: data.gender || '',
            avatarUrl: data.avatarUrl || '',
          });
        }
      } catch (error) {
        console.error('Load user data failed:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng!');
      }
    };
    loadUserData();
  }, []);

  // Add backButton handler to prevent going back if info is incomplete
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: EventArg<'beforeRemove', true>) => {
      // Prevent going back if user info is incomplete
      if (!userData.fullName?.trim() || !userData.age || !userData.gender) {
        e.preventDefault();
        Alert.alert(
          'Thông báo',
          'Vui lòng cập nhật đầy đủ thông tin trước khi tiếp tục!',
          [{ text: 'OK' }]
        );
      }
    });

    return unsubscribe;
  }, [navigation, userData]);

  return (
    <ScrollView>
      <Text style={{ textAlign: 'center' }}>{t.fullName}</Text>
      {/* UI content */}
    </ScrollView>
  );
};

export default UserScreen;