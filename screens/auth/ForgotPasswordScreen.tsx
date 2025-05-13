import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [feedback, setFeedback] = useState('');
  const [errorState, setErrorState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const ForgotSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
  });

  const handleReset = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setFeedback('Email khôi phục mật khẩu đã được gửi!');
      setErrorState('');
      
      // Tự động quay về màn hình đăng nhập sau 2 giây
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error: any) {
      // Xử lý các lỗi cụ thể
      let errorMessage = '';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Email này chưa được đăng ký!';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ!';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau!';
          break;
        default:
          errorMessage = error.message;
      }
      setErrorState(errorMessage);
      setFeedback('');
    } finally {
      setIsLoading(false);
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

      <Text style={[styles.title, { color: theme.text }]}>{t.reset}</Text>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={ForgotSchema}
        onSubmit={handleReset}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
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
            {errorState !== '' && <Text style={styles.error}>{errorState}</Text>}
            {feedback !== '' && <Text style={styles.success}>{feedback}</Text>}

            <TouchableOpacity 
              onPress={() => handleSubmit()} 
              style={[
                styles.resetButton,
                isLoading && styles.resetButtonDisabled
              ]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>{t.reset}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                {t.login}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
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
  success: {
    color: 'green',
    marginBottom: 10,
    marginLeft: 4,
  },
  resetButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonDisabled: {
    backgroundColor: '#a9a9a9',
  },
  resetButtonText: {
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
  },
});

export default ForgotPasswordScreen;
