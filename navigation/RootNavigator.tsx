// src/navigation/RootNavigator.tsx
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import MainTabNavigator from './MainTabNavigator';
import { AuthContext } from '../context/AuthContext';
import UserScreen from '../screens/UserScreen';
import AddServiceScreen from '../screens/AddServiceScreen';
import { useLanguage } from '../context/LanguageContext'; // Giả định có LanguageContext

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  MainTab: undefined;
  AddService: { onAddSuccess: () => void };
  Home: undefined;
  User: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const AppStack = () => {
  const { language } = useLanguage(); // Lấy ngôn ngữ từ context
  const translations = {
    vi: { addService: 'Thêm dịch vụ' },
    en: { addService: 'Add Service' },
  };
  const t = translations[language || 'vi'];

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTab" component={MainTabNavigator} />
      <Stack.Screen name="User" component={UserScreen} />
      <Stack.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: t.addService,
          contentStyle: { backgroundColor: 'transparent' }, // Thay cardStyle bằng contentStyle
          gestureEnabled: true,
          gestureDirection: 'vertical',
          cardOverlayEnabled: true, // Kích hoạt overlay
          cardOverlay: ({ style }) => (
            <View
              style={[
                style,
                { backgroundColor: 'rgba(0, 0, 0, 0.5)' }, // Lớp phủ mờ phía sau modal
              ]}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const RootNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;