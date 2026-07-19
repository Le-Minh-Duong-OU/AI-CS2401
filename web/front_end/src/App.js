import React, { useState } from 'react';
import Auth from './components/Auth';
import Predict from './components/Predict';
import History from './components/History';
import BatchPredict from './components/BatchPredict';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [activeTab, setActiveTab] = useState('single');
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

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
        // Nếu chưa đăng nhập -> Hiện file Login/Register
        <Auth onLoginSuccess={(newToken) => setToken(newToken)} />
      ) : (
        // Nếu đã đăng nhập -> Hiện các chức năng chính
        <div>
          <div style={{ textAlign: 'right' }}>
            <button onClick={handleLogout} style={{ backgroundColor: '#f44336', color: 'white' }}>Đăng xuất</button>
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
    </div>
  );
}

export default App;