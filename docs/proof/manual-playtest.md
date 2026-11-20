# Kiểm thử thủ công do người dùng báo cáo

Người dùng đã trực tiếp chơi bản Phase 1 và báo cáo trong cuộc trò chuyện:

- Di chuyển trái/phải bị ngược: **không đạt**.
- Nhảy, xoay camera: đạt theo người dùng.
- Nhặt đom đóm, nạp đèn, tỏa sáng, Bóng Mực: hoạt động theo người dùng.
- HUD: cập nhật đúng theo người dùng.
- Đã thử thắng, thua và chơi lại: không có lỗi theo người dùng.

Đây là lời xác nhận của người chơi, không phải ảnh/video hoặc quan sát trực tiếp của agent. Không có cấu hình máy, phiên bản trình duyệt hoặc thông tin cache từ báo cáo.

## Sửa sau báo cáo

Ánh xạ WASD theo trục ngang của camera thực tế thay vì góc orbit đích; đầu vào gửi vào simulation ở tọa độ thế giới với yaw 0. Nhờ vậy hướng không phụ thuộc camera ở phía nào hoặc đang xoay nội suy. Thêm test chiếu tọa độ qua camera Three.js thật để kiểm tra A sang trái/D sang phải ở năm góc; test không cần GPU. Không thay công thức contract headless.

Bản sửa cần người dùng tải lại và xác nhận trái/phải. Giữ nguyên tag phase-1 đã phát hành; sửa nằm trong commit sau tag, không viết lại lịch sử.
