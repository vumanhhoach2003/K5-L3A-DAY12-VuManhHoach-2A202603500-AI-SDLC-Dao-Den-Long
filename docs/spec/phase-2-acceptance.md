# Phase 2 — Tiêu chí nghiệm thu

Nguồn: [Ticket-02](ticket_02_phase_2.md), Contract v1.1. Bằng chứng tự động nằm trong `docs/proof/phase-2`. “Logic đạt” không có nghĩa giao diện đã được nhìn thấy hoặc âm thanh đã được nghe thử.

| Mục | Tiêu chí kiểm tra | Bằng chứng và kết quả |
| --- | --- | --- |
| Số liệu chuẩn | Tuning khớp contract; đi 6 m/60 tick; gravity 20; carry 10; cost 10; đúng các biên bán kính | `game.test`, `movement-regression`, `pulse-3d`: đạt |
| Lướt | 14 m/s trong 12 tick, hồi 90; hướng đi/quay mặt; giữ Y trên không; không bất tử | `dash-air`, `game.test`: đạt |
| Bản đồ | Đúng vị trí đèn; hai đảo/cầu/bục Đêm 2; tầng/dốc/bục/tháp Đêm 3 | `game.test`, `bridge`, `pad-night2/3`, `ramp-night3`: logic đạt; hình ảnh chưa xác nhận |
| Gió Lạc — Phần 3.1 | Sinh tick 1200, tối đa 2; chase khi mang ≥5, cách ≤15 m; cướp 3, flee 240; pulse đuổi hoặc thả đồ tại chỗ, biến mất sau 120 | `spawn-night2`, `drifter-steal/drop`, `game.test`: đạt |
| Bùa Gió — 3.2 | Hiệu lực 600 tick, chạy 7,2 m/s, dash không hồi nhưng không chồng; tái xuất sau 2700 | `charm`, `game.test`: logic đạt; hình ảnh chưa xác nhận |
| Chuỗi Đêm — 3.3 | Menu → giới thiệu có Ông Đăng → chơi → kết quả → Đêm tiếp; thua lại đúng Đêm; thắng Đêm 3 cộng tổng các Đêm thắng | `campaign.test`, `win-night1/2/3`: điều phối đạt; UI xuyên suốt chưa xác nhận |
| Tạm dừng — 3.4 | P/Esc chỉ tăng tick, đóng băng sim_tick và các bộ đếm; menu có Tiếp tục/Chơi lại/Cài đặt/Về menu | `pause`, `game.test`: logic đạt; nút UI chờ chơi thử |
| Cài đặt — 3.5 | Thay âm lượng/độ nhạy; lưu giữa lần mở; dữ liệu hỏng dùng mặc định | `campaign.test` với storage: đạt; trình duyệt thật chưa xác nhận |
| Âm thanh — 3.6 | Nhạc nền và hiệu ứng nhặt, thắp, pulse, hit, jump, dash, thắng, thua, spawn, 10 giây cuối; báo gió trước 2 giây | Có `audio.mjs` tổng hợp âm gốc; chưa nghe thử |
| HUD — 3.7 | Máu trên trái; mm:ss giữa trên, đỏ nhấp nháy ≤30 s; đèn/điểm trên phải; 10 ô dưới; cooldown dưới phải; nhắc E; mũi tên đèn ngoài màn | Có `view.mjs`, `style.css`; dữ liệu snapshot đạt, bố cục chưa xác nhận |
| Bảng màu — 3.8 | Material/UI dùng hex chuẩn; ambient = 0,15 + 0,55 × số đèn sáng/tổng đèn | Có `palette.mjs`, `scene.mjs`, CSS; chưa quan sát trực quan |
| Nhặt/drop/hit/fall | Height gate; rơi nửa túi trên vành 1,5–2,5 m, TTL 480; fall bỏ bất tử, mất cả túi, chờ 60 tick | `hit-drops`, `fall-respawn`, `game.test`: đạt |
| Spawn và thứ tự tick | Sinh ở bước 10, tương tác từ tick sau; cướp trước hit, tối đa một hit/tick | `mote-spawn`, `spawn-night2`, `game.test`: đạt |
| Contract v1.1 | CLI ba Đêm, snapshot mới, lỗi dữ liệu mã 2, pause/cạnh lên/seed tất định | Test CLI và 23 scenario so byte: đạt |
| Headless hiệu năng | Chạy đến 21.600 tick trong ≤30 giây | `duration-night1/2/3`, số đo thật trong `verification.json`: đạt |
| Render hiệu năng | FPS trung bình ≥30 ở 1280×720 trong 30 giây chơi | Có công cụ xuất `phase-2-fps.json`; **chưa có số đo** |

Tính năng trình bày không có tương đương JSONL: các test headless bảo vệ trạng thái nền; checklist dưới đây dùng để nghiệm thu UI. Không nhận test dữ liệu là bằng chứng đã nhìn hoặc nghe đúng.

## Checklist chơi thử

1. Ctrl+F5; đổi âm lượng, độ nhạy rồi tải lại để xác nhận lưu.
2. Đêm 1: thử A/D ở nhiều góc, nhảy/lướt/Q, HUD; thử P/Esc và bốn lựa chọn của menu tạm dừng.
3. Đêm 2: thử cầu, hai bục, bùa; để Gió Lạc cướp rồi pulse để lấy lại.
4. Đêm 3: lên hai dốc, bục lên tầng 2, gặp gió và kiểm tra lá/âm báo trước 2 giây.
5. Thua để chơi lại đúng Đêm; thắng Đêm 3 để kiểm tra tổng điểm.
6. Đo FPS từng Đêm bằng menu tạm dừng, giữ JSON nguyên gốc và thông tin máy. Chưa đạt thì ghi rõ, không sửa số đo.
