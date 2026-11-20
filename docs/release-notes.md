Đảo Đèn Lồng v1.0.0 — Contract 1.3, hoàn thiện bốn phase.

- ZIP chứa web build sẵn, Node runner, source/headless/bench/soak và tài liệu. Giải nén, chạy `node scripts/run.mjs`, mở http://127.0.0.1:4173/. Cần Node.js 22+ và WebGL2.
- Bảng điểm top 10 lưu trên đĩa, CLI export, đổi 9 phím có phát hiện trùng, chỉ báo hình ảnh, giảm chuyển động, chữ lớn.
- 64 test và 42 scenario hồi quy; output simulation giữ nguyên hash Phase 3.
- Benchmark máy phát triển: avg 139,8 FPS; 1% low 35,43 FPS; load 4995,88 ms. Soak 10 Đêm không crash, RSS tăng 7,38%. Số đo máy giảng viên có thể khác.
- Web không bảo đảm tắt vsync (`false`), peak RSS browser không khả dụng (`null`). Raw JSON đính kèm; SHA256SUMS xác thực asset.
- demo.mp4 nối video người dùng chơi thực tế với phần bằng chứng test/headless/benchmark; nhãn trên video phân biệt nguồn. Metadata và SHA-256 đính kèm, bản gốc được giữ nguyên.

README, CHANGELOG, CREDITS, LICENSE và retro nằm trong repo/gói ZIP. Giữ nguyên các tag Phase 1–3.
