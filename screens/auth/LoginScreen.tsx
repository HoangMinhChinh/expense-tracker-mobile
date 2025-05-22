import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { ref, get } from 'firebase/database'; // ✅ import đúng cho Realtime Database
import { lightTheme, darkTheme } from '../../style/theme';

type Props = NativeStackScreenProps<any>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [errorState, setErrorState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(t('invalidEmail')).required(t('required')),
    password: Yup.string().required(t('required')),
  });

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.exists() ? snapshot.val() : null;

      if (!userData || !userData.fullName) {
        navigation.navigate('User');
      } else {
        navigation.navigate('MainTab');
      }
    } catch (error: any) {
      setErrorState(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
        >
          <Text>{language === 'vi' ? '🇻🇳' : '🇺🇸'}</Text>
          <Text style={[styles.languageText, { color: currentTheme.text }]}>
            {language.toUpperCase()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Ionicons
            name={isDarkMode ? 'moon' : 'sunny'}
            size={20}
            color={currentTheme.text}
          />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <Image
        source={require('../../assets/Logomark_Full Color.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Formik Form */}
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            {/* Email Input */}
            <View style={[styles.inputWrapper, { borderColor: currentTheme.border, backgroundColor: currentTheme.inputBg }]}>
              <Ionicons name="mail-outline" size={20} style={styles.icon} color={currentTheme.placeholder} />
              <TextInput
                placeholder={t('email')}
                placeholderTextColor={currentTheme.placeholder}
                style={[styles.inputFlex, { color: currentTheme.inputText }]}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
            </View>
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            {/* Password Input */}
            <View style={[styles.inputWrapper, { borderColor: currentTheme.border, backgroundColor: currentTheme.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} style={styles.icon} color={currentTheme.placeholder} />
              <TextInput
                placeholder={t('password')}
                secureTextEntry={!showPassword}
                placeholderTextColor={currentTheme.placeholder}
                style={[styles.inputFlex, { color: currentTheme.inputText }]}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={currentTheme.placeholder}
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: currentTheme.button }]}
              onPress={() => handleSubmit()}
            >
              <Text style={[styles.loginButtonText, { color: currentTheme.buttonText }]}>
                {t('login')}
              </Text>
            </TouchableOpacity>

            {/* Links */}
            <View style={styles.linkContainer}>
              <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
                {t('signup')}
              </Text>
              <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
                {t('forgot')}
              </Text>
            </View>
          </View>
        )}
      </Formik>
    </View>
  );
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
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
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
