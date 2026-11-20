# Phase 2 — Ghi chép

## Kế hoạch và kiến trúc

Đọc toàn bộ Ticket-02 trước khi sửa. Kế hoạch: chuẩn hóa tuning, mở rộng map/physics/tick, test các trường hợp biên và scenario; nối renderer/UI ba Đêm, cài đặt và âm thanh; đo headless, thử UI, lưu bằng chứng rồi bàn giao. Không suy đoán phase sau.

Web và CLI vẫn dùng cùng simulation. Tách maps, tuning, validation, campaign, controls, audio, scene và palette. Cập nhật AGENTS, bộ verify và CI, giữ nguyên tag và bằng chứng Phase 1. Tiêu chí nghiệm thu từng mục Phần 3 nằm trong `docs/spec/phase-2-acceptance.md`.

## Giả định cho phần chưa quy định

- Xuất phát mọi Đêm tại (0,0,0), mặt +Z theo Contract kế thừa. Đêm 3 có mặt đất Y=0 dưới các sàn cao; sàn nhận nhân vật đáp từ trên và chặn đi ngang lên vách. Renderer làm sàn trên trong suốt khi Mây ở dưới để không che nhân vật tại gốc.
- Sinh đom đóm chọn ngẫu nhiên trong các điểm chưa bị chiếm. Lượt sinh thường chỉ thực hiện khi tổng motes_active <30. Hit có thể làm số thực thể vượt 30; không xóa đồ rơi để ép trần.
- Bóng Mực mới `spawning` trong 60 tick; scenario thiếu state dùng `wander` và hoạt động ngay. Wander 1 m/s theo đường tất định vì ticket không quy định tốc độ này. Địch sinh mới không tương tác ngay trong tick sinh.
- Tâm Bóng Mực sinh tại mặt đất +0,8 m; scenario giữ tâm được cung cấp. Mob theo nền/dốc, bị chặn ở mép, vách và tháp. Vùng an toàn đẩy ra mép tức thì, đáp ứng giới hạn ≤30 tick; không hit trong tick bị đẩy.
- Gió Lạc idle lượn 2 m/s, flee bay ra xa Mây theo XZ. Đồ thả tại đúng XZ của nó, đưa về mặt đất nếu có, TTL 480 tick. Nếu ngoài đảo thì giữ cao độ hiện tại. Snapshot giữ entity `removed`, nhưng không tính vào giới hạn hai con còn hoạt động.
- Bùa scenario mặc định available=true; có thể đặt pos hoặc tra vị trí theo id. Snapshot `invuln` là boolean, thêm `invuln_ticks`; các trường có hậu tố `_s` là giây. Đom đóm random có ttl_s=null.
- Resume được xử lý trước nên tick bỏ pause chạy một bước gameplay. Input vẫn được cập nhật khi paused; nút đã nhấn trong pause không tự kích hoạt lại nếu chưa thả.
- CLI phát `night_start` tại tick 0 sau snapshot đầu, không phát sự kiện hoặc thưởng khi dựng scenario. CLI chỉ chạy một Đêm; Campaign điều phối ba Đêm ở web và cộng điểm các Đêm đã thắng.
- Chạy tăng/dừng tức thì, đáp ứng ≤0,1 s. Bục phóng khi chân đang chạm đất trong 1 m. Dash tạm thay vận tốc ngang và giữ Y; sau dash tiếp tục vận tốc phóng đến khi đáp. Nhấn khi đang dash bị bỏ qua.
- TTL giảm ở đầu tick. Đồ có born bằng sim_tick hiện tại không được nhặt. Fall ở bước 3 bỏ qua invuln, chờ 60 tick. Recoil bắt đầu ngay khi hit để đủ 2 m trong 60 tick.

## Test cũ thay đổi có lý do

| Luật Phase 1 | Ticket 02 thay bằng | Kiểm tra mới |
| --- | --- | --- |
| Carry 12, pickup 1,5 m không xét Y | Carry 10, pickup 1 m và height ≤1,5 | Test biên, sức chứa và độ cao |
| Cost 8, interact 3 m, điểm khi nhặt | Cost 10, interact 2 m, điểm khi nạp | Partial deposit, tie theo id và điểm nạp |
| Pulse 2/7 m, choáng 3 s, đẩy ngay | Pulse 3/5 m 3D, choáng 120 tick, đẩy trong 15 tick | pulse-3d, cooldown và làm mới choáng |
| Hit rơi 25%, invuln 120, đồ biến mất | Rơi nửa, invuln 90, recoil 60, TTL 480 | Hit, hồi đồ, TTL và recoil |
| Mép đảo chặn, gravity 18 | Fall, respawn 60, gravity 20 | Fall, pad, ramp, air dash |
| Địch có sẵn, spawn 900, speed 2,3 | Spawn tick 300 rồi theo lịch, speed 4/4,5 | Spawn, detection và giới hạn |
| Pause chỉ UI, chỉ Đêm 1 | Pause Contract với sim_tick; ba Đêm | CLI pause và ba thời lượng |
| Full route 40 con, đèn cost 8 | Full route 50 con, cost 10 | Fixture Phase 2 riêng, không sửa fixture Phase 1 |

