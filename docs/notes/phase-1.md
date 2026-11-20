# Phase 1 · Ghi chép

## Yêu cầu và kế hoạch

Nguồn: docs/spec/prd_0_phase_1.md do người dùng cung cấp. Yêu cầu trong cuộc trò chuyện: hoàn thành Phase 1. Không suy đoán phase sau.

Kế hoạch trước khi code: JavaScript ES module, logic thuần dùng chung cho Three.js và CLI; khai báo tuning; kiểm chứng tick, khoảng cách, input cạnh lên, thu thập/nạp, pulse, bị chạm, thắng/thua; lưu scenario/output thật; build web và kiểm tra trình duyệt; tài liệu rồi tag. Repo ban đầu chỉ có tài liệu lab và remote GitHub cá nhân.

## Giả định

- Đảo bán kính chơi 39 m, hình ảnh 40 m; mép chặn, không phạt rơi. Năm đèn trên vòng bán kính 25 m, ban đầu chưa sáng.
- Đi 6 m/s; nhảy vận tốc 7 m/s, trọng lực 18 m/s². Nhảy không né va chạm XZ.
- 110 đom đóm ban đầu theo seed; thêm một con mỗi 180 tick nếu dưới 100. Scenario thay danh sách ban đầu; cờ random điều khiển sinh thêm.
- 4 Bóng Mực ban đầu; thêm một con mỗi 900 tick. Scenario random_shades=false không sinh thêm. ID/vị trí tất định.
- Nhặt trước nạp, nạp trước pulse, pulse trước địch. Hết máu ưu tiên hơn thắng, thắng ưu tiên hơn bình minh trong cùng tick. Flames=0 xử lý ở bước đầu, không phát sự kiện lúc dựng.
- Tương tác đèn chưa sáng gần nhất; bằng khoảng cách giữ thứ tự L1…L5. deposited đủ cost được xem là sáng.
- Hành động cạnh lên, giữ nút không lặp; di chuyển giữ liên tục. Không dash.
- Đom đóm bị rơi bị loại, không sinh vật nhặt tránh lặp điểm. Số bị mất làm tròn xuống.
- Vùng an toàn chỉ quanh đèn đã sáng. Địch dựng trong vùng bị đẩy ra ở bước đầu; người chơi trong vùng được bảo vệ.
- Thưởng thắng dùng giây nguyên làm tròn xuống; điểm không giảm khi bị chạm. Số liệu khai báo README/contract.

## Nghiệm thu

20 bài test đơn vị/tích hợp/CLI đạt; sáu scenario chạy lặp so từng byte. README truy vết yêu cầu; `docs/proof/phase-1/verification.json` chứa hash và cấu hình máy. `full-route` đi bộ, nhặt 40 con và tự nạp năm đèn từ đầu bằng input, thắng tick 1427; chủ động tắt địch để cô lập vòng thu thập/nạp. Địch kiểm tra riêng trong defeat/pulse/survival.

Build thành công; HTTP index, module renderer và Three.js trả 200. Chưa có bằng chứng giao diện: Browser access host không khả dụng; thử cửa sổ Brave qua CUA nhưng công cụ chặn vì không xác định chắc URL. Đã dừng UI. Không tự nhận đã nhìn thấy hình ảnh hoặc chơi lại đúng, không đo FPS; cần mở localhost xác nhận. Chưa có review độc lập hoặc chạy macOS/Linux. Không xác nhận bộ test ẩn hay kết quả CI.

## Nhật ký AI và harness

- Công cụ: OpenAI Codex; skill Sites cho web cục bộ trong repo, Computer Use cho thử UI. Không subagent, không AI ảnh/âm thanh.
- Lời nhắc chính: “Hoàn thành phase 1”, kèm PRD. Agent chọn web để chạy đa nền tảng và giữ renderer tách logic.
- `AGENTS.md` ràng buộc contract và kiểm chứng thật. `scripts/verify.mjs`/CI bổ sung harness: thất bại nếu test đỏ hoặc output không tất định, lưu log tự động.
- npm bị EACCES do mạng sandbox; dùng cơ chế cấp quyền hệ thống, cài được Three.js khóa 0.181.2.
- Tự review phát hiện camera phía -Z làm hướng D hiển thị ngược; đổi camera sang +Z và ánh xạ W âm Z ở UI, giữ nguyên công thức headless. Đã kiểm tra cú pháp/build; chưa xác nhận trực quan.
- Bổ sung xử lý flames=0 tránh playing vô hạn, thêm test. Bổ sung test stun hết hạn, sinh địch và full-route thay vì chỉ kiểm tra đèn cuối dựng sẵn.
- Token: công cụ không cung cấp usage chính xác. Ước lượng thô 20.000–40.000 token cho đọc/triển khai/kiểm chứng/tài liệu, không phải billing. Chi phí tiền chưa xác định. Tiết kiệm bằng logic chung hai chế độ, test tập trung contract, không thêm engine build hoặc agent phụ.

## Retro

Logic và output tái lập không cần GPU; test biên giúp bám contract. Chưa khẳng định nghiệm thu trực quan vì UI bị chặn, cần kiểm tra chơi thật và review độc lập. Lần sau xác nhận công cụ trình duyệt từ đầu trước khi trang trí cảnh.

Không có giờ bắt đầu lab/thông báo Coach nên không xác nhận đúng hạn. Không sửa thời gian commit. Video và Release cuối ở Phase 4.

## Phản hồi sau chơi thử và sửa điều khiển

Người dùng đã tự chơi và xác nhận nhảy/camera, các cơ chế thu thập/nạp/pulse/địch, HUD, thắng/thua và chơi lại hoạt động. Trái/phải bị ngược; xem `docs/proof/manual-playtest.md`. Sửa đầu vào UI theo trục camera thực tế, kiểm tra bằng phép chiếu camera Three.js ở năm góc thay vì chỉ suy luận dấu trục. 21 test và build đạt; sáu output headless vẫn tất định. Agent chưa quan sát trực quan bản sửa, cần người dùng tải lại xác nhận. Không di chuyển tag phase-1; commit sửa sau tag để giữ nguyên lịch sử bàn giao.
