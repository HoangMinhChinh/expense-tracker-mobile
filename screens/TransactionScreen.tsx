// src/screens/TransactionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TransactionScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đây là màn hình Transaction</Text>
      <Text>Danh sách giao dịch sẽ hiển thị ở đây.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default TransactionScreen;