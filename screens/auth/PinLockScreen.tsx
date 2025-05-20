import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const PinLockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    const loadPin = async () => {
      const stored = await AsyncStorage.getItem('app_pin');
      if (stored) setSavedPin(stored);
      else onUnlock(); // không có pin thì bỏ qua màn hình này
    };
    loadPin();
  }, []);

  const handleUnlock = () => {
    if (pin === savedPin) {
      onUnlock();
    } else {
      Alert.alert('Sai mã PIN');
      setPin('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>Nhập mã PIN để tiếp tục</Text>
      <TextInput
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        maxLength={6}
        secureTextEntry
        style={[styles.input, { backgroundColor: theme.inputBg, color: theme.inputText }]}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={handleUnlock}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Mở khóa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  label: { fontSize: 18, marginBottom: 20 },
  input: {
    width: '80%', padding: 12, borderRadius: 10, fontSize: 20, textAlign: 'center', marginBottom: 20,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PinLockScreen;
