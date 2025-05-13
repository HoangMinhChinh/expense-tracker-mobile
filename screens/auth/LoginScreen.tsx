import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Định nghĩa các route trong stack chính
type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [errorState, setErrorState] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
    password: Yup.string().required(t.required),
  });

  const handleLogin = async (values: { email: string; password: string }) => {
    setErrorState('');
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // Chuyển đến HomeScreen và loại bỏ Login khỏi stack
      navigation.replace('Home');
    } catch (error: any) {
      setErrorState(error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>      
      <View style={styles.headerControls}>
        <TouchableOpacity onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')} style={styles.languageButton}>
          <Text>{language === 'vi' ? 'VI' : 'EN'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { /* optional theme toggle */ }} style={styles.themeButton}>
          <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <Image source={require('../../assets/firebase_logo.png')} style={styles.logo} resizeMode="contain" />

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>  
              <Ionicons name="mail-outline" size={20} color={theme.placeholder} />
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

            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>  
              <Ionicons name="lock-closed-outline" size={20} color={theme.placeholder} />
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
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.placeholder} />
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
          </>
        )}
      </Formik>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  headerControls: { position: 'absolute', top: 20, right: 20, flexDirection: 'row', alignItems: 'center' },
  languageButton: { marginRight: 12, padding: 6, borderRadius: 6 },
  themeButton: { padding: 6, borderRadius: 6 },
  logo: { width: 180, height: 80, alignSelf: 'center', marginBottom: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, marginBottom: 10, paddingHorizontal: 10 },
  inputFlex: { flex: 1, paddingVertical: 12 },
  error: { color: 'red', marginBottom: 10 },
  loginButton: { backgroundColor: '#d9534f', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  linkContainer: { alignItems: 'center', marginTop: 24 },
  link: { color: '#007bff', fontSize: 16, fontWeight: '600', marginTop: 8 },
});

export default LoginScreen;