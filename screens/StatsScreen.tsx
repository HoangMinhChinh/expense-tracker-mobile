import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ref, onValue, off, query, orderByChild, startAt, endAt } from 'firebase/database';
import { db, auth } from '../config/firebaseConfig';
import { PieChart } from 'react-native-chart-kit';
import { isValid, parseISO, format, startOfWeek, addDays, subWeeks, subMonths, subYears } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  userId: string;
  category?: string;
}

interface ChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

type ReportType = 'week' | 'month' | 'year';

const StatsScreen = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [reportType, setReportType] = useState<ReportType>('week');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(''); // Chuỗi định dạng cho tuần/tháng/năm
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPickerModal, setShowPickerModal] = useState(false); // State để mở Modal Picker

  const screenWidth = Dimensions.get('window').width;

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ];

  // Chọn locale dựa trên ngôn ngữ
  const locale = language === 'vi' ? vi : enUS;

  // Hàm tạo màu ngẫu nhiên
  const generateColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Kiểm tra định dạng ngày hợp lệ
  const isValidDate = (dateStr: string) => {
    try {
      return isValid(parseISO(dateStr));
    } catch {
      return false;
    }
  };

  // Các hàm xử lý ngày tháng
  const getWeekRange = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Thứ Hai là ngày đầu tuần
    return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
  };

  const getMonthRange = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(format(new Date(d), 'yyyy-MM-dd'));
    }
    return days;
  };

  const getYearRange = (date: Date) => {
    const year = date.getFullYear();
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(`${year}-${String(i + 1).padStart(2, '0')}`);
    }
    return months;
  };

  // Tạo danh sách tuần/tháng/năm cho Picker (chỉ hiện tại và quá khứ)
  const generatePeriodOptions = useMemo(() => {
    const options: { label: string; value: string; date: Date }[] = [];
    const today = new Date();

    if (reportType === 'week') {
      // Tạo 52 tuần từ hiện tại trở về quá khứ
      for (let i = 0; i <= 52; i++) {
        const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        const label = `${format(weekStart, 'dd/MM/yyyy', { locale })} - ${format(weekEnd, 'dd/MM/yyyy', { locale })}`;
        options.push({
          label,
          value: format(weekStart, 'yyyy-MM-dd'),
          date: weekStart,
        });
      }
    } else if (reportType === 'month') {
      // Tạo 24 tháng từ hiện tại trở về quá khứ
      for (let i = 0; i <= 24; i++) {
        const monthDate = subMonths(today, i);
        const label = format(monthDate, 'MM/yyyy', { locale });
        options.push({
          label,
          value: format(monthDate, 'yyyy-MM'),
          date: monthDate,
        });
      }
    } else if (reportType === 'year') {
      // Tạo 5 năm từ hiện tại trở về quá khứ
      for (let i = 0; i <= 5; i++) {
        const yearDate = subYears(today, i);
        const label = format(yearDate, 'yyyy', { locale });
        options.push({
          label,
          value: format(yearDate, 'yyyy'),
          date: yearDate,
        });
      }
    }

    return options;
  }, [reportType, locale]);

  // Cập nhật currentDate khi selectedPeriod thay đổi
  useEffect(() => {
    if (generatePeriodOptions.length > 0 && !selectedPeriod) {
      // Chọn mặc định là khoảng thời gian hiện tại
      const currentOption = generatePeriodOptions[0]; // Luôn là hiện tại
      setSelectedPeriod(currentOption.value);
      setCurrentDate(currentOption.date);
    }
  }, [generatePeriodOptions, selectedPeriod]);

  // Lấy dữ liệu từ Firebase
  useEffect(() => {
    if (!auth.currentUser) {
      setError(t('not_authenticated'));
      setLoading(false);
      return;
    }

    setLoading(true);
    const startDate = format(new Date(currentDate.getFullYear() - 1, 0, 1), 'yyyy-MM-dd');
    const endDate = format(new Date(currentDate.getFullYear() + 1, 11, 31), 'yyyy-MM-dd');
    const transactionsRef = query(
      ref(db, 'transactions'),
      orderByChild('date'),
      startAt(startDate),
      endAt(endDate)
    );

    const unsubscribe = onValue(
      transactionsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setTransactions([]);
          setLoading(false);
          setError(t('no_data_available'));
          return;
        }
        const data: Transaction[] = [];
        snapshot.forEach((child) => {
          const tx = child.val();
          if (tx.userId === auth.currentUser?.uid && isValidDate(tx.date)) {
            data.push({ id: child.key, ...tx });
          }
        });
        setTransactions(data);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Firebase error:', error);
        setError(t('firebase_error'));
        setLoading(false);
      }
    );

    return () => off(transactionsRef);
  }, [currentDate, t]);

  // Hàm xử lý dữ liệu báo cáo
  const filteredData = useMemo(() => {
    let filteredTransactions: Transaction[] = [];
    let groupedData: { [key: string]: number } = {};

    switch (reportType) {
      case 'week':
        const weekDates = getWeekRange(currentDate);
        filteredTransactions = transactions.filter((tx) =>
          isValidDate(tx.date) && weekDates.includes(tx.date.split('T')[0])
        );
        filteredTransactions.forEach((tx) => {
          const label = tx.type === 'income' ? t('income') : t('expense');
          const day = new Date(tx.date).getDay();
          const weekDays = [t('sun'), t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat')];
          const key = `${label} ${weekDays[day]}`;
          groupedData[key] = (groupedData[key] || 0) + tx.amount;
        });
        break;

      case 'month':
        const monthDates = getMonthRange(currentDate);
        filteredTransactions = transactions.filter((tx) =>
          isValidDate(tx.date) && monthDates.includes(tx.date.split('T')[0])
        );
        filteredTransactions.forEach((tx) => {
          const key = tx.type === 'income' ? t('income') : tx.category || t('other_expense');
          groupedData[key] = (groupedData[key] || 0) + tx.amount;
        });
        break;

      case 'year':
        const yearMonths = getYearRange(currentDate);
        filteredTransactions = transactions.filter((tx) =>
          isValidDate(tx.date) && yearMonths.includes(tx.date.slice(0, 7))
        );
        const monthNames = [
          t('month_1'), t('month_2'), t('month_3'), t('month_4'), t('month_5'), t('month_6'),
          t('month_7'), t('month_8'), t('month_9'), t('month_10'), t('month_11'), t('month_12'),
        ];
        filteredTransactions.forEach((tx) => {
          const monthIndex = new Date(tx.date).getMonth();
          const label = tx.type === 'income' ? t('income') : t('expense');
          const key = `${label} ${monthNames[monthIndex]}`;
          groupedData[key] = (groupedData[key] || 0) + tx.amount;
        });
        break;
    }

    return { filteredTransactions, groupedData };
  }, [transactions, reportType, currentDate, t]);

  // Cập nhật dữ liệu biểu đồ và tổng hợp
  useEffect(() => {
    const { filteredTransactions, groupedData } = filteredData;
    const income = filteredTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    setTotalIncome(income);
    setTotalExpense(expense);

    const chartDataArray: ChartData[] = Object.entries(groupedData).map(([name, amount], index) => ({
      name,
      population: amount,
      color: index < colors.length ? colors[index] : generateColor(),
      legendFontColor: theme.text,
      legendFontSize: 14, // Tăng kích thước chữ cho chú thích
    }));

    setChartData(chartDataArray);
  }, [filteredData, theme.text]);

  // Hiển thị khoảng thời gian
  const getDateRangeText = useCallback(() => {
    const selectedOption = generatePeriodOptions.find((opt) => opt.value === selectedPeriod);
    return selectedOption ? selectedOption.label : t('select_period');
  }, [generatePeriodOptions, selectedPeriod, t]);

  const chartConfig = {
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    color: (opacity = 1) => theme.text,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('financial_report')}</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      )}

      <View style={styles.reportTypeContainer}>
        {(['week', 'month', 'year'] as ReportType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.reportTypeButton,
              reportType === type && { backgroundColor: theme.button },
              { borderColor: theme.border },
            ]}
            onPress={() => {
              setReportType(type);
              setSelectedPeriod(''); // Reset để chọn lại khoảng thời gian
            }}
          >
            <Text
              style={[
                styles.reportTypeText,
                { color: reportType === type ? theme.buttonText : theme.text },
              ]}
            >
              {t(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.pickerContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.pickerLabelContainer}
          onPress={() => setShowPickerModal(true)}
        >
          <Text style={[styles.pickerLabel, { color: theme.text }]}>
            {getDateRangeText()}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPickerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('select_period')}</Text>
            <Picker
              selectedValue={selectedPeriod}
              onValueChange={(value) => {
                const option = generatePeriodOptions.find((opt) => opt.value === value);
                if (option) {
                  setSelectedPeriod(value);
                  setCurrentDate(option.date);
                  setShowPickerModal(false); // Đóng modal sau khi chọn
                }
              }}
              style={[styles.modalPicker, { color: theme.text }]}
              dropdownIconColor={theme.text}
              itemStyle={[styles.pickerItem, { color: theme.text }]}
            >
              {generatePeriodOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  color={theme.text}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.button }]}
              onPress={() => setShowPickerModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.buttonText }]}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.summaryLabel, { color: theme.text }]}>{t('income')}</Text>
          <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>
            +{totalIncome.toLocaleString('vi-VN')}₫
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.summaryLabel, { color: theme.text }]}>{t('expense')}</Text>
          <Text style={[styles.summaryAmount, { color: '#FF5722' }]}>
            -{totalExpense.toLocaleString('vi-VN')}₫
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.summaryLabel, { color: theme.text }]}>{t('total')}</Text>
          <Text
            style={[
              styles.summaryAmount,
              { color: totalIncome - totalExpense >= 0 ? '#4CAF50' : '#FF5722' },
            ]}
          >
            {(totalIncome - totalExpense).toLocaleString('vi-VN')}₫
          </Text>
        </View>
      </View>

      <View style={[styles.chartContainer, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          {t('analysis')} {t(reportType)}
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.text} />
        ) : chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            // absolute
          />
        ) : (
          <Text style={[styles.noDataText, { color: theme.placeholder }]}>
            {t('no_data_available_try_another_period')}
          </Text>
        )}
      </View>

      {chartData.length > 0 && (
        <View style={[styles.legendContainer, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.legendTitle, { color: theme.text }]}>{t('details')}</Text>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendItemContent}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text
                  style={[styles.legendText, { color: theme.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}: {item.population.toLocaleString('vi-VN')}₫
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  errorContainer: { alignItems: 'center', marginHorizontal: 20, marginBottom: 10 },
  errorText: { fontSize: 14, textAlign: 'center' },
  reportTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 10,
  },
  reportTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  pickerLabelContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalPicker: {
    width: '100%',
    height: 200,
  },
  pickerItem: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
  },
  legendContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  legendTitle: {
    fontSize: 18, // Tăng từ 16 lên 18
    fontWeight: '600',
    marginBottom: 12,
  },
  legendItem: {
    marginBottom: 10, // Tăng khoảng cách giữa các mục
  },
  legendItemContent: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
    
  },
  legendText: {
    fontSize: 16, // Tăng từ 12 lên 14
    fontWeight: '600', // Đậm hơn
  },
  legendAmount: {
    fontSize: 14, // Tăng từ 12 lên 14
    fontWeight: '600', // Đậm hơn
    marginTop: 4, // Khoảng cách giữa hai dòng
  },
});

export default StatsScreen;