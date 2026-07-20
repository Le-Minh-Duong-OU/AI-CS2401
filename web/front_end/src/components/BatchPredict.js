import React, { useState } from 'react';
import api from '../api';

function BatchPredict({ token, onPredictSuccess, onAuthError }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setIsError(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Vui lòng chọn một file CSV trước!");
            return;
        }

        setLoading(true);
        setMessage('Đang xử lý dự đoán hàng loạt...');
        setIsError(false);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post(`/predict-batch`, formData, { responseType: 'blob' });

            // Tạo link tải file tự động
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ket_qua_du_doan_${file.name}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            setMessage('Dự đoán hàng loạt thành công! File kết quả đã được tải xuống.');
            setIsError(false);
            setFile(null);

            // Trigger cập nhật lịch sử nếu có
            if (onPredictSuccess) onPredictSuccess();

        } catch (error) {
            console.error("Lỗi dự đoán hàng loạt:", error);
            setIsError(true);

            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                setMessage('Phiên làm việc hết hạn hoặc bạn không có quyền truy cập.');
                if (onAuthError) onAuthError();
            } else {
                setMessage('Đã xảy ra lỗi khi xử lý file. Vui lòng kiểm tra lại định dạng và các cột trong file CSV.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '30px auto', padding: '25px', border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontFamily: 'Segoe UI, sans-serif' }}>
            <h2 style={{ marginTop: 0, color: '#333', fontSize: '20px' }}>Dự Đoán Hàng Loạt (Batch Prediction)</h2>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                Tải lên file dữ liệu đặt phòng dạng <strong>.csv</strong>. Hệ thống sẽ tự động dự đoán toàn bộ danh sách, lưu lịch sử và tự động tải file CSV kết quả về máy.
            </p>

            <form onSubmit={handleUpload} style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px', color: '#444' }}>Chọn file CSV đầu vào:</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={loading}
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !file}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: loading || !file ? '#a5d6a7' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        cursor: loading || !file ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {loading ? 'Đang phân tích...' : 'Bắt đầu dự đoán & Xuất file'}
                </button>
            </form>

            {message && (
                <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: isError ? '#fdeded' : '#edf7ed',
                    color: isError ? '#5c1d24' : '#1e4620',
                    border: `1px solid ${isError ? '#f5c6cb' : '#c3e6cb'}`,
                    textAlign: 'center',
                    fontSize: '14px'
                }}>
                    {message}
                </div>
            )}

            <div style={{ marginTop: '20px', fontSize: '13px', borderTop: '1px dashed #ddd', paddingTop: '15px', color: '#555' }}>
                <span style={{ fontWeight: 'bold' }}>Lưu ý:</span>
                <ul style={{ margin: '5px 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>File CSV cần chứa đầy đủ các cột thuộc tính của mô hình (ví dụ: <code>hotel</code>, <code>lead_time</code>, <code>adr</code>...).</li>
                    <li>File kết quả xuất ra sẽ giữ nguyên dữ liệu gốc và thêm cột kết quả dự đoán từ AI.</li>
                </ul>
            </div>
        </div>
    );
}

export default BatchPredict;