Giữ các kiểm tra còn hiệu lực: camera yaw/chuẩn hóa, snapshot 0, input giữ giá trị/cạnh lên, một đèn mỗi lần nạp, scenario không điểm, thắng/thua, tất định, lỗi CLI và phép chiếu A/D. Không biết nội dung test ẩn nên không tuyên bố tất cả test ẩn đạt.

## Kiểm chứng và lỗi phát hiện

- 38 test logic/CLI/campaign/settings/projection; 23 scenario chạy lặp, so từng byte và assert kỳ vọng. Ba fixture thời lượng chạy đến 18.000/19.800/21.600 tick; script ép ngưỡng 30 s. Số đo và cấu hình máy trong `verification.json`.
- Test bùa đếm nhầm một bước dashLeft; đối chiếu chuỗi 12→11→10→9 rồi sửa kỳ vọng, không sửa runtime theo assert sai.
- Test cầu gặp bùa ở giữa cầu nên chạy nhanh đúng luật. Thêm charms:[] để cô lập test cầu, giữ test bùa riêng; không tắt bùa trong game.
- Test recoil phát hiện chase đi quá đích khi trùng tâm. Giới hạn bước theo khoảng cách còn lại và kiểm tra tổng 2 m/60 tick. Tự review sửa state timer bằng 0, đồ Gió Lạc phải rơi tại chỗ, và spawn cap tính cả đồ rơi.
- Build, cú pháp và HTTP được kiểm tra. Browser access host không khả dụng; click cửa sổ Brave báo “coordinate input geometry is unavailable”. Điều hướng bằng phím sau đó bị CUA chặn do không xác minh chắc URL hiện tại trên Windows. Đã dừng UI, không dùng đường khác để vượt chặn.
- Có công cụ đo FPS 30 s tại 1280×720, pixel ratio 1. JSON ghi nếu ẩn cửa sổ hoặc rời gameplay để không nhận nhầm FPS menu. **Chưa có kết quả GPU, âm thanh hay UI Phase 2 được xác nhận.** Đã nhờ người dùng chơi thử; phản hồi Phase 1 không thay thế kiểm tra Phase 2.

## AI, token và retro

OpenAI Codex thực hiện; áp dụng quy trình Sites và Computer Use đã đọc ở Phase 1. Không dùng agent phụ hay tài nguyên ảnh AI. AGENTS ngắn cùng verify/CI là harness; dừng khi test đỏ, không sửa output để nhận đạt.

Không có usage token chính xác hoặc chi phí billing. Ước lượng thô 30.000–60.000 token cho Phase 2, không phải số đo. Tiết kiệm bằng simulation dùng chung, giữ Three.js hiện tại, không cài engine khác, test tập trung, fixtures nhỏ và không tạo tài nguyên ảnh.

Logic đã kiểm chứng; DoD chưa xác nhận đầy đủ khi FPS/UI/âm thanh còn thiếu số đo và chơi thử. Cần xác nhận công cụ UI từ đầu ở lần sau. Không biết mốc giờ Coach nên không khẳng định đúng hạn. Giữ tag phase-1, bàn giao phase-2 riêng; chưa tạo Release v1.0.0/video của Phase 4.

## Bổ sung từ người dùng sau bàn giao

Người dùng báo “Giao dien oke, am thanh có, FPS trong file” và cung cấp `phase-2-fps.json`. Đã lưu nguyên gốc tại `docs/proof/phase-2/phase-2-fps.json`, kiểm tra hash bản sao trùng nguồn và tính lại 4300/30,0026 = 143,3209 FPS. Độ phân giải 1280×720, pixel ratio 1, Đêm 2, visible_entire_run=true: đạt ngưỡng FPS trong lượt đo này. Không có trường gameplay_entire_run nên không tự bổ sung vào bằng chứng. Chưa có số đo riêng Đêm 1/3 hoặc xác nhận từng hiệu ứng và mục UI.

Đây là bổ sung bằng chứng sau tag phase-2, không phải thay đổi game. Giữ nguyên tag đã phát hành; tài liệu trên main phản ánh xác nhận mới. Ghi nhận trước đây về thiếu mọi bằng chứng UI/FPS nay được thay thế bởi phản hồi và file của người dùng, trong phạm vi nêu trên.
