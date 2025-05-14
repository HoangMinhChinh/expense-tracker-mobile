import React, { useEffect, useState } from 'react';
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
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ✅ Khai báo kiểu navigation chính xác
type RootStackParamList = {
  Home: undefined;
  User: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UserScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const [userData, setUserData] = useState({
    fullName: '',
    age: '',
    gender: '',
    avatarUrl: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigation.navigate('Login'); // ✅ Không còn báo lỗi TS
        return;
      }

      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData({
            fullName: data.fullName || '',
            age: data.age || '',
            gender: data.gender || '',
            avatarUrl: data.avatarUrl || '',
          });
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng!');
      }
    };

    loadUserData();
  }, []);

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
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  };

  const handleSave = async () => {
    const { fullName, age, gender, avatarUrl } = userData;
    const user = auth.currentUser;
    if (!user) return;

    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên!');
      return;
    }

    if (!age || isNaN(Number(age)) || Number(age) > 150) {
      Alert.alert('Lỗi', 'Tuổi không hợp lệ!');
      return;
    }

    if (!gender) {
      Alert.alert('Lỗi', 'Vui lòng chọn giới tính!');
      return;
    }

    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, { fullName, age, gender, avatarUrl });

    Alert.alert('Thành công', 'Đã lưu thông tin!');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert('Lỗi', 'Không thể đăng xuất!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            userData.avatarUrl
              ? { uri: userData.avatarUrl }
              : require('../assets/avatar-placeholder.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.linkText}>Chọn ảnh đại diện</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Họ và tên"
        value={userData.fullName}
        onChangeText={(text) => setUserData({ ...userData, fullName: text })}
        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]}
        placeholderTextColor={theme.placeholder}
      />

      <TextInput
        placeholder="Tuổi"
        keyboardType="numeric"
        value={userData.age}
        onChangeText={(text) => setUserData({ ...userData, age: text })}
        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]}
        placeholderTextColor={theme.placeholder}
      />

      <TextInput
        placeholder="Giới tính (nam/nữ)"
        value={userData.gender}
        onChangeText={(text) => setUserData({ ...userData, gender: text })}
        style={[styles.input, { color: theme.text, backgroundColor: theme.inputBg }]}
        placeholderTextColor={theme.placeholder}
        // chỉnh thành chỉ nam hoặc nữ
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Lưu thông tin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
        {/* chỉnh thành nút back to homehome */}
      </TouchableOpacity>
    </ScrollView>
  );
};
// chỉnh lại 3 ô tên tuổi giới tính
// thêm icon ở 3 ô đóđó

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  linkText: {
    color: '#007bff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
  },
  logoutText: {
    color: 'red',
    fontSize: 16,
  },
});

export default UserScreen;
