import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../style/theme';

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [feedback, setFeedback] = useState('');
  const [errorState, setErrorState] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const ForgotSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
  });

  const getFriendlyErrorMessage = (error: any) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return t.userNotFound;
      case 'auth/invalid-email':
        return t.invalidEmail;
      default:
        return t.genericError;
    }
  };

  const handleReset = async (values: { email: string }) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setFeedback(t.success);
      setErrorState('');
    } catch (error: any) {
      setErrorState(getFriendlyErrorMessage(error));
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

        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Ionicons
            name={isDarkMode ? 'moon' : 'sunny'}
            size={20}
            color={theme.text}
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
        initialValues={{ email: '' }}
        validationSchema={ForgotSchema}
        onSubmit={handleReset}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            {/* Error and Feedback */}
            {errorState && <Text style={styles.error}>{errorState}</Text>}
            {feedback && <Text style={styles.success}>{feedback}</Text>}

            {/* Email Input */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
              <Ionicons name="mail-outline" size={20} style={styles.icon} color={theme.placeholder} />
              <TextInput
                testID="email-input"
                placeholder={t.email}
                placeholderTextColor={theme.placeholder}
                style={[styles.inputFlex, { color: theme.inputText }]}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
            </View>
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            {/* Reset Button */}
            <TouchableOpacity
              testID="reset-button"
              style={[styles.loginButton, { backgroundColor: theme.button }]}
              onPress={() => handleSubmit()}
              disabled={isLoading}
            >
              <Text style={[styles.loginButtonText, { color: theme.buttonText }]}>
                {isLoading ? t.loading : t.reset}
              </Text>
            </TouchableOpacity>

            {/* Link to Login */}
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

export default ForgotPasswordScreen;