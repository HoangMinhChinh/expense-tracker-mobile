import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';

interface ChangePassModalProps {
  visible: boolean;
  onClose: () => void;
}

const ChangePassModal: React.FC<ChangePassModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      Alert.alert(t.genericError, t.passwordMismatch);
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert('✅', t.save);
      onClose();
    } catch (error: any) {
      Alert.alert(t.genericError, error.message);
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    setValue: (val: string) => void,
    show: boolean,
    setShow: (val: boolean) => void,
    placeholder: string
  ) => (
    <View>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <View style={[styles.inputRow, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
        <TextInput
          placeholder={placeholder}
          secureTextEntry={!show}
          placeholderTextColor={theme.placeholder}
          style={[styles.inputFlex, { color: theme.inputText }]}
          value={value}
          onChangeText={setValue}
        />
        <TouchableOpacity onPress={() => setShow(!show)}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={24} color={theme.placeholder} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.modalBox, { backgroundColor: theme.inputBg }]}>
            <Text style={[styles.title, { color: theme.text }]}>{t.password || 'Đổi mật khẩu'}</Text>

            {renderPasswordInput(
              t.password || 'Mật khẩu hiện tại',
              currentPassword,
              setCurrentPassword,
              showCurrent,
              setShowCurrent,
              t.password || 'Mật khẩu hiện tại'
            )}

            {renderPasswordInput(
              t.newPassword || 'Mật khẩu mới',
              newPassword,
              setNewPassword,
              showNew,
              setShowNew,
              t.newPassword || 'Mật khẩu mới'
            )}

            {renderPasswordInput(
              t.confirmPassword || 'Xác nhận mật khẩu mới',
              confirmPassword,
              setConfirmPassword,
              showConfirm,
              setShowConfirm,
              t.confirmPassword || 'Xác nhận mật khẩu mới'
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: '#ccc' }]} onPress={onClose}>
                <Text style={[styles.cancelText, { color: '#000' }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#007bff' }]} onPress={handleChangePassword}>
                <Text style={[styles.saveText, { color: '#fff' }]}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    // Đã xóa alignItems: 'center'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center', // Căn giữa nội dung trong ScrollView
  },
  modalBox: {
    width: '85%',
    maxWidth: 450,
    borderRadius: 20,
    padding: 28,
    elevation: 10,
    marginBottom: 20,
    marginHorizontal: 'auto', // Căn giữa modalBox theo chiều ngang
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChangePassModal;