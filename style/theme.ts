// theme.ts
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
  error: string; // Thêm thuộc tính error
}

export const lightTheme: Theme = {
  background: '#f9f9f9',
  text: '#000',
  inputBg: '#fff',
  inputText: '#000',
  placeholder: '#888',
  border: '#ccc',
  button: '#007bff',
  buttonText: '#fff',
  cardBackground: '#fff',
  error: '#FF5722', // Màu lỗi cho light mode
};

export const darkTheme: Theme = {
  background: '#2d2d2d',
  text: '#fff',
  inputBg: '#3d3d3d',
  inputText: '#fff',
  placeholder: '#aaa',
  border: '#555',
  button: '#0056b3',
  buttonText: '#fff',
  cardBackground: '#3d3d3d',
  error: '#FF8A65', // Màu lỗi cho dark mode
};