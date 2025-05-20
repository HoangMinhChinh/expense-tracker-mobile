import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator'; // đường dẫn đúng
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert(t.genericError);
    }
  };

  const handleAppInfo = () => {
    Alert.alert('Thông tin ứng dụng', 'Phiên bản 1.0.0\nDeveloper: Khoa');
  };

  const handleSetPin = async () => {
    await AsyncStorage.setItem('app_pin', '123456'); // Tạm đặt cứng, có thể thay bằng modal sau
    Alert.alert('✅', 'PIN đã được thiết lập (123456)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Thông tin cá nhân */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('User')}>
        <Text style={[styles.text, { color: theme.text }]}>👤 {t.fullName}</Text>
      </TouchableOpacity>

      {/* Dark mode */}
      <View style={styles.item}>
        <Text style={[styles.text, { color: theme.text }]}>🌙 {t.darkMode}</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      {/* Đổi mật khẩu */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('User')}>
        <Text style={[styles.text, { color: theme.text }]}>🔒 {t.password || 'Đổi mật khẩu'}</Text>
      </TouchableOpacity>

      {/* Đổi ngôn ngữ */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
      >
        <Text style={[styles.text, { color: theme.text }]}>🌐 {t.language}</Text>
        <Text style={[styles.text, { color: theme.text }]}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      {/* Lớp khóa sau đăng nhập */}
      <TouchableOpacity style={styles.item} onPress={handleSetPin}>
        <Text style={[styles.text, { color: theme.text }]}>🔐 Lớp khóa sau đăng nhập</Text>
      </TouchableOpacity>

      {/* Thông tin ứng dụng */}
      <TouchableOpacity style={styles.item} onPress={handleAppInfo}>
        <Text style={[styles.text, { color: theme.text }]}>ℹ️ Thông tin ứng dụng</Text>
      </TouchableOpacity>

      {/* Đăng xuất */}
      <TouchableOpacity style={styles.item} onPress={handleLogout}>
        <Text style={[styles.text, { color: 'red' }]}>🚪 {t.logout}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});

export default SettingsScreen;
