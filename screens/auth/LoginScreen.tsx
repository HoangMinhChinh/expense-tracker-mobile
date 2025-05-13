// File chỉnh sửa lại theo yêu cầu
import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { ref, get } from 'firebase/database';
import { db } from '../../config/firebaseConfig';

type Props = NativeStackScreenProps<any>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [errorState, setErrorState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
    password: Yup.string().required(t.required),
  });

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Kiểm tra thông tin người dùng trong Realtime Database
      const userRef = ref(db, 'users/' + user.uid);
      const snapshot = await get(userRef);

      if (!snapshot.exists() || !snapshot.val().fullName) {
        // Nếu chưa có thông tin -> UserScreen
        navigation.navigate('User');
      } else {
        // Nếu đã có thông tin -> HomeScreen
        navigation.navigate('Home');
      }
    } catch (error: any) {
      setErrorState(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
        >
          <Text>{language === 'vi' ? '🇻🇳' : '🇺🇸'}</Text>
          <Text style={[styles.languageText, { color: theme.text }]}>
            {language.toUpperCase()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.themeButton}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={isDarkMode ? 'moon' : 'sunny'} 
            size={20} 
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/firebase_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            {/* Email */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
              <Ionicons name="mail-outline" size={20} style={styles.icon} color={theme.placeholder} />
              <TextInput
                placeholder={t.email}
                placeholderTextColor={theme.placeholder}
                style={[styles.inputFlex, { color: theme.inputText }]}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
            </View>
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            {/* Password */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} style={styles.icon} color={theme.placeholder} />
              <TextInput
                placeholder={t.password}
                secureTextEntry={!showPassword}
                placeholderTextColor={theme.placeholder}
                style={[styles.inputFlex, { color: theme.inputText }]}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

            {errorState !== '' && <Text style={styles.error}>{errorState}</Text>}

            <TouchableOpacity onPress={() => handleSubmit()} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>{t.login}</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
                {t.signup}
              </Text>
              <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
                {t.forgot}
              </Text>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
};

const lightTheme = {
  background: '#f9f9f9',
  text: '#000',
  inputBg: '#fff',
  inputText: '#000',
  placeholder: '#888',
  border: '#ccc',
};

const darkTheme = {
  background: '#2d2d2d', // Màu xám tối thay vì đen
  text: '#fff',
  inputBg: '#3d3d3d',
  inputText: '#fff',
  placeholder: '#aaa',
  border: '#555',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
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
  logo: {
    width: 180,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 8,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  link: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default LoginScreen;