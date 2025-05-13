import React, { useState } from 'react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { ref, set } from 'firebase/database';
import { db } from '../../config/firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { translations } from '../../style/translations'; // Import trực tiếp
import { lightTheme, darkTheme } from '../../style/theme'; // Import trực tiếp

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};
type Props = NativeStackScreenProps<RootStackParamList>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errorState, setErrorState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;
  const t = translations[language];

  const SignupSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
    password: Yup.string().min(6, t.passwordTooShort).required(t.required),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t.passwordMismatch)
      .required(t.required),
  });

  const getFriendlyErrorMessage = (error: any) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return t.emailAlreadyInUse;
      case 'auth/invalid-email':
        return t.invalidEmail;
      case 'auth/weak-password':
        return t.weakPassword;
      default:
        return t.genericError;
    }
  };

  const handleSignup = async (values: { email: string; password: string; confirmPassword: string }) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userRef = ref(db, 'users/' + user.uid);
      await set(userRef, {
        email: values.email,
        createdAt: new Date().toISOString(),
      });

      // Không gọi navigation.navigate, để AuthContext tự chuyển stack
    } catch (error: any) {
      setErrorState(getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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

        <TouchableOpacity style={styles.themeButton} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Ionicons
            name={isDarkMode ? 'moon' : 'sunny'}
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/Logomark_Full_Color.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Formik
        initialValues={{ email: '', password: '', confirmPassword: '' }}
        validationSchema={SignupSchema}
        onSubmit={handleSignup}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            {errorState && <Text style={[styles.error, { color: theme.error }]}>{errorState}</Text>}

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
            {touched.email && errors.email && <Text style={[styles.error, { color: theme.error }]}>{errors.email}</Text>}

            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} style={styles.icon} color={theme.placeholder} />
              <TextInput
                testID="password-input"
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
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && <Text style={[styles.error, { color: theme.error }]}>{errors.password}</Text>}

            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
              <Ionicons name="lock-closed-outline" size={20} style={styles.icon} color={theme.placeholder} />
              <TextInput
                testID="confirm-password-input"
                placeholder={t.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={theme.placeholder}
                style={[styles.inputFlex, { color: theme.inputText }]}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={[styles.error, { color: theme.error }]}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              testID="signup-button"
              style={[styles.loginButton, { backgroundColor: theme.button }]}
              onPress={() => handleSubmit()}
              disabled={isLoading}
            >
              <Text style={[styles.loginButtonText, { color: theme.buttonText }]}>
                {isLoading ? t.loading : t.signup}
              </Text>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 12,
  },
  error: {
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

export default SignupScreen;