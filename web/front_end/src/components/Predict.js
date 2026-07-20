import React, { useState } from 'react';
import api from '../api';

function Predict({ token, onPredictSuccess }) {
    const [formData, setFormData] = useState({
        // hotel: '',
        // lead_time: 0,
        // arrival_date_year: 0,
        // arrival_date_month: '',
        // arrival_date_week_number: 0,
        // arrival_date_day_of_month: 0,
        // stays_in_weekend_nights: 0,
        // stays_in_week_nights: 0,
        // adults: 0,
        // children: 0,
        // babies: 0,
        // meal: '',
        // country: '',
        // market_segment: '',
        // distribution_channel: '',
        // is_repeated_guest: 0,
        // previous_cancellations: 0,
        // previous_bookings_not_canceled: 0,
        // reserved_room_type: '',
        // assigned_room_type: '',
        // booking_changes: 0,
        // deposit_type: '',
        // agent: 0,
        // company: 0,
        // days_in_waiting_list: 0,
        // customer_type: '',
        // adr: 0,
        // required_car_parking_spaces: 0,
        // total_of_special_requests: 0
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
            // Gửi đủ 28 trường về Backend (5 trường lấy từ form + 23 trường gán mặc định)
            const dataToSend = {
                // 1. 5 trường lấy từ Form nhập liệu của người dùng
                adr: formData.adr ? parseFloat(formData.adr.toString().replace(/,/g, '')) : 0,
                lead_time: formData.lead_time ? parseInt(formData.lead_time) : 0,
                agent: formData.agent ? parseFloat(formData.agent) : 0,
                previous_cancellations: formData.previous_cancellations ? parseInt(formData.previous_cancellations) : 0,
                deposit_type: formData.deposit_type || "No Deposit",

                // 2. 23 trường mặc định bổ sung cho đủ Schema Backend yêu cầu
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

            // Báo cho component cha cập nhật lịch sử
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
        // Xóa hết ký tự không phải số
        const cleanValue = value.toString().replace(/\D/g, '');
        // Định dạng thêm dấu phẩy hàng nghìn
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

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
                                // Chỉ giữ lại số khi lưu vào state
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

            {/* Khung hiển thị kết quả */}
            {result && (
                <div style={{
                    marginTop: '20px',
                    width: '100%',
                    maxWidth: '450px',
                    padding: '15px 20px',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    border: '1px solid',
                    backgroundColor: result.is_canceled === 1 ? '#fdeded' : '#edf7ed',
                    borderColor: result.is_canceled === 1 ? '#f5c6cb' : '#c3e6cb',
                    color: result.is_canceled === 1 ? '#721c24' : '#155724'
                }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>Kết Quả Phân Tích AI:</h4>
                    <p style={{ margin: 0, fontSize: '18px' }}>
                        Trạng thái: <strong>{result.is_canceled === 1 ? "⚠️ CÓ NGUY CƠ HỦY PHÒNG" : "✅ KHÁCH SẼ ĐẾN NHẬN"}</strong>
                    </p>
                </div>
            )}
        </div>
    );
}

export default Predict;