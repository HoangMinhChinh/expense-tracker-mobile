import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ExpenseScreen from '../screens/ExpenseScreen';
import StatsScreen from '../screens/StatsScreen';
import UserScreen from '../screens/UserScreen';
import AddServiceScreen from '../screens/AddServiceModal';

const Tab = createBottomTabNavigator();

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
              //Tài khoản - chi tiêu
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              //báo cáo -startstart
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              //setting - cài đặt
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Expenses" component={ExpenseScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={UserScreen} />
      <Tab.Screen 
        name="AddService" 
        component={AddServiceScreen}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;

// chỉnh lại thanh text chồng lên trên icon
// đồng bộ darkmode 