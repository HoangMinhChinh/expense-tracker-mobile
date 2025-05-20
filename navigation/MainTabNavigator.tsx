import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingScreen';
import AddServiceModal from '../screens/AddServiceModal';

import { useTheme } from '../context/ThemeContext';

export type MainTabParamList = {
  Home: undefined;
  'Lịch': undefined;
  'Báo cáo': undefined;
  'Cài đặt': undefined;
  AddService: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Lịch':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Báo cáo':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Cài đặt':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          backgroundColor: theme.inputBg,
          position: 'absolute',
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lịch" component={ExpenseScreen} />
      <Tab.Screen name="Báo cáo" component={StatsScreen} />
      <Tab.Screen name="Cài đặt" component={SettingsScreen} />
      <Tab.Screen
        name="AddService"
        component={AddServiceModal}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
