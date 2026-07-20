
function InfoModel() {

    return (

        <div style={{
            marginTop: '40px',
            fontFamily: 'Segoe UI, Roboto, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{
                width: '100%',
                padding: '25px',
                borderRadius: '12px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                boxSizing: 'border-box'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Thông Tin Mô Hình Học Máy (AI Model Info)
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                        <span style={{ fontSize: '12px', color: '#6c757d', display: 'block' }}>Thuật toán sử dụng</span>
                        <strong style={{ fontSize: '15px', color: '#007bff' }}>Random Forest / Logistic Regression / Gradient Boosting (XGBoost/LightGBM)</strong>
                    </div>
                    <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                        <span style={{ fontSize: '12px', color: '#6c757d', display: 'block' }}>Số lượng đặc trưng (Features)</span>
                        <strong style={{ fontSize: '15px', color: '#28a745' }}>5 Đặc trưng cốt lõi</strong>
                    </div>
                    <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                        <span style={{ fontSize: '12px', color: '#6c757d', display: 'block' }}>Độ chính xác mô hình (Accuracy)</span>
                        <strong style={{ fontSize: '15px', color: '#ffc107' }}></strong>
                    </div>
                </div>

                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057' }}>Trọng số & Đặc trưng đầu vào (X):</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                    <li><strong>adr:</strong> Giá phòng trung bình mỗi đêm (Ảnh hưởng lớn đến quyết định hủy khi giá quá cao).</li>
                    <li><strong>deposit_type:</strong> Loại đặt cọc (Đặc biệt là nhóm <em>Non Refund</em> có tỷ lệ hủy thực tế rất thấp).</li>
                    <li><strong>lead_time:</strong> Số ngày đặt trước (Đặt quá xa ngày nhận thường có rủi ro hủy cao hơn).</li>
                    <li><strong>agent:</strong> ID của đại lý lữ hành (Hành vi đặt/hủy phụ thuộc vào uy tín từng đại lý).</li>
                    <li><strong>previous_cancellations:</strong> Số lần khách đã từng hủy trong quá khứ (Dấu hiệu lịch sử của khách hàng).</li>
                </ul>
            </div>
        </div>
    );
}
export default InfoModel;