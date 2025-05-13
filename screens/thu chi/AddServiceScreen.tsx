import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../HomeScreen';
import ExpenseScreen from '../ExpenseScreen';
import StatsScreen from '../StatsScreen';
import UserScreen from '../UserScreen';
import AddServiceScreen from '../thu chi/AddServiceScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Create a stack navigator for Home tab to include AddService
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddService" 
        component={AddServiceScreen}
        options={{ 
          headerShown: true,
          headerTitle: 'Thêm Thu Chi',
          headerBackTitle: 'Quay lại'
        }}
      />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
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
            case 'Expenses':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingVertical: 5,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          backgroundColor: '#fff',
          position: 'absolute',
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Expenses" component={ExpenseScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={UserScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;