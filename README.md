# Đảo Đèn Lồng · Phase 2 — Ba hòn đảo

Game 3D góc nhìn thứ ba: cùng Mây giữ ánh sáng qua Đảo Bến, Đảo Cau và Đảo Chuông. **Test Contract v1.1** và số liệu chuẩn của [Ticket-02](docs/spec/ticket_02_phase_2.md). Phase 1 được giữ nguyên ở tag `phase-1`; bản hiện tại gồm sửa điều khiển camera sau lần chơi thử.

## Cài đặt và chơi

Node.js **22+**, npm và trình duyệt WebGL trên Windows/macOS/Linux. Chạy trong thư mục repo:

```sh
npm ci
npm run build
npm start
```

Mở **http://127.0.0.1:4173/**, nếu đã mở bản cũ hãy **Ctrl+F5**. Chọn Bắt đầu → giới thiệu Đêm → chơi. Thắng để sang Đêm tiếp theo; thắng Đêm 3 thấy Bình Minh và tổng điểm các Đêm đã thắng. Thua chơi lại đúng Đêm đó. Không mở bằng `file://`. `dist/` có thể phục vụ trên static hosting, không cần CDN.

| Điều khiển | Hành động |
| --- | --- |
| W A S D | Đi theo hướng camera thực tế |
| Space | Nhảy khi chạm đất |
| Shift | Lướt theo hướng đi, hoặc hướng quay mặt khi đứng yên |
| E | Nạp đom đóm vào đèn chưa sáng gần nhất |
| Q | Tỏa Sáng, tốn 3 đom đóm |
| ← / → hoặc kéo chuột trên cảnh | Xoay camera |
| P / Esc / nút Tạm dừng | Dừng; có Tiếp tục, Chơi lại Đêm, Cài đặt, Về menu |
| R | Chơi lại Đêm hiện tại |

Âm lượng và độ nhạy chuột được lưu bằng localStorage. Âm thanh bắt đầu sau thao tác vào Đêm, theo quy định autoplay của trình duyệt.

## Luật chuẩn

- Chạy 6 m/s; nhảy 7 m/s, trọng lực −20 m/s²; lướt 14 m/s trong 12 tick, hồi 90 tick. Lướt trên không giữ độ cao, không bất tử.
- Mang 10 đom đóm; nhặt trong XZ ≤1 m, chênh cao ≤1,5 m. Mỗi đèn cần 10 con, nạp nhiều lần, bán kính 2 m. Đèn sáng bảo vệ trong 6 m.
- Tỏa Sáng xét cầu 3D bán kính 5 m tại chân Mây +0,8 m, choáng 120 tick, đẩy 4 m trong 15 tick, hồi 180 tick.
- Bóng Mực phát hiện trong 12 m, bỏ đuổi ngoài 18 m; chạy 4 m/s, Đêm 3 là 4,5 m/s. Bị chạm mất một Ngọn Lửa, rơi nửa túi (làm tròn xuống), bất tử 90 tick; đom đóm rơi tồn tại 480 tick và nhặt lại được.
- Ngoài đảo thì rơi; Y <−10 mất một Ngọn Lửa và cả túi, đợi 60 tick rồi về gốc với bất tử 90 tick. Hết máu thua ngay.
- Đêm 2/3 có Gió Lạc cướp tối đa 3 con rồi chạy; Tỏa Sáng lúc nó đang mang đồ để lấy lại. Bùa Gió tăng chạy lên 7,2 m/s và bỏ hồi lướt trong 600 tick, tái xuất sau 2700 tick.
- Bục xanh phóng Mây; cầu tre có thể rơi. Đêm 3 theo dốc lên tầng 1 rồi bục lên tầng 2; gió đến mỗi 30 giây, báo trước 2 giây, đẩy 2 m/s trong 5 giây.
- Mỗi Đêm hồi đầy 3 Ngọn Lửa. Thời lượng 300/330/360 giây, số đèn 5/6/7.

Điểm: **+10 mỗi con nạp** (nhặt không có điểm), +100 mỗi đèn, +5 mỗi Bóng Mực trúng xung. Thắng thêm `floor(giây còn lại)×2 + 50×Ngọn Lửa còn lại`. Tổng chỉ cộng các Đêm đã thắng.

## Headless và kiểm chứng

