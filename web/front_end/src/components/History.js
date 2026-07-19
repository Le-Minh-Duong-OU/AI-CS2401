import React, { useState, useEffect } from 'react';
import api from '../api';

function History({ token, refreshTrigger }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm tải dữ liệu lịch sử từ Backend
  const fetchHistory = async () => {
    setLoading(true);
    try {

      const response = await api.get(`/history`);
      setHistoryData(response.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải lại bảng khi Token thay đổi hoặc có tín hiệu refreshTrigger (sau khi bấm dự đoán)
  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token, refreshTrigger]);

  // Hàm cập nhật Trạng thái thực tế khi người dùng chọn trong thẻ <select>
  const handleUpdateActual = async (recordId, newStatus) => {
    try {


      await api.put(`/history/${recordId}/actual`, { actual_status: Number(newStatus) });

      alert("Cập nhật kết quả thực tế thành công!");
      fetchHistory(); // Tải lại bảng để cập nhật màu sắc/giao diện mới
    } catch (error) {
      console.error("Lỗi cập nhật thực tế:", error);
      alert("Không thể cập nhật trạng thái thực tế.");
    }
  };

  if (loading && historyData.length === 0) return <p>Đang tải lịch sử...</p>;

  return (
    <div style={{ marginTop: '20px', fontFamily: 'Arial' }}>
      <h3>Bảng Lịch Sử Dự Đoán & Theo Dõi Kết Quả Thực Tế</h3>
      <p style={{ fontSize: '13px', color: '#666' }}>
        Hiển thị danh sách các đơn đã phân tích dựa trên 5 đặc trưng cốt lõi. Hãy cập nhật cột "Kết quả thực tế" khi có thông tin phòng.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th>ID</th>
              <th>Thời gian</th>
              <th>Số ngày chờ (Lead Time)</th>
              <th>Giá phòng (ADR)</th>
              <th>Loại đặt cọc (Deposit Type)</th>
              <th>Mã đại lý (Agent)</th>
              <th>Số lần hủy cũ (Prev Cancels)</th>
              <th>AI Dự báo</th>
              <th>Độ tin cậy</th>
              <th style={{ width: '200px' }}>Kết quả thực tế</th>
            </tr>
          </thead>
          <tbody>
            {historyData.length === 0 ? (
              <tr>
                <td colSpan="10">Chưa có lịch sử dự đoán nào.</td>
              </tr>
            ) : (
              historyData.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td style={{ fontSize: '12px' }}>{item.timestamp}</td>
                  <td>{item.lead_time} ngày</td>
                  <td>{item.adr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} vnđ</td>
                  <td>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: item.deposit_type === 'Non Refund' ? '#ffebee' : item.deposit_type === 'Refundable' ? '#e8f5e9' : '#f5f5f5',
                      color: item.deposit_type === 'Non Refund' ? '#c62828' : item.deposit_type === 'Refundable' ? '#2e7d32' : '#333'
                    }}>
                      {item.deposit_type}
                    </span>
                  </td>
                  <td>{item.agent !== null ? item.agent : 'Không có'}</td>
                  <td>{item.previous_cancellations} lần</td>

                  {/* Cột AI Dự báo */}
                  <td style={{
                    fontWeight: 'bold',
                    color: item.prediction === 1 ? '#d32f2f' : '#2e7d32',
                    backgroundColor: item.prediction === 1 ? '#fdeded' : '#edf7ed'
                  }}>
                    {item.prediction === 1 ? 'Bị Hủy' : 'Đến Nhận'}
                  </td>

                  <td>{(item.confidence * 100).toFixed(1)}%</td>

                  {/* Cột chọn Kết quả thực tế */}
                  <td>
                    <select
                      value={item.actual_status !== undefined ? item.actual_status : -1}
                      onChange={(e) => handleUpdateActual(item.id, e.target.value)}
                      style={{
                        padding: '6px',
                        borderRadius: '4px',
                        width: '100%',
                        fontWeight: 'bold',
                        border: '1px solid #ccc',
                        backgroundColor: item.actual_status === 0 ? '#e8f5e9' : item.actual_status === 1 ? '#ffebee' : '#fff',
                        color: item.actual_status === 0 ? '#2e7d32' : item.actual_status === 1 ? '#c62828' : '#333'
                      }}
                    >
                      <option value="-1" style={{ color: '#333' }}>-- Chưa rõ kết quả --</option>
                      <option value="0" style={{ color: '#2e7d32' }}>Khách đến nhận phòng</option>
                      <option value="1" style={{ color: '#c62828' }}>Khách đã hủy phòng thật</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;