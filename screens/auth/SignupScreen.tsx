import React, { useContext, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  View, Text, TextInput, Button, StyleSheet, Switch, TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemeContext } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<any>;



const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  const [errorState, setErrorState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  const { language, setLanguage, t } = useLanguage();

  const theme = isDarkMode ? darkTheme : lightTheme;

  const SignupSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
    password: Yup.string().min(6, t.required).required(t.required),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t.passwordMismatch)
      .required(t.required),
  });

  const handleSignup = async (values: { email: string; password: string; confirmPassword: string }) => {
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      navigation.navigate('Login');
    } catch (error: any) {
      setErrorState(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>{t.language}</Text>
        <Switch value={language === 'en'} onValueChange={() => setLanguage(language === 'en' ? 'vi' : 'en')} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: theme.text }]}>{t.darkMode}</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      <Text style={[styles.title, { color: theme.text }]}>{t.signup}</Text>

      <Formik
        initialValues={{ email: '', password: '', confirmPassword: '' }}
        validationSchema={SignupSchema}
        onSubmit={handleSignup}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
            <TextInput
              placeholder={t.email}
              placeholderTextColor={theme.placeholder}
              style={[styles.input, {
                backgroundColor: theme.inputBg,
                color: theme.inputText,
                borderColor: theme.border,
              }]}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
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
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color={theme.placeholder} />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <TextInput
                placeholder={t.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor={theme.placeholder}
                style={[styles.inputFlex, { color: theme.inputText }]}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                value={values.confirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color={theme.placeholder} />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

            {errorState !== '' && <Text style={styles.error}>{errorState}</Text>}

            <View style={styles.button}>
              <Button title={t.signup} onPress={() => handleSubmit()} color="#007bff" />
            </View>

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

const lightTheme = {
  background: '#f9f9f9',
  text: '#000',
  inputBg: '#fff',
  inputText: '#000',
  placeholder: '#888',
  border: '#ccc',
};

const darkTheme = {
  background: '#121212',
  text: '#fff',
  inputBg: '#1e1e1e',
  inputText: '#fff',
  placeholder: '#aaa',
  border: '#555',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleLabel: {
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
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
  error: {
    color: 'red',
    marginBottom: 10,
    marginLeft: 4,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
  },
  linkContainer: {
    alignItems: 'center',
  },
  link: {
    color: '#007bff',
    marginTop: 10,
    fontSize: 14,
  },
});

export default SignupScreen;
