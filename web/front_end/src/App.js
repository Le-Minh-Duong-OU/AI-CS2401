import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Predict from './components/Predict';
import History from './components/History';
import BatchPredict from './components/BatchPredict';
import InfoModel from './components/InfoModel';
import api from './api';

function App() {
  const [token, setToken] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [activeTab, setActiveTab] = useState('single');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      setToken(null);
      setIsLoading(false);
      return;
    }
    const verifyToken = async () => {
      try {
        await api.get('/check-token');
        setToken(storedToken);
      } catch (error) {
        console.error("Token không hợp lệ hoặc đã hết hạn:", error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    verifyToken();
  }, []);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setActiveTab('single')
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setActiveTab('single')
    setToken('');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (!token) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const renderSinglePredict = () => {
    return (
      <Predict
        token={token}
        onPredictSuccess={() => setRefreshHistory(prev => prev + 1)}
      />
    );
  };

  const renderBatchPredict = () => {
    return (
      <BatchPredict
        token={token}
        onPredictSuccess={() => setRefreshHistory(prev => prev + 1)}
      />
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Hệ Thống Dự Đoán Hủy Phòng Khách Sạn</h1>
      <hr />

      {!token ? (
        <Auth onLoginSuccess={(newToken) => setToken(newToken)} />
      ) : (
        // Nếu đã đăng nhập -> Hiện các chức năng chính
        <div>
          <div style={{ textAlign: 'right' }}>
            <button onClick={handleLogout} style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#d80000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>Đăng xuất</button>
          </div>

          {/* Giao diện Dự đoán */}
          <div>
            <button
              onClick={() => setActiveTab('single')}
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: activeTab === 'single' ? '#007bff' : '#e0e0e0',
                color: activeTab === 'single' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Dự đoán riêng lẻ
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'batch' ? '#007bff' : '#e0e0e0',
                color: activeTab === 'batch' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Dự đoán hàng loạt (CSV)
            </button>
          </div>
          {activeTab === 'single' ? renderSinglePredict() : renderBatchPredict()}

          <hr style={{ marginTop: '30px' }} />

          {/* Giao diện Lịch sử */}
          <History token={token} refreshTrigger={refreshHistory} />
        </div>
      )}

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <span
          onClick={() => setShowInfo(!showInfo)}
          style={{
            color: '#007bff',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '15px',
            userSelect: 'none'
          }}
        >
          {showInfo ? "Ẩn thông tin mô hình AI" : "Thông tin thông số mô hình AI"}
        </span>

        {showInfo && (
          <div style={{ marginTop: '15px', textAlign: 'left' }}>
            <InfoModel token={token} />
          </div>
        )}
      </div>

    </div>
  );
}

export default App;