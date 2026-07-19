import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000";

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
        adr: 0,
        lead_time: 0,
        agent: 0,
        previous_cancellations: 0,
        deposit_type: "No Deposit"
    });
    const [result, setResult] = useState(null);

    const handlePredict = async (e) => {
        e.preventDefault();

        try {

            const config = { headers: { Authorization: `Bearer ${token}` } };
            console.log(formData)
            const dataToSend = {
                // hotel: formData.hotel,
                // lead_time: Number(formData.lead_time),
                // arrival_date_year: Number(formData.arrival_date_year),
                // arrival_date_month: formData.arrival_date_month,
                // arrival_date_week_number: Number(formData.arrival_date_week_number),
                // arrival_date_day_of_month: Number(formData.arrival_date_day_of_month),
                // stays_in_weekend_nights: Number(formData.stays_in_weekend_nights),
                // stays_in_week_nights: Number(formData.stays_in_week_nights),
                // adults: Number(formData.adults),
                // children: Number(formData.children),
                // babies: Number(formData.babies),
                // meal: formData.meal,
                // country: formData.country,
                // market_segment: formData.market_segment,
                // distribution_channel: formData.distribution_channel,
                // is_repeated_guest: Number(formData.is_repeated_guest),
                // previous_cancellations: Number(formData.previous_cancellations),
                // previous_bookings_not_canceled: Number(formData.previous_bookings_not_canceled),
                // reserved_room_type: formData.reserved_room_type,
                // assigned_room_type: formData.assigned_room_type,
                // booking_changes: Number(formData.booking_changes),
                // deposit_type: formData.deposit_type,
                // agent: Number(formData.agent),
                // company: Number(formData.company),
                // days_in_waiting_list: Number(formData.days_in_waiting_list),
                // customer_type: formData.customer_type,
                // adr: Number(formData.adr),
                // required_car_parking_spaces: Number(formData.required_car_parking_spaces),
                // total_of_special_requests: Number(formData.total_of_special_requests)
                adr: Number(formData.adr),
                lead_time: Number(formData.lead_time),
                agent: Number(formData.agent),
                previous_cancellations: Number(formData.previous_cancellations),
                deposit_type: Number(formData.deposit_type),
            };
            console.log(dataToSend)
            const response = await axios.post(`${API_BASE_URL}/predict`, dataToSend, config);
            console.log("await")

            setResult(response.data);

            // Nếu dự đoán thành công, báo cho file cha biết để cập nhật lại lịch sử (nếu cần)
            if (onPredictSuccess) onPredictSuccess();
        } catch (error) {
            console.error(error.response?.data);

            alert("Lỗi 422 hoặc lỗi hệ thống! Kiểm tra console.");
        }
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <form onSubmit={handlePredict} style={{ maxWidth: '400px' }}>
                <h3>Nhập thông tin đặt phòng</h3>
                <div style={{ marginBottom: '10px' }}>
                    <label>Lead Time: </label>
                    <input type="number" value={formData.lead_time} onChange={e => setFormData({ ...formData, lead_time: e.target.value })} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Lead Time: </label>
                    <input type="number" value={formData.lead_time} onChange={e => setFormData({ ...formData, lead_time: e.target.value })} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Lead Time: </label>
                    <input type="number" value={formData.lead_time} onChange={e => setFormData({ ...formData, lead_time: e.target.value })} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Special Requests: </label>
                    <input type="number" value={formData.total_of_special_requests} onChange={e => setFormData({ ...formData, total_of_special_requests: e.target.value })} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Parking Spaces: </label>
                    <input type="number" value={formData.required_car_parking_spaces} onChange={e => setFormData({ ...formData, required_car_parking_spaces: e.target.value })} />
                </div>
                <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px' }}>Dự đoán</button>
            </form>

            {result && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#eee' }}>
                    <h4>Kết quả AI:</h4>
                    <p>Dự báo: <strong>{result.is_canceled === 1 ? "HỦY PHÒNG" : "AN TOÀN"}</strong></p>
                </div>
            )}
        </div>
    );
}

export default Predict;