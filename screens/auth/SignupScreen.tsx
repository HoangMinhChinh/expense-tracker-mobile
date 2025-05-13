import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebaseConfig';
import { ref, set } from 'firebase/database';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

// Update navigation types
type RootStackParamList = {
  MainTab: { screen: string };
  Signup: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [errorState, setErrorState] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const SignupSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
    password: Yup.string().min(6, t.passwordMin).required(t.required),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t.passwordMismatch)
      .required(t.required),
  });

  const handleSignup = async (values: { email: string; password: string; confirmPassword: string }) => {
    setErrorState('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, values.email, values.password);
      // Create user node in Realtime DB
      const userRef = ref(db, `users/${cred.user.uid}`);
      await set(userRef, {
        email: values.email,
        createdAt: new Date().toISOString(),
      });
      // Navigate to Home screen
      navigation.navigate('MainTab', { screen: 'Home' });
    } catch (error: any) {
      let errorMessage = 'Đã xảy ra lỗi khi đăng ký';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email này đã được sử dụng';
      }
      setErrorState(errorMessage);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>      
      <View style={styles.headerControls}>
        <TouchableOpacity 
          onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')} 
          style={styles.btnControl}
        >
          <Text style={{ color: theme.text }}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnControl}>
          <Ionicons 
            name={isDarkMode ? 'moon' : 'sunny'} 
            size={20} 
            color={theme.text} 
          />
        </TouchableOpacity>
      </View>

      <Image source={require('../../assets/firebase_logo.png')} style={styles.logo} resizeMode="contain" />

      <Formik
        initialValues={{ email: '', password: '', confirmPassword: '' }}
        validationSchema={SignupSchema}
        onSubmit={handleSignup}
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

            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>  
              <Ionicons name="lock-closed-outline" size={20} color={theme.placeholder} />
              <TextInput
                placeholder={t.confirmPassword}
                secureTextEntry={!showConfirm}
                placeholderTextColor={theme.placeholder}
                style={[styles.inputFlex, { color: theme.inputText }]}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color={theme.placeholder} />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

            {errorState !== '' && <Text style={styles.error}>{errorState}</Text>}

            <TouchableOpacity onPress={() => handleSubmit()} style={[styles.button, { backgroundColor: theme.primary }]}>  
              <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t.signup}</Text>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                {t.login}
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
  headerControls: { position: 'absolute', top: 20, right: 20, flexDirection: 'row' },
  btnControl: { padding: 6, borderRadius: 6, marginLeft: 12 },
  logo: { width: 180, height: 80, alignSelf: 'center', marginBottom: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, marginBottom: 10, paddingHorizontal: 10 },
  inputFlex: { flex: 1, paddingVertical: 12 },
  error: { color: 'red', marginBottom: 10 },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  linkContainer: { alignItems: 'center', marginTop: 24 },
  link: { color: '#007bff', fontSize: 16, fontWeight: '600' },
});

export default SignupScreen;
