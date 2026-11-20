# Đảo Đèn Lồng · Phase 3 — Đèn cạn dầu

Game 3D qua ba Đêm, **Contract v1.2**. Mục tiêu mới: **giữ ít nhất 60% số đèn sáng tại bình minh**, thay vì thắng ngay khi thắp hết. Đèn hao dầu, có thể tắt; Bóng Mực hút đèn yếu. Luật nguồn: [Ticket-03](docs/spec/ticket_03_phase_3.md).

## Chạy game

Cần Node.js **22+**, npm và trình duyệt WebGL trên Windows/macOS/Linux. Từ thư mục repo:

```sh
npm ci
npm run build
npm start
```

Mở **http://127.0.0.1:4173/**; nếu đã chơi bản cũ, **Ctrl+F5**. Vào hành trình → giới thiệu Đêm → chơi → kết quả → Đêm tiếp. Thua được chơi lại đúng Đêm; thắng Đêm 3 thấy tổng điểm. Thư mục `dist/` có đủ tài nguyên để phục vụ trên static hosting, không cần CDN. Không mở bằng `file://`.

| Phím | Hành động |
| --- | --- |
| WASD | Đi theo camera thực tế |
| Space / Shift | Nhảy / lướt |
| E | Nạp đèn chưa sáng, thắp lại hoặc châm dầu đèn đang sáng |
| Q | Tỏa Sáng, tốn 3 đom đóm |
| ← / → hoặc kéo chuột | Xoay camera |
| P / Esc | Tạm dừng, tiếp tục, chơi lại, cài đặt, về menu |
| R | Chơi lại Đêm |

Cài đặt âm lượng, độ nhạy và **Bảng màu dễ phân biệt** được lưu trên thiết bị. Chế độ màu đổi viền/mắt Bóng Mực sang xanh #00B3FF, cảnh báo trắng kèm ⚠. Đèn tắt xẹp 20% và có vết rách, phân biệt không cần màu. Âm thanh bắt đầu sau thao tác vào Đêm.

## Luật mới

- Đêm 1/2/3 dài **240/270/300 giây**, cần **3/5, 4/6, 5/7** đèn đang sáng ở tick cuối. Thắp đủ sớm vẫn tiếp tục chơi. Hết máu luôn thua trước, kể cả tại bình minh.
- Thắp lần đầu cần **10** con, dầu lên **100**. Đèn hao **1 dầu/giây**; cạn thì tắt và mất tiến độ nạp. Đèn đã từng sáng chỉ cần **5** để thắp lại.
- E bên đèn sáng để châm: mỗi con thêm **10 dầu**, làm tròn lên số con cần dùng, không vượt 100. Chọn đèn nhận được gần nhất trong 2 m, bằng nhau chọn id nhỏ hơn; đèn thật sự đầy bị bỏ qua.
- Dầu **≥30** có vùng an toàn 6 m; dưới30 mất vùng an toàn và nhấp nháy 1 Hz. Thanh dầu nằm trên đèn. Refuel khôi phục vùng an toàn và đẩy địch ra mép.
- Bóng Mực wander tìm đèn yếu gần nhất, tới trong 2 m thì `drain`, hút **5 dầu/giây/con**, cộng với hao tự nhiên. Mây tới trong 6 m làm nó đuổi; Q làm choáng và ngừng hút. Chase không bỏ Mây để chạy sang đèn yếu.
- Sức chứa là **min(20, 10 + 2 × số lần thắp thành công)**, tính cả thắp lại, reset đầu Đêm. Châm dầu không tăng sức chứa; đèn dựng sẵn từ scenario không tăng.

Đi lại, nhảy, lướt, bùa, Gió Lạc, rơi/hồi sinh, bản đồ và thứ tự tick giữ các luật Phase 2 chưa bị thay. Xem [Ticket-02](docs/spec/ticket_02_phase_2.md) và [changelog các thay đổi phá tương thích](CHANGELOG.md).

## Điểm Phase 3

| Sự kiện | Điểm |
| --- | --- |
| Mỗi con nạp/châm | +5 |
| Thắp lần đầu / thắp lại | +100 / +40 |
| Pulse mỗi Bóng Mực | +5; tổng +15 nếu đang drain |
| Bình minh khi thắng | +50 + floor(dầu thật) mỗi đèn đang sáng, +50 mỗi Ngọn Lửa |

Không còn thưởng thời gian hoặc điểm khi nhặt. Tổng game chỉ cộng các Đêm đã thắng; chơi lại không cộng trùng.

## Headless và kiểm chứng

```sh
npm test
npm run verify
node src/headless.mjs --seed 42 --night 1 --scenario tests/scenarios/phase-3/relight-at-expiry.json --inputs tests/scenarios/phase-3/relight-at-expiry.inputs.json --ticks 60 --out result.jsonl --snapshot-every 10
```

