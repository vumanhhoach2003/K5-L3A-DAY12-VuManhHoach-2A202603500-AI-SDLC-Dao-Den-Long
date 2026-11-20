# Changelog

## Phase 3 — Đèn cạn dầu (Contract v1.2)

Các thay đổi phá vỡ tương thích với Phase 2:

- Bỏ thắng ngay khi thắp hết. Chỉ thắng tại bình minh, còn sống và có ít nhất 3/5, 4/6 hoặc 5/7 đèn sáng. `all_lit` bị thay bằng `dawn_survived`; hết máu vẫn ưu tiên trước.
- Thời lượng Đêm đổi từ 300/330/360 thành **240/270/300 giây**.
- Đèn có dầu tối đa 100, hao 1/giây, có thể tắt và châm thêm. Hết dầu xóa deposited; đèn đã từng sáng chỉ cần 5 để thắp lại, lần đầu vẫn cần 10.
- Vùng an toàn chỉ tồn tại khi đèn sáng và dầu ≥30. Bóng Mực wander ưu tiên đèn yếu, có trạng thái `drain`, hút thêm 5 dầu/giây mỗi con.
- Sức chứa không còn cố định 10: tăng 2 cho mỗi lần thắp thành công, kể cả thắp lại, tối đa 20; reset mỗi Đêm. Scenario đặt sẵn đèn sáng không tăng sức chứa.
- Thay toàn bộ điểm: nạp/châm +5 mỗi con; thắp đầu +100, lại +40; pulse thường +5, pulse drain tổng +15; thắng thưởng 50 + floor(dầu) mỗi đèn sáng và 50 mỗi Ngọn Lửa. Bỏ thưởng thời gian.
- Snapshot đèn thêm fuel/ever_lit/relit_count; player thêm capacity; scenario thêm fuel, ever_lit, successful_lights và target_lantern_id. Thêm event refuel, lantern_out, fuel_drain; lantern_lit thêm relight.

Tính năng trình bày mới: thanh dầu trên đèn, nhấp nháy 1 Hz khi dầu <30; đèn tắt xẹp 20% và có vết rách. Cài đặt bảng màu dễ phân biệt lưu trên máy: viền/mắt xanh #00B3FF, cảnh báo trắng kèm ⚠.

Giữ nguyên các tag `phase-1`, `phase-2` và bằng chứng cũ. Tests bị luật mới thay được cập nhật có lý do trong `docs/notes/phase-3.md`; không skip âm thầm.
