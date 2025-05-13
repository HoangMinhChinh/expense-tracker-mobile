import React, { useEffect, useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';

const UserScreen = () => {
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
        const fileName = uri.split('/').pop()?? `avatar_${Date.now()}.jpg`;
        const localUri = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({ from: uri, to: localUri });
        setUserData((prev) => ({ ...prev, avatarUrl: localUri }));
        await AsyncStorage.setItem('avatarUri', localUri);

        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, { avatarUrl: localUri }, { merge: true });
        }
      }
    } catch (err) {
      console.error('Image picking failed:', err);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại!');
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
      // tuổi k quá lớn hơn 150
      if (!userData.age || parseInt(userData.age, 10) > 150) {
        Alert.alert('Lỗi', 'Tuổi không hợp lệ! Vui lòng kiểm tra lại.');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        fullName: userData.fullName,
        age: userData.age,
        gender: userData.gender,
        avatarUrl: userData.avatarUrl,
      });

      Alert.alert('✅ Đã lưu thông tin thành công!');
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('❌ Lỗi khi lưu thông tin!');
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setUserData({
            fullName: data.fullName || '',
            age: data.age || '',
            gender: data.gender || '',
            avatarUrl: data.avatarUrl || '',
          });
        }
      } catch (error) {
        console.error('Load user data failed:', error);
      }
    };
    loadUserData();
  }, []);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={
          userData.avatarUrl
            ? { uri: userData.avatarUrl }
            : require('../assets/avatar-placeholder.png')
        }
        style={styles.avatar}
      />
      <TouchableOpacity onPress={pickImage}>
        <Text style={[styles.pickText, { color: theme.text }]}>{t.changeAvatar}</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>{t.fullName}</Text>
        <TextInput
          placeholder={t.fullName}
          placeholderTextColor={theme.placeholder}
          value={userData.fullName}
          onChangeText={(text) => setUserData({ ...userData, fullName: text })}
          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>Email</Text>
        <TextInput
          value={auth.currentUser?.email || 'Không có email'}
          editable={false}
          style={[styles.readOnlyInput, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
          placeholderTextColor={theme.placeholder}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>{t.age}</Text>
        <TextInput
          placeholder={t.age}
          placeholderTextColor={theme.placeholder}
          keyboardType="numeric"
          value={userData.age}
          onChangeText={(text) => {
            const age = parseInt(text, 10);
            if (isNaN(age) || age > 150) {
              setUserData((prev) => ({ ...prev, age: '' }));
              Alert.alert('Lỗi', 'Tuổi không được quá lớn!');
            } else {
              setUserData((prev) => ({ ...prev, age: text }));
            }
          }}
          style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.border }]}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>{t.gender}</Text>
        <View style={styles.genderRow}>
          {['Nam', 'Nữ'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderButton, userData.gender === g && styles.genderSelected]}
              onPress={() => setUserData({ ...userData, gender: g })}
            >
              <Text style={[styles.genderText, userData.gender === g && styles.genderSelectedText]}>
                {t[g === 'Nam' ? 'male' : 'female']}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity onPress={handleSave} style={[styles.button, { backgroundColor: theme.button }]}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>{t.save}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={[styles.button, { backgroundColor: theme.button }]}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>{t.logout}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
  },
  readOnlyInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  genderButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f0f0f0',
  },
  genderSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  genderText: {
    fontSize: 14,
    color: '#333',
  },
  genderSelectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserScreen;
