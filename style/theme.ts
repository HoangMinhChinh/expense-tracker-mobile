interface Theme {
  background: string;
  text: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
  border: string;
  button: string;
  buttonText: string;
  cardBackground: string;
  error: string; // Thêm màu cho thông báo lỗi
  success: string; // Thêm màu cho thông báo thành công
}

export const lightTheme: Theme = {
  background: '#f9f9f9',
  text: '#000',
  inputBg: '#fff',
  inputText: '#000',
  placeholder: '#888',
  border: '#ccc',
  button: '#ff4d4f',
  buttonText: '#fff',
  cardBackground: '#fff',
  error: '#ff0000', // Màu đỏ cho lỗi
  success: '#008000', // Màu xanh lá cho thành công
};

export const darkTheme: Theme = {
  background: '#2d2d2d',
  text: '#fff',
  inputBg: '#3d3d3d',
  inputText: '#fff',
  placeholder: '#aaa',
  border: '#555',
  button: '#ff4d4f',
  buttonText: '#fff',
  cardBackground: '#3d3d3d',
  error: '#ff4444', // Màu đỏ nhạt hơn cho dark mode
  success: '#00ff00', // Màu xanh lá sáng hơn cho dark mode
};