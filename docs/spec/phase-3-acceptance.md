# Phase 3 — Tiêu chí nghiệm thu

Nguồn: Ticket-03, Contract v1.2. Kiểm tra cùng các luật Phase 1–2 không bị thay thế. “Đạt logic” chỉ nói về test/scenario đã chạy, không thay thế việc quan sát renderer.

| Yêu cầu | Tiêu chí kiểm tra | Bằng chứng |
| --- | --- | --- |
| Dầu chính xác | 6000 đơn vị nguyên, mỗi tick hao 1; sáng mới dầu100; out đúng tick6000 | phase3.test; fuel-expiry |
| Châm dầu | used=min(carried,ceil(deficit/10)); cap100, trừ đúng đồ, +5 mỗi con; giữ nút không lặp | refuel-ceil, test held input |
| Chọn đèn | Có thể chọn đèn sáng chưa đầy; bỏ đèn thực sự đầy; gần nhất, tie theo id | Unit test receiving/tie/full; test thứ tự decay trước interaction |
| Tắt và thắp lại | Out xóa deposited, giữ ever_lit; cost5; relit_count tăng; sự kiện đúng | relight-at-expiry, final-tick-relight, test partial relight |
| Vùng an toàn | fuel thật ≥30 bảo vệ; dưới30 mất; refuel khôi phục trước contact | boundary-thirty, restore-safety; test biên dù snapshot làm tròn30.0 |
| AI drain | Wander chọn đèn yếu gần nhất trước đèn tắt; chase không đổi sang đèn; vào drain trong 2 m | wander-to-drain, test tie/priority/chase |
| Hút dầu | Mỗi con trừ thêm 5 đơn vị 1/60 mỗi tick; cộng dồn với hao; log mỗi60 sim_tick | drain-stack (hai con:20→9 trong60tick), drain-pause |
| Thoát drain | Chase khi Mây≤6; stunned khi pulse; wander nếu đèn tắt/đủ30/xa>2 | Unit tests drain exits, restore-safety, pulse-drain |
| Thắng tại bình minh | Không thắng sớm; ngưỡng ceil(.6×count); cập nhật tick cuối trước xét; hết máu ưu tiên | no-early-win; dawn-win/loss-night1/2/3; final-tick-out/relight; death-priority |
| Duy trì sáng thật | Dùng input đi bộ/nhặt/châm để giữ3 đèn tới tick 14400 | maintain-to-dawn: won, dawn_survived, 768 điểm; fixture tắt địch và đặt sẵn đồ để cô lập upkeep |
| Sức chứa | 10+2×successful_lights, tối đa20; thắp lại cũng tăng; đặt sẵn không tính; reset mỗi Đêm | capacity-growth/cap, full-route-no-early-win; unit tests pickup/reset |
| Điểm | Nạp5; thắp100/40; pulse5/15; bonus dầu/máu chỉ khi thắng, không thưởng thời gian | refuel-ceil/relight/pulse-drain và các test bonus/terminal priority |
| HUD/thanh dầu | Đèn sáng có thanh dầu; dưới30 nhấp nháy 1 Hz; HUD carried/capacity | scene.mjs/view.mjs; helper appearance có test; **chờ quan sát bản Phase 3** |
| Bảng màu dễ phân biệt | Lưu boolean; viền/mắt #00B3FF; cảnh báo trắng có⚠; đèn tắt xẹp20% và rách | campaign.test + accessibility helper tests; **chờ thử renderer/settings thật** |
| Regression | Movement/camera, dash, jump, drop, fall, bùa, Gió Lạc, map/pads/wind, pause, CLI | Test cũ còn hiệu lực và 16 scenario kế thừa, không skip |
| Contract | v1.2 đúng tuning, snapshot/event/scenario mới, CLI dữ liệu lỗi, seed tất định | game.test, phase3.test, 42 scenario so byte |

## Chơi thử bổ sung

1. Ctrl+F5, đọc mục tiêu mới. Thắp đủ đèn sớm phải tiếp tục Đêm.
2. Quan sát thanh dầu; đèn dưới30 nhấp nháy, không còn vòng an toàn. Bóng Mực hút đèn yếu; pulse làm nó dừng.
3. E châm dầu đèn đang sáng; để đèn tắt rồi nạp5 để thắp lại. HUD sức chứa tăng 2 mỗi lần thắp.
4. Cài đặt → Bảng màu dễ phân biệt; kiểm tra mắt/viền xanh, cảnh báo trắng và⚠; tải lại xác nhận lưu. Đèn tắt vẫn phải phân biệt bằng hình dáng/vết rách.
5. Kiểm tra kết quả chỉ xuất hiện lúc hết máu hoặc bình minh; không có thưởng thời gian. Tổng điểm/chơi lại giữ quy tắc Phase 2.

Kết quả FPS 143,32 của người dùng thuộc Phase 2, lưu nguyên ở bằng chứng Phase 2; không dùng làm số đo renderer Phase 3. Bộ đo mới xuất `phase-3-fps.json` nếu cần kiểm tra lại.
