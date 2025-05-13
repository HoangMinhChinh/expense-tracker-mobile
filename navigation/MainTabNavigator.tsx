// navigation/MainTabNavigator.tsx (cập nhật để dùng translations sau này)
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import TransactionScreen from '../screens/TransactionScreen';
import UserScreen from '../screens/UserScreen';
import { translations } from '../style/translations';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const language = 'vi'; // Hardcode tạm thời, sẽ thay bằng state nếu cần
  const t = translations[language];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Transaction') iconName = 'receipt';
          else if (route.name === 'User') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff4d4f',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#ccc',
          paddingVertical: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t.home }}
      />
      <Tab.Screen
        name="Transaction"
        component={TransactionScreen}
        options={{ tabBarLabel: t.transaction }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{ tabBarLabel: t.user }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;