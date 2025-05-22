import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import ChangePassModal from '../screens/auth/ChangePassModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [showChangePass, setShowChangePass] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Alert.alert(t('genericError'));
    }
  };

  const handleAppInfo = () => {
    Alert.alert('Thông tin ứng dụng', 'Phiên bản 1.0.0\nDeveloper: Dương');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tiêu đề */}
      <Text style={[styles.header, { color: theme.text }]}>{t('settings')}</Text>

      {/* Tài khoản */}
      <TouchableOpacity
        style={[styles.item, { backgroundColor: theme.inputBg || '#fff' }]}
        onPress={() => navigation.navigate('User')}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Ionicons name="person-outline" size={24} color={theme.text} style={styles.icon} />
          <Text style={[styles.text, { color: theme.text }]}>{t('fullName')}</Text>
        </View>
      </TouchableOpacity>

      {/* Chế độ tối */}
      <View style={[styles.item, { backgroundColor: theme.inputBg || '#fff' }]}>
        <View style={styles.itemContent}>
          <Ionicons name="moon-outline" size={24} color={theme.text} style={styles.icon} />
          <Text style={[styles.text, { color: theme.text }]}>{t('darkMode')}</Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>

      {/* Đổi mật khẩu */}
      <TouchableOpacity
        style={[styles.item, { backgroundColor: theme.inputBg || '#fff' }]}
        onPress={() => setShowChangePass(true)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Ionicons name="lock-closed-outline" size={24} color={theme.text} style={styles.icon} />
          <Text style={[styles.text, { color: theme.text }]}>{t('changepassword')}</Text>
        </View>
      </TouchableOpacity>

      {/* Ngôn ngữ */}
      <TouchableOpacity
        style={[styles.item, { backgroundColor: theme.inputBg || '#fff' }]}
        onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Ionicons name="language-outline" size={24} color={theme.text} style={styles.icon} />
          <Text style={[styles.text, { color: theme.text }]}>{t('language')}</Text>
        </View>
        <Text style={[styles.subText, { color: theme.text }]}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      {/* Thông tin ứng dụng */}
      <TouchableOpacity
        style={[styles.item, { backgroundColor: theme.inputBg || '#fff' }]}
        onPress={handleAppInfo}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Ionicons name="information-circle-outline" size={24} color={theme.text} style={styles.icon} />
          <Text style={[styles.text, { color: theme.text }]}>Thông tin ứng dụng</Text>
        </View>
      </TouchableOpacity>

      {/* Đăng xuất */}
      <TouchableOpacity
        style={[styles.item, styles.logoutItem, { backgroundColor: theme.inputBg || '#fff' }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Ionicons name="log-out-outline" size={24} color="red" style={styles.icon} />
          <Text style={[styles.text, { color: 'red' }]}>{t('logout')}</Text>
        </View>
      </TouchableOpacity>

      {/* Modal đổi mật khẩu */}
      <ChangePassModal visible={showChangePass} onClose={() => setShowChangePass(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logoutItem: {
    borderWidth: 1,
    borderColor: 'red',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
  },
  subText: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
});

export default SettingsScreen;