**58 test** và **42 scenario** được kiểm chứng, gồm các test hồi quy còn hiệu lực. Mỗi scenario chạy hai lần so byte, assert kết quả và đo thời gian. `npm run verify` trả lỗi khi test đỏ, sai kỳ vọng hoặc không tất định; lưu [bằng chứng Phase 3](docs/proof/phase-3/verification.json). CI Ubuntu dùng cùng lệnh; chưa tự xác nhận kết quả CI mới hoặc bộ test ẩn.

CLI nhận Đêm 1/2/3, seed, scenario, inputs, ticks, out, snapshot-every (mặc định10). Không GPU, cố định60Hz. Input giữ giá trị/cạnh lên. Pause chỉ tăng tick, đóng băng sim_tick và gameplay. Snapshot đầu tick 0, sự kiện night_start, end bắt buộc ở cuối. Dữ liệu scenario/inputs sai trả mã2 và stderr, lỗi tham số/I/O trả khác0.

Snapshot v1.2 thêm fuel (một chữ số lẻ), ever_lit, relit_count và capacity; scenario thêm fuel/ever_lit/successful_lights/target_lantern_id. Event mới refuel, lantern_out, fuel_drain; lantern_lit có relight. Lý do thắng là dawn_survived, không còn all_lit. [game.contract.json](game.contract.json) được test khớp tuning runtime.

Dầu nội bộ là số nguyên 1/60; không lấy số snapshot làm logic. Vì làm tròn, snapshot30.0 có thể là dầu thật 29,983: vùng an toàn dựa trên dầu thật. Đèn đầy 100 tại tick 0 sẽ hao 1/60 ở bước 2 trước khi xét E tại bước 5, nên có thể nhận 1 con để bù. Xem [ADR](docs/adr/003-lantern-fuel-and-dawn.md) để biết thứ tự và các quyết định.

## Bằng chứng và giới hạn

Fixture **maintain-to-dawn** dùng input di chuyển/nhặt/châm, giữ3 đèn đến tick 14400 rồi thắng (768 điểm). Nó đặt sẵn đèn và kho đom đóm, tắt địch để cô lập bảo trì; các scenario drain riêng kiểm tra địch. Fixture **full-route-no-early-win** nhặt50 con và thắp5 đèn, vẫn playing ở tick1427. Không nhận đây là bằng chứng người đã chơi thắng màn mặc định.

Các fixture thời lượng chạy đủ 14.400/16.200/18.000tick với sinh địch/đom đóm, người chơi được đặt bất tử để chạy hết giờ; gió tắt để cô lập benchmark. Mốc ≤30giây headless được kiểm tra. Đây không phải FPS.

**Người dùng đã xác nhận thanh dầu Phase 3:** bình thường màu vàng, dưới 30 chuyển trắng và nhấp nháy khi bật bảng màu dễ phân biệt. Xem [ghi nhận chơi thử](docs/proof/phase-3/manual-acceptance.md). Đúng với hành vi đã triển khai; chưa có số đo tần số nhấp nháy hoặc xác nhận riêng mọi thành phần của chế độ màu/refuel/relight.

Agent đã kiểm tra logic, build/cú pháp và HTTP; công cụ UI Windows trước đó bị chặn xác minh URL. Kết quả 143,32 FPS trước đây thuộc Phase 2, không dùng làm số FPS Phase 3. Có thể đo lại bằng P → Đo FPS 1280×720, xuất `phase-3-fps.json`.

## Sáng tạo của tôi

Giữ biển mây, sao, câu nói Ông Đăng, âm nhạc thủ tục và hiệu ứng ánh sáng. Điều chỉnh vòng an toàn theo dầu, thêm thanh dầu và thông điệp bảo trì. Sàn cao trong suốt khi nhân vật bên dưới. Các phần này chỉ là trình bày, không thêm entity hoặc thay đầu ra headless; các kịch bản vẫn tất định.

## Tài liệu bàn giao

[Tiêu chí nghiệm thu](docs/spec/phase-3-acceptance.md) · [ADR](docs/adr/003-lantern-fuel-and-dawn.md) · [Changelog](CHANGELOG.md) · [Ghi chép và lý do đổi test](docs/notes/phase-3.md) · [AGENTS](AGENTS.md) · [CREDITS](CREDITS.md) · [LICENSE](LICENSE).

[README Phase 2](docs/phase-2-README.md) · [README Phase 1](docs/phase-1-README.md) · [README lab](docs/lab-README.md). Giữ nguyên tag phase-1/phase-2; bàn giao tag phase-3 riêng. Release v1.0.0 và video thuộc Phase 4.
