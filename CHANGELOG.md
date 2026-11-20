# Changelog

## Phase 4 — Bình minh v1.0.0 (Contract v1.3)

- Thêm bench_cmd: cảnh chuẩn200 Bóng Mực/100 đom đóm, camera orbit, warmup3s, các phép tính FPS/1%low/p95 và ảnh render thật.
- Thêm soak_cmd:10 Đêm cùng tiến trình, seed và input xác suất chuẩn, RSS trước/sau reset, cấu hình V8 được ghi trong output.
- Bảng xếp hạng top10 lưu trên đĩa qua server loopback, tên3–12 ký tự, tie theo thời điểm; có menu và lệnh xuấtJSON. Static hosting có fallback localStorage và nút xuấtJSON.
- Đổi đủ9 hành động, phát hiện trùng, khôi phục mặc định và lưu; chỉ báo chữ/mũi tên spawn, gió, đèn yếu,10 giây cuối; giảm chuyển động, chữ tối thiểu18px và tùy chọn×1,25.
- InstancedMesh gom lệnh vẽ actor, không giảm số thực thể chuẩn; giải phóng tài nguyên khi reset.
- Thêm bản đóng gói chạy sẵn, kiểm tra checkout sạch, retro, ảnh/video có nguồn rõ ràng và bằng chứng Phase4. Giữ nguyên các hash gameplay Phase3.

Không thay tuning/gameplay v1.2. run_cmd chuyển sang server có lưu bảng điểm; dữ liệu người chơi ở data/ và không commit. CI kiểm tra logic/hồi quy và các file đo đã lưu, không giả định runner CI có GPU để đo lại.

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

## Phase 2 — Ba hòn đảo (Contract v1.1)

Chuẩn hóa số liệu và bản đồ; thêm Đêm2/3, lướt, bùa, Gió Lạc, cầu/bục/dốc/tháp/gió, rơi/hồi sinh, chuỗi Đêm, tạm dừng, cài đặt, âm thanh và HUD. 38 test và23 scenario; người dùng xác nhận UI/âm thanh và đo143,32 FPS trong lượt chơi Đêm2. Số đo đó không thay benchmark chuẩn Phase4.

## Phase 1 — Đảo Bến (Contract v1.0)

Game3D ban đầu: đi, nhảy, gom đom đóm, thắp5 đèn, né Bóng Mực, pulse, thắng/thua, HUD và chơi lại. Simulation dùng chung với CLI60Hz;20 test tại tag. Sửa trái/phải theo camera trên main sau tag, thêm test phép chiếu (21 test); giữ tag gốc.