```sh
npm test
npm run verify
node src/headless.mjs --seed 42 --night 2 --scenario tests/scenarios/phase-2/charm.json --inputs tests/scenarios/phase-2/charm.inputs.json --ticks 180 --out result.jsonl --snapshot-every 10
```

`--night` nhận 1, 2, 3. Không cung cấp scenario/inputs thì dùng màn mặc định/người chơi đứng yên. Mô phỏng cố định 60Hz, không GPU. Input giữ giá trị cũ; jump/interact/pulse/dash/pause kích hoạt cạnh lên. `tick` tăng khi paused, `sim_tick` và mọi logic dừng. JSONL có snapshot tick0, sự kiện `night_start` tick0, snapshot theo chu kỳ và `end` cuối. Tọa độ làm tròn 3 số lẻ. Dữ liệu scenario/inputs sai trả mã2 và stderr; lỗi tham số/I/O khác trả khác0.

**38 test** gồm hồi quy, cơ chế mới, CLI, chuỗi Đêm, lưu cài đặt và phép chiếu A/D theo camera. **23 scenario** dưới [tests/scenarios/phase-2](tests/scenarios/phase-2/) có kết quả mong đợi trong `manifest.json`. `npm run verify` kiểm tra kết quả, so output từng byte hai lượt, đo thời gian headless và lưu [bằng chứng Phase 2](docs/proof/phase-2/verification.json). Bộ kiểm chứng dừng khi test đỏ hoặc sai kỳ vọng. CI Ubuntu dùng cùng lệnh, giữ riêng bằng chứng Phase 1.

Fixture `full-route` đi bộ, nhặt 50 con và nạp cả 5 đèn từ đầu, tắt sinh ngẫu nhiên để cô lập hành vi. Các fixture `win-night*` kiểm tra riêng đèn cuối dựng sẵn, không chứng minh người đã chơi thắng cả ba Đêm mặc định. Các fixture `duration-night*` bảo vệ người chơi bằng đèn dựng sẵn để chạy hết thời lượng và đo headless. Xem [tiêu chí nghiệm thu](docs/spec/phase-2-acceptance.md).

## Hiệu năng và phần cần xác nhận

Chạy đủ 18.000 / 19.800 / 21.600 tick đã đạt ngưỡng headless **<30 giây** trên máy ghi trong `verification.json`. Đây không phải số FPS.

Để đo render thực tế: đang chơi nhấn **P → Đo FPS 1280 × 720**. Game dùng framebuffer 1280×720, pixel ratio1, đo 30 giây rồi tải `phase-2-fps.json`. Giữ cửa sổ phía trước và tiếp tục chơi; lượt có ẩn cửa sổ, tạm dừng hoặc kết thúc màn bị đánh dấu không hợp lệ. Cần FPS trung bình ≥30. Chạy lại trên từng Đêm để kiểm tra cảnh nặng hơn.

**Chưa nghiệm thu trực quan/âm thanh và chưa có số FPS thực tế Phase 2.** Browser access host không khả dụng; công cụ Windows chặn điều khiển do không xác minh chắc URL. Đã kiểm tra build, cú pháp và HTTP, chưa tuyên bố đạt yêu cầu GPU. Phản hồi chơi thử trước đây chỉ áp dụng Phase 1. Chưa xác nhận test ẩn hoặc CI Linux mới; không suy đoán kết quả.

## Sáng tạo của tôi

Biển mây, sao, thông điệp của Ông Đăng, vùng sáng quanh đèn, lá báo gió và âm nhạc thủ tục. Tầng cao chuyển trong suốt khi Mây ở dưới để không che nhân vật tại gốc xuất phát Đêm 3. Chỉ là hiển thị/âm thanh, không thay số liệu hoặc thêm thực thể vào headless. Các output đã được kiểm tra tất định.

## Tài liệu bàn giao

[Ticket-02](docs/spec/ticket_02_phase_2.md) · [Tiêu chí nghiệm thu](docs/spec/phase-2-acceptance.md) · [Giả định, test thay thế và nhật ký AI](docs/notes/phase-2.md) · [AGENTS](AGENTS.md) · [CREDITS](CREDITS.md) · [LICENSE](LICENSE).

[README Phase 1](docs/phase-1-README.md) · [README lab gốc](docs/lab-README.md) · [Hướng dẫn lab](GUIDE.md) · [Nộp bài](SUBMISSION.md). Không sửa các tag đã phát hành. Release v1.0.0/video thuộc Phase 4, không tạo ở Phase 2.
