import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000";

function Auth({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register?username=${username}&password_raw=${password}`);
      setMessage(response.data.message || "Đăng ký thành công!");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Đăng ký thất bại");
    }
  };

  const handleLogin = async () => {
    try {
      const loginFormData = new FormData();
      loginFormData.append('username', username);
      loginFormData.append('password', password);

      const response = await axios.post(`${API_BASE_URL}/token`, loginFormData);
      const accessToken = response.data.access_token;
      
      localStorage.setItem('token', accessToken);
      onLoginSuccess(accessToken);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', maxWidth: '300px' }}>
      <h3>Xác thực tài khoản</h3>
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ display: 'block', marginBottom: '10px', width: '90%' }} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', marginBottom: '10px', width: '90%' }} />
      <button onClick={handleLogin}>Đăng nhập</button>
      <button onClick={handleRegister} style={{ marginLeft: '10px' }}>Đăng ký</button>
      <p style={{ color: 'blue' }}>{message}</p>
    </div>
  );
}

export default Auth;