\# Dự đoán Hủy Đặt Phòng Khách Sạn — Nhóm 8 (CS2401 / ITEC3413)



> Đề tài 08: Dự đoán khả năng hủy đặt phòng khách sạn (Hotel Booking Cancellation Prediction)

> Môn Trí tuệ Nhân tạo (ITEC3413) — Trường ĐH Mở TP.HCM, Khoa CNTT — HK 3 năm học 2025–2026

> Giảng viên hướng dẫn: Võ Việt Khoa



\---



\## 1. Link repository Git (GitHub)



\- \*\*Repo (Private):\*\* https://github.com/Le-Minh-Duong-OU/AI-CS2401

\- \*\*Nhánh nộp bài:\*\* `Final-Project`

\- Repo đã được chuyển \*\*Private\*\* và mời giảng viên làm \*\*collaborator\*\* với email: \*\*khoa.vv@ou.edu.vn\*\*

\- \*\*Commit hash / tag dùng để chấm:\*\* `nop-BTL`

&#x20; → Kiểm tra bằng lệnh:

&#x20; ```bash

&#x20; git fetch --tags

&#x20; git checkout nop-BTL

&#x20; git log -1 --format="%H %ci"

&#x20; ```



&#x20; > ⚠️ \*Lưu ý cho nhóm:\* điền commit hash cụ thể ứng với tag `nop-BTL` vào đây trước khi nộp, ví dụ:

&#x20; > `Tag nop-BTL trỏ tới commit: <dán-commit-hash-40-ký-tự-tại-đây>`



\---



\## 2. Link video demo



\- \*\*Link:\*\* \*(điền link YouTube unlisted hoặc Google Drive tại đây)\*

\- Quyền chia sẻ: \*\*"Bất kỳ ai có liên kết"\*\* (Anyone with the link) / \*\*Unlisted\*\*

\- Nội dung demo gồm: chạy backend (FastAPI) + frontend, đăng nhập, dự đoán đơn lẻ (`/predict`), dự đoán hàng loạt từ CSV (`/predict-batch`), xem lịch sử dự đoán (`/history`).



\---



\## 3. Bảng phân công công việc và % đóng góp



| Công việc | Phụ trách | Mức đóng góp |

|---|---|---|

| Thu thập \& EDA dữ liệu | Lê Minh Dương | 100% |

| Tiền xử lý \& feature engineering | Nguyễn Thanh Hải | 100% |

| Huấn luyện \& tinh chỉnh mô hình | Nguyễn Duy Khang | 100% |

| Đánh giá \& phân tích | Nguyễn Duy Khang | 100% |

| API + Giao diện + Docker | Nguyễn Hữu Khang | 100% |

| Viết báo cáo \& video | Cả nhóm | 25%/mỗi người |

| \*\*Tổng\*\* | | \*\*100%\*\* |



\*\*Thành viên nhóm 8\*\* (họ tên + MSSV — điền MSSV còn thiếu trước khi nộp):



| # | Họ và tên | MSSV |

|---|---|---|

| 1 | Lê Minh Dương | 2451010013 |

| 2 | Nguyễn Duy Khang | 2251052049 |

| 3 | Nguyễn Thanh Hải | 1951052047 |

| 4 | Nguyễn Hữu Khang | 2251052050 |



\*Cả nhóm xác nhận bảng phân công và mức đóng góp trên là chính xác (chữ ký/xác nhận xem tại `BaoCao.docx`, mục "Bảng phân công công việc").\*



\---



\## 4. Khai báo sử dụng công cụ AI



| Công cụ AI | Mục đích sử dụng | Phạm vi áp dụng trong bài |

|---|---|---|

| ChatGPT | Gợi ý ý tưởng | Chương 1 |

| ChatGPT | Kéo dài ý tưởng và đoạn văn | Chương 1, 2, 3 |

| Claude | Sửa lỗi phân tích và tạo ảnh phân tích | Chương 3 |



\*\*Cam kết liêm chính:\*\*

1\. Không dùng AI để tạo toàn bộ báo cáo/mã nguồn rồi nộp như sản phẩm của mình.

2\. Mọi nội dung do AI gợi ý đều đã được nhóm kiểm chứng, hiểu rõ và chịu trách nhiệm.

3\. Không dùng AI để bịa số liệu hay kết quả thực nghiệm.



\*(Chi tiết đầy đủ xem tại `BaoCao.docx`, mục "Liêm chính trong việc sử dụng công cụ AI".)\*



\---



\## 5. Model artifact



| Thành phần | Đường dẫn trong gói nộp | Kích thước |

|---|---|---|

| Mô hình đã huấn luyện (best model) | `web/back\_end/best\_hotel\_model.pkl` | \~5.3 MB |

| Preprocessor (ColumnTransformer/Pipeline) | `web/back\_end/preprocessor.pkl` | \~9 KB |



Model tốt nhất được chọn dựa trên kết quả so sánh 3 mô hình trên tập test:



| Mô hình | Accuracy | Precision | Recall | F1-score | ROC-AUC |

|---|---|---|---|---|---|

| Random Forest | 0.8479 | 0.8298 | 0.7415 | 0.7832 | 0.9203 |

| Gradient Boosting | 0.8494 | 0.8474 | 0.7237 | 0.7807 | \*\*0.9251\*\* |

| Logistic Regression | 0.8061 | 0.7271 | 0.7628 | 0.7445 | 0.8905 |



Cả hai file `.pkl` đều dưới 100 MB nên được đính kèm trực tiếp trong gói nộp (không cần link tải ngoài).



\### Hướng dẫn load model



```python

import joblib



model = joblib.load("web/back\_end/best\_hotel\_model.pkl")

preprocessor = joblib.load("web/back\_end/preprocessor.pkl")



\# X\_new: DataFrame chứa các đặc trưng thô theo đúng schema BookingInput

X\_transformed = preprocessor.transform(X\_new)

prediction = model.predict(X\_transformed)          # 0 = không hủy, 1 = hủy

probability = model.predict\_proba(X\_transformed)   # xác suất tương ứng

```



Model và preprocessor được load tự động khi khởi động backend (xem `web/back\_end/main.py`, mục "LOAD MODEL VÀ PREPROCESSOR"). Cách chạy toàn bộ hệ thống (backend + frontend) xem chi tiết tại `web/README.md`.



\---



\## Cấu trúc thư mục chính



```

├── BaoCao.docx                  # Báo cáo bài tập lớn đầy đủ

└── web/

&#x20;   ├── train.py                 # Script huấn luyện \& xuất model/preprocessor

&#x20;   ├── requirements.txt

&#x20;   ├── data/                    # Hotel Booking Demand dataset (Kaggle)

&#x20;   ├── back\_end/                # FastAPI: auth, database, main API, model .pkl

&#x20;   └── front\_end/                # React frontend

```

