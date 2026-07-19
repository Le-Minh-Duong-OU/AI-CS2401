import React, { useState } from 'react';
import api from '../api';

function Auth({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Hàm giám sát và kiểm tra dữ liệu đầu vào
  const validateInputs = () => {
    if (!username.trim()) {
      setMessage("Tên đăng nhập không được để trống!");
      setIsError(true);
      return false;
    }
    if (username.trim().length < 3) {
      setMessage("Tên đăng nhập phải có ít nhất 3 ký tự!");
      setIsError(true);
      return false;
    }
    if (!password) {
      setMessage("Mật khẩu không được để trống!");
      setIsError(true);
      return false;
    }
    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự!");
      setIsError(true);
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    // Chạy hàm giám sát dữ liệu trước khi gọi API
    if (!validateInputs()) return;

    try {
      const response = await api.post(`/register?username=${username.trim()}&password_raw=${password}`);
      setMessage(response.data.message || "Đăng ký thành công!");
      setIsError(false);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Đăng ký thất bại");
      setIsError(true);
    }
  };

  const handleLogin = async () => {
    // Chạy hàm giám sát dữ liệu trước khi gọi API
    if (!validateInputs()) return;

    try {
      const loginFormData = new FormData();
      loginFormData.append('username', username.trim());
      loginFormData.append('password', password);

      const response = await api.post(`/token`, loginFormData);
      const accessToken = response.data.access_token;

      localStorage.setItem('token', accessToken);
      onLoginSuccess(accessToken);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Sai tài khoản hoặc mật khẩu");
      setIsError(true);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '50px',
      fontFamily: 'Segoe UI, Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        padding: '30px',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        border: '1px solid #eaeaea',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ margin: '0 0 25px 0', color: '#333', textAlign: 'center', fontSize: '22px' }}>
          Xác thực tài khoản
        </h3>

        {/* Ô nhập Tài khoản */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              if (message) setMessage(''); // Xóa thông báo lỗi khi người dùng sửa dữ liệu
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        {/* Ô nhập Mật khẩu */}
        <div style={{ marginBottom: '25px' }}>
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              if (message) setMessage(''); // Xóa thông báo lỗi khi người dùng sửa dữ liệu
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        {/* Khung chứa 2 nút hành động */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleLogin}
            style={{
              flex: 1,
              backgroundColor: '#007bff',
              color: 'white',
              padding: '11px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0069d9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Đăng nhập
          </button>

          <button
            onClick={handleRegister}
            style={{
              flex: 1,
              backgroundColor: '#6c757d',
              color: 'white',
              padding: '11px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            Đăng ký
          </button>
        </div>

        {/* Thông báo kết quả / Cảnh báo giám sát */}
        {message && (
          <p style={{
            marginTop: '20px',
            marginBottom: '0',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: isError ? '#dc3545' : '#28a745'
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Auth;