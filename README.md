# Đảo Đèn Lồng · Phase 1

Game 3D góc nhìn thứ ba, Đêm 1 – Đảo Bến. Điều khiển Mây, gom đom đóm, thắp 5 Đèn Lồng Lớn, né Bóng Mực trước bình minh. Bản web chạy trên Windows/macOS/Linux; headless không cần GPU.

## Cài đặt và chơi

Cần Node.js **22 trở lên**, npm và trình duyệt hỗ trợ WebGL. Trong thư mục repo chạy 3 lệnh:

```sh
npm ci
npm run build
npm start
```

Mở **http://127.0.0.1:4173**, chọn **Bắt đầu hành trình**. `dist/` chứa toàn bộ tài nguyên, không phụ thuộc CDN, có thể phục vụ bằng static hosting. Không mở bằng `file://`.

| Phím | Hành động |
| --- | --- |
| W A S D | Đi theo camera, W đi ra xa camera |
| Space | Nhảy |
| E | Nạp vào đèn chưa sáng gần nhất |
| Q | Tỏa sáng, tốn 2 đom đóm |
| ← / → | Xoay camera |
| P / nút Tạm dừng | Tạm dừng / tiếp tục |
| R | Chơi lại, kể cả sau thắng/thua |

Tự nhặt đom đóm trong 1,5 m, mang tối đa 12 con. Mỗi đèn cần 8 con, có thể nạp nhiều lần trong bán kính 3 m. Đèn sáng tạo vùng an toàn 6 m. Bóng Mực chạm mất một ngọn lửa và `floor(số đang mang × 0,25)` đom đóm (không rơi thành vật nhặt). Bất tử 2 giây sau đòn. Tỏa sáng đẩy Bóng Mực 4 m, choáng 3 giây, hồi 1 giây. Thả và nhấn lại nút để lặp hành động.

Thắp cả 5 đèn thì thắng. Hết 3 ngọn lửa hoặc hết 300 giây thì thua. Mép đảo chặn, không phạt rơi (`fall_enabled: false`). Nhảy không né đòn: khoảng cách gameplay luôn đo trên XZ.

## Điểm số

- +10 mỗi đom đóm; +100 mỗi đèn thắp; +20 mỗi Bóng Mực trúng xung (kể cả đang choáng).
- Khi thắng: thêm `floor(thời gian còn lại) × 2 + ngọn lửa còn lại × 50`.
- Không cộng điểm cho trạng thái dựng sẵn hoặc thưởng khi thua.

## Kiểm thử và headless

```sh
npm test
npm run verify
node src/headless.mjs --seed 42 --night 1 --scenario tests/scenarios/full-route.json --inputs tests/scenarios/full-route.inputs.json --ticks 18000 --out result.jsonl --snapshot-every 10
```

`npm test`: 20 test logic và CLI. `npm run verify`: chạy test, chạy 6 kịch bản mỗi kịch bản hai lần, so từng byte, lưu JSONL, SHA-256 và cấu hình máy vào [docs/proof/phase-1](docs/proof/phase-1/). Lệnh trả lỗi khi kiểm chứng không đạt. CI Ubuntu chạy khi push/PR; chưa xác nhận kết quả CI GitHub.

[game.contract.json](game.contract.json) khai báo Contract v1.0 và tuning khớp runtime (được test). Snapshot tick 0, input giữ giá trị cũ, hành động cạnh lên, 60 tick/giây, JSONL kết thúc bằng `end`. `--night` chỉ nhận `1`. Bỏ `--scenario` để dùng màn thật; bỏ `--inputs` để đứng yên; mặc định snapshot mỗi 10 tick. JSON/dữ liệu scenario/inputs sai trả mã 2 và stderr; lỗi tham số hoặc I/O đầu ra trả mã 1.

Web và headless dùng cùng `src/game.mjs`. Tạm dừng chỉ ở giao diện, không thay đổi contract.

## Bằng chứng Phase 1

| Yêu cầu | Bằng chứng |
| --- | --- |
| Di chuyển, camera-relative, nhảy, bán kính, giới hạn mang | `tests/game.test.mjs`, `docs/proof/phase-1/tests.txt`, `movement.jsonl` |
| Nhặt từ đầu, nạp cả 5 đèn và thắng | `full-route.jsonl`: 40 lượt nhặt, 5 đèn, thắng tick 1427, 1602 điểm |
| Hết máu, bất tử sau đòn | `defeat.jsonl`: thua tick 241, test kiểm tra từng đòn |
| Tỏa sáng, choáng, đẩy, hồi chiêu | `pulse.jsonl` và test riêng |
| Vùng an toàn, bình minh | `survival.jsonl`: 18000 tick đến bình minh |
| Tất định, CLI và mã lỗi | `verification.json`, 6 kịch bản so từng byte, test CLI |
| Cảnh 3D, nón lá, đèn nhỏ, HUD, chơi lại, đảo sáng dần | Có mã `src/view.mjs`; **chưa xác minh bằng mắt** |

Fixture `full-route` tắt sinh ngẫu nhiên và đặt 8 con tại mỗi đèn để kiểm chứng xuyên suốt; không đặt sẵn đèn sáng, không dịch chuyển nhân vật, chỉ dùng input. Fixture `victory` kiểm tra riêng đèn cuối với 4 đèn dựng sẵn. Đây không phải bằng chứng người đã chơi thắng màn mặc định.

**Giới hạn:** build và HTTP tài nguyên đã đạt trên Windows. Công cụ UI dừng vì không xác định chắc URL trên Windows; chưa có ảnh, kiểm tra WebGL thực tế, FPS hoặc người review độc lập. Chưa chạy trực tiếp macOS/Linux; CI Ubuntu đã cấu hình nhưng chưa xác nhận kết quả. Không tuyên bố đã qua bộ test ẩn.

## Sáng tạo của tôi

Đường đá hình ngôi sao dẫn về đèn, biển mây, sao, thông điệp sau khi thắp đèn và vòng sáng vùng an toàn. Đều là hình học trong renderer, không thêm thực thể mô phỏng. Kiểm tra tất định headless vẫn đạt; phần hình ảnh chưa xác minh bằng mắt.

## Tài liệu

- [PRD-0](docs/spec/prd_0_phase_1.md), [giả định, kế hoạch và nhật ký AI](docs/notes/phase-1.md).
- [AGENTS.md](AGENTS.md), [CI](.github/workflows/verify.yml), [CREDITS](CREDITS.md), [LICENSE](LICENSE).
- [README lab ban đầu](docs/lab-README.md), [GUIDE](GUIDE.md), [CHECKPOINTS](CHECKPOINTS.md), [SUBMISSION](SUBMISSION.md), [RULES](RULES.md), [RUBRIC](RUBRIC.md).

Phase 1 dùng tag `phase-1`. Release `v1.0.0` và video là bàn giao cuối Phase 4, chưa tạo trong Phase 1.
