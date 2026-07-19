import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000";

function BatchPredict({ token, onAuthError }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Vui lòng chọn một file CSV trước!");
            return;
        }

        setLoading(true);
        setMessage('Đang xử lý dự đoán hàng loạt...');

        const formData = new FormData();
        formData.append("file", file);

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'blob' //Nhận file trước
            };

            const response = await axios.post(`${API_BASE_URL}/predict-batch`, formData, config);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ket_qua_du_doan_${file.name}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);


            setMessage('Dự đoán hàng loạt thành công! File kết quả đã được tải xuống thiết bị của bạn.');
            setFile(null);
        } catch (error) {
            console.error("Lỗi dự đoán hàng loạt:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                onAuthError();
            } else {
                setMessage('Đã xảy ra lỗi trong quá trình xử lý file. Vui lòng kiểm tra lại cấu trúc file CSV.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h2>Dự Đoán Hàng Loạt (Batch Prediction)</h2>
            <p style={{ fontSize: '14px', color: '#666' }}>
                Tải lên file dữ liệu đặt phòng dạng <strong>.csv</strong> có đầy đủ các cột thuộc tính cần thiết. Hệ thống sẽ tự động dự đoán cho toàn bộ danh sách, ghi nhận vào lịch sử và trả về file kết quả chứa thêm cột dự đoán.
            </p>

            <form onSubmit={handleUpload} style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Chọn file CSV đầu vào:</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={loading}
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !file}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Đang phân tích...' : 'Bắt đầu dự đoán & Xuất file'}
                </button>
            </form>

            {message && (
                <div style={{ marginTop: '15px', padding: '10px', borderRadius: '4px', backgroundColor: '#e2f0d9', color: '#385723', textAlign: 'center' }}>
                    {message}
                </div>
            )}

            <div style={{ marginTop: '20px', fontSize: '13px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>💡 Lưu ý:</span>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>File CSV cần khớp cấu trúc trường đầu vào chuẩn (bao gồm ít nhất: <code>hotel</code>, <code>lead_time</code>, <code>adr</code>,...).</li>
                    <li>Kết quả trả về sẽ bổ sung thêm cột <code>prediction</code> (0 là An toàn, 1 là Hủy phòng) và cột độ tin cậy <code>confidence</code>.</li>
                </ul>
            </div>
        </div>
    );
}

export default BatchPredict;