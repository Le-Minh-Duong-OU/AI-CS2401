import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000";

function History({ token, refreshTrigger, onAuthError }) {
  const [historyList, setHistoryList] = useState([]);

  const fetchHistory = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Thay đổi endpoint URL chính xác theo Backend của bạn
      const response = await axios.get(`${API_BASE_URL}/history`, config);
      setHistoryList(response.data);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        onAuthError();
      } else {
        console.error("Không thể lấy lịch sử:", error);
      }
    }
  };

  const handleUpdateActual = async (recordId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Gửi phương thức PUT kèm body chứa trạng thái mới
      await axios.put(
        `${API_BASE_URL}/history/${recordId}/actual`,
        { actual_status: Number(newStatus) },
        config
      );

      alert("Đã cập nhật kết quả thực tế!");
      fetchHistory(); // Tải lại bảng lịch sử để cập nhật giao diện mới nhất
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Không thể cập nhật kết quả thực tế.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token, refreshTrigger]); // Tự động load lại lịch sử khi có trigger dự đoán mới

  return (
    <div style={{ marginTop: '30px' }}>
      <h3>Lịch sử dự đoán</h3>
      {historyList.length === 0 ? <p>Chưa có dữ liệu lịch sử.</p> : (
        <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#ddd' }}>
              <th>Thời gian</th>
              <th>Lead Time</th>
              <th>Kết quả AI Dự Đoán</th>
              <th>Kết quả Thực Tế</th>
            </tr>
          </thead>
          <tbody>
            {historyList.map((item, index) => (
              <tr key={item.id || index}>
                <td>{item.timestamp}</td>
                <td>{item.lead_time}</td>
                <td style={{ color: item.prediction === 1 ? 'red' : 'green' }}>
                  {item.prediction === 1 ? "Hủy" : "An toàn"}
                </td>
                <td>
                  <select
                    value={item.actual_status !== undefined ? item.actual_status : -1}
                    onChange={(e) => handleUpdateActual(item.id, e.target.value)}
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      backgroundColor: item.actual_status === 1 ? '#ffebee' : item.actual_status === 0 ? '#e8f5e9' : '#fff'
                    }}
                  >
                    <option value="-1">-- Chưa rõ / Đang chờ --</option>
                    <option value="0" style={{ color: 'green' }}>Khách đến nhận phòng (Không hủy)</option>
                    <option value="1" style={{ color: 'red' }}>Khách đã hủy phòng thật</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;