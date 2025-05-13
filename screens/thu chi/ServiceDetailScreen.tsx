import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { ref, get } from 'firebase/database';
import { db } from '../../config/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { RouteProp, useRoute } from '@react-navigation/native';

interface Service {
  name: string;
  amount: number;
  type: 'income' | 'expense';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

type ServiceDetailRouteProp = RouteProp<{ ServiceDetail: { serviceId: string } }, 'ServiceDetail'>;

const ServiceDetailScreen = () => {
  const route = useRoute<ServiceDetailRouteProp>();
  const { serviceId } = route.params;
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const serviceRef = ref(db, `transactions/${serviceId}`);
        const snapshot = await get(serviceRef);
        
        if (snapshot.exists()) {
          setService(snapshot.val());
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy giao dịch.');
        }
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu:', err);
        Alert.alert('Lỗi', 'Không thể tải giao dịch.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (!service) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.label, { color: theme.text }]}>
        <Text style={styles.bold}>Tên giao dịch:</Text> {service.name}
      </Text>
      <Text style={[styles.label, { color: theme.text }]}>
        <Text style={styles.bold}>Số tiền:</Text> {service.amount.toLocaleString()} đ
      </Text>
      <Text style={[styles.label, { color: theme.text }]}>
        <Text style={styles.bold}>Loại:</Text> {service.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
      </Text>
      <Text style={[styles.label, { color: theme.text }]}>
        <Text style={styles.bold}>Ngày tạo:</Text> {formatDate(service.createdAt)}
      </Text>
      <Text style={[styles.label, { color: theme.text }]}>
        <Text style={styles.bold}>Cập nhật:</Text> {formatDate(service.updatedAt)}
      </Text>
    </View>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  label: {
    fontSize: 16,
  },
  bold: {
    fontWeight: '700',
  },
});

export default ServiceDetailScreen;
