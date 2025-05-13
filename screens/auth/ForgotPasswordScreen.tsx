import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Định nghĩa các route cần thiết
type RootStackParamList = {
  ForgotPassword: undefined;
  Login: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [errorState, setErrorState] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const ResetSchema = Yup.object().shape({
    email: Yup.string().email(t.invalidEmail).required(t.required),
  });

  const handleReset = async (values: { email: string }) => {
    setErrorState('');
    setFeedback('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setFeedback(t.success || 'Email khôi phục đã được gửi!');
      setTimeout(() => navigation.replace('Login'), 2000);
    } catch (error: any) {
      let msg = '';
      switch (error.code) {
        case 'auth/user-not-found': msg = 'Email chưa đăng ký!'; break;
        case 'auth/invalid-email': msg = t.invalidEmail; break;
        case 'auth/too-many-requests': msg = 'Quá nhiều yêu cầu, thử lại sau!'; break;
        default: msg = error.message;
      }
      setErrorState(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>      
      {/* Logo */}
      <Image source={require('../../assets/firebase_logo.png')} style={styles.logo} resizeMode="contain" />

      <Text style={[styles.title, { color: theme.text }]}>{t.reset}</Text>

      <Formik
        initialValues={{ email: '' }}
        validationSchema={ResetSchema}
        onSubmit={handleReset}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            {/* Input Email */}
            <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>  
              <Ionicons name="mail-outline" size={20} color={theme.placeholder} />
              <TextInput
                placeholder={t.email}
                placeholderTextColor={theme.placeholder}
                style={[styles.input, { color: theme.inputText }]}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}
            {errorState && <Text style={styles.error}>{errorState}</Text>}
            {feedback && <Text style={styles.feedback}>{feedback}</Text>}

            {/* Button Reset */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled, { backgroundColor: theme.primary }]}
              onPress={() => handleSubmit()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.onPrimary} />
              ) : (
                <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t.reset}</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <View style={styles.linkContainer}>
              <Text style={[styles.link, { color: theme.primary }]} onPress={() => navigation.replace('Login')}>
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
  logo: { width: 180, height: 80, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 8 },
  input: { flex: 1, paddingVertical: 8, marginLeft: 8 },
  error: { color: 'red', marginBottom: 10 },
  feedback: { color: 'green', marginBottom: 10 },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { backgroundColor: '#a9a9a9' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  linkContainer: { alignItems: 'center', marginTop: 24 },
  link: { fontSize: 16, fontWeight: '600' },
});

export default ForgotPasswordScreen;
