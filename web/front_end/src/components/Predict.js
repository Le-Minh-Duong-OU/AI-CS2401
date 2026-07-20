import React, { useState } from 'react';
import api from '../api';

function Predict({ token, onPredictSuccess }) {
    const [formData, setFormData] = useState({
        adr: '',
        lead_time: '',
        agent: '',
        previous_cancellations: '',
        deposit_type: "No Deposit"
    });
    const [result, setResult] = useState(null);

    const handlePredict = async (e) => {
        e.preventDefault();

        try {
            // Gửi đủ 28 trường về Backend
            const dataToSend = {
                adr: formData.adr ? parseFloat(formData.adr.toString().replace(/,/g, '')) : 0,
                lead_time: formData.lead_time ? parseInt(formData.lead_time) : 0,
                agent: formData.agent ? parseFloat(formData.agent) : 0,
                previous_cancellations: formData.previous_cancellations ? parseInt(formData.previous_cancellations) : 0,
                deposit_type: formData.deposit_type || "No Deposit",

                // 23 trường mặc định
                hotel: "City Hotel",
                arrival_date_year: 2026,
                arrival_date_month: "August",
                arrival_date_week_number: 33,
                arrival_date_day_of_month: 15,
                stays_in_weekend_nights: 0,
                stays_in_week_nights: 1,
                adults: 2,
                children: 0.0,
                babies: 0.0,
                meal: "BB",
                country: "PRT",
                market_segment: "Online TA",
                distribution_channel: "TA/TO",
                is_repeated_guest: 0,
                previous_bookings_not_canceled: 0,
                reserved_room_type: "A",
                booking_changes: 0,
                company: 0.0,
                days_in_waiting_list: 0,
                customer_type: "Transient",
                required_car_parking_spaces: 0,
                total_of_special_requests: 0
            };

            console.log("Data sending to backend:", dataToSend);

            const response = await api.post(`/predict`, dataToSend);
            setResult(response.data);

            if (onPredictSuccess) onPredictSuccess();

            // Reset form
            setFormData({
                adr: '',
                lead_time: '',
                agent: '',
                previous_cancellations: '',
                deposit_type: "No Deposit"
            });
        } catch (error) {
            console.error("Predict Error:", error.response?.data || error.message);
            alert("Có lỗi xảy ra khi gọi API dự đoán! Xem console để biết chi tiết.");
        }
    };

    const formatNumber = (value) => {
        if (!value) return '';
        const cleanValue = value.toString().replace(/\D/g, '');
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Hàm lấy giá trị độ tin cậy an toàn từ response backend
    // Backend thường trả về confidence / probability (ví dụ: 0.88 hoặc 88)
    const getConfidenceScore = () => {
        if (!result) return 0;
        const rawScore = result.confidence ?? result.probability ?? result.score ?? 0;
        // Nếu giá trị <= 1 (ví dụ 0.8521) thì nhân 100, còn lại giữ nguyên
        const percentage = rawScore <= 1 ? rawScore * 100 : rawScore;
        return Math.round(percentage * 10) / 10; // Làm tròn 1 chữ số thập phân
    };

    const confidenceScore = getConfidenceScore();
    const isCanceled = result?.is_canceled === 1;

    return (
        <div style={{
            marginTop: '30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'Segoe UI, Roboto, sans-serif'
        }}>
            <form onSubmit={handlePredict} style={{
                width: '100%',
                maxWidth: '450px',
                padding: '30px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                border: '1px solid #eaeaea'
            }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333', textAlign: 'center', fontSize: '22px' }}>
                    Nhập thông tin đặt phòng
                </h3>

                {/* Ô nhập Giá 1 đêm */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555', fontSize: '14px' }}>
                        Giá 1 đêm (ADR):
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={formatNumber(formData.adr)}
                            onChange={e => {
                                const rawValue = e.target.value.replace(/\D/g, '');
                                setFormData({ ...formData, adr: rawValue });
                            }}
                            style={{
                                width: '100%',
                                padding: '10px 60px 10px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ccc',
                                fontSize: '15px',
                                boxSizing: 'border-box',
                                outline: 'none',
                                textAlign: 'left'
                            }}
                            placeholder="Ví dụ: 456,988"
                        />
                        <span style={{
                            position: 'absolute',
                            right: '12px',
                            color: '#888',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            pointerEvents: 'none'
                        }}>
                            VNĐ
                        </span>
                    </div>
                </div>

                {/* Ô nhập Số ngày đặt trước */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555', fontSize: '14px' }}>
                        Số ngày đặt trước (Lead Time):
                    </label>
                    <input
                        type="number"
                        value={formData.lead_time}
                        onChange={e => setFormData({ ...formData, lead_time: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            fontSize: '15px',
                            boxSizing: 'border-box',
                            outline: 'none'
                        }}
                        placeholder="Ví dụ: 45"
                    />
                </div>

                {/* Ô nhập Mã đại lý */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555', fontSize: '14px' }}>
                        Mã đại lý (Agent):
                    </label>
                    <input
                        type="number"
                        value={formData.agent}
                        onChange={e => setFormData({ ...formData, agent: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            fontSize: '15px',
                            boxSizing: 'border-box',
                            outline: 'none'
                        }}
                        placeholder="Ví dụ: 9"
                    />
                </div>

                {/* Ô nhập Số lần đã hủy */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555', fontSize: '14px' }}>
                        Số lần đã hủy trước đó:
                    </label>
                    <input
                        type="number"
                        value={formData.previous_cancellations}
                        onChange={e => setFormData({ ...formData, previous_cancellations: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            fontSize: '15px',
                            boxSizing: 'border-box',
                            outline: 'none'
                        }}
                        placeholder="Ví dụ: 0"
                    />
                </div>

                {/* Hộp chọn Loại đặt cọc */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: '#555', fontSize: '14px' }}>
                        Loại đặt cọc (Deposit Type):
                    </label>
                    <select
                        name="deposit_type"
                        value={formData.deposit_type || "No Deposit"}
                        onChange={e => setFormData({ ...formData, deposit_type: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ccc',
                            fontSize: '15px',
                            backgroundColor: '#fff',
                            boxSizing: 'border-box',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="No Deposit">No Deposit (Không đặt cọc)</option>
                        <option value="Non Refund">Non Refund (Không hoàn lại)</option>
                        <option value="Refundable">Refundable (Có thể hoàn lại)</option>
                    </select>
                </div>

                {/* Nút bấm */}
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '12px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(40, 167, 69, 0.2)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                    Phân Tích Bằng AI
                </button>
            </form>

            {/* Khung hiển thị kết quả bao gồm Độ tin cậy */}
            {result && (
                <div style={{
                    marginTop: '20px',
                    width: '100%',
                    maxWidth: '450px',
                    padding: '20px',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    border: '1px solid',
                    backgroundColor: isCanceled ? '#fdeded' : '#edf7ed',
                    borderColor: isCanceled ? '#f5c6cb' : '#c3e6cb',
                    color: isCanceled ? '#721c24' : '#155724'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Kết Quả Phân Tích AI
                    </h4>

                    <p style={{ margin: '0 0 12px 0', fontSize: '18px' }}>
                        Trạng thái: <strong>{isCanceled ? "⚠️ CÓ NGUY CƠ HỦY PHÒNG" : "✅ KHÁCH SẼ ĐẾN NHẬN"}</strong>
                    </p>

                    {/* Hiển thị % Độ tin cậy */}
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px', fontWeight: '600' }}>
                            <span>Độ tin cậy:</span>
                            <span>{confidenceScore}%</span>
                        </div>

                        {/* Thanh Progress Bar trực quan */}
                        <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${confidenceScore}%`,
                                height: '100%',
                                backgroundColor: isCanceled ? '#dc3545' : '#28a745',
                                transition: 'width 0.5s ease-in-out'
                            }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Predict;