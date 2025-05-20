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
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebaseConfig';
import { ref, get, set } from 'firebase/database';
import { db } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
        navigation.navigate('Login');
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
      } catch {
        Alert.alert(t.genericError, t.loading);
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
      Alert.alert(t.genericError, t.loading);
    }
  };

  const handleSave = async () => {
    const { fullName, age, gender, avatarUrl } = userData;
    const user = auth.currentUser;
    if (!user) return;

    if (!fullName.trim()) {
      Alert.alert(t.genericError, `${t.fullName} ${t.required.toLowerCase()}!`);
      return;
    }

    if (!age || isNaN(Number(age)) || Number(age) > 150) {
      Alert.alert(t.genericError, `${t.age} không hợp lệ!`);
      return;
    }

    if (!gender || ![t.male.toLowerCase(), t.female.toLowerCase()].includes(gender.toLowerCase())) {
      Alert.alert(t.genericError, `${t.gender} chỉ được chọn "${t.male}" hoặc "${t.female}"!`);
      return;
    }

    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, { fullName, age, gender, avatarUrl });

    Alert.alert('✅', t.save);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      {/* Ảnh đại diện */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            userData.avatarUrl
              ? { uri: userData.avatarUrl }
              : require('../assets/avatar-placeholder.png')
          }
          style={styles.avatar}
        />
        <Text style={[styles.linkText, { color: theme.button }]}>{t.changeAvatar}</Text>
      </TouchableOpacity>

      {/* Họ tên */}
      <View style={[styles.inputGroup, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
        <Ionicons name="person" size={20} color={theme.text} style={styles.icon} />
        <TextInput
          placeholder={t.fullName}
          value={userData.fullName}
          onChangeText={(text) => setUserData({ ...userData, fullName: text })}
          style={[styles.input, { color: theme.inputText }]}
          placeholderTextColor={theme.placeholder}
        />
      </View>

      {/* Tuổi */}
      <View style={[styles.inputGroup, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
        <Ionicons name="calendar" size={20} color={theme.text} style={styles.icon} />
        <TextInput
          placeholder={t.age}
          keyboardType="numeric"
          value={userData.age}
          onChangeText={(text) => setUserData({ ...userData, age: text })}
          style={[styles.input, { color: theme.inputText }]}
          placeholderTextColor={theme.placeholder}
        />
      </View>

      {/* Giới tính */}
      <View style={[styles.inputGroup, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
        <Ionicons name="transgender" size={20} color={theme.text} style={styles.icon} />
        <TextInput
          placeholder={`${t.gender} (${t.male}/${t.female})`}
          value={userData.gender}
          onChangeText={(text) => setUserData({ ...userData, gender: text })}
          style={[styles.input, { color: theme.inputText }]}
          placeholderTextColor={theme.placeholder}
        />
      </View>

      {/* Nút lưu */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={handleSave}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>{t.save}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    zIndex: 1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  linkText: {
    marginBottom: 20,
    fontWeight: '500',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserScreen;
