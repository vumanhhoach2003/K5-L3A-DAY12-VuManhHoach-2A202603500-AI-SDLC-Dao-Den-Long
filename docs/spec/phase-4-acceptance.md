# Phase 4 — Tiêu chí nghiệm thu

Nguồn: Ticket-04, Contract1.3. Giữ toàn bộ luật Phase1–3 chưa bị thay thế; không sửa tag cũ.

| Hạng mục | Tiêu chí và bằng chứng |
| --- | --- |
| Benchmark CLI | `node scripts/bench.mjs --seed 42 --duration 30 --out bench.json`; profile Chromium riêng, framebuffer1280×720,200 wander/100 motes/3 đèn100 dầu, không input/spawn/hit/pickup/fuel/end; camera30m/Y15/15s một vòng. Kiểm tra bất biến bằng unit test và chạy render thật. |
| Số đo benchmark | warmup3s, đo đúng30000ms; avg139,8≥60, p1low35,43≥30, load4995,88ms≤10000; p95≈7,1ms. Vsync=false, RSSweb=null được công khai. bench.json gốc và bản sao ở proof. |
| Soak | 10 Đêm1→2→3, seed7…16, hướng mỗi30tick và các xác suất chuẩn; cùng tiến trình,0crash, RSS44,08→47,34MB (7,38%≤20%), rawsoak.json có flags và kết quả. |
| Bảng điểm | Tên3–12[A-Za-z0-9_], metadata đủ, top10, score giảm/thời điểm tăng; ghi đĩa sau thua hoặc Bình Minh, menu và exportCLI. Unit/API/disk-reload/CLI test đạt; UI fixture kiểm tra save và hiển thị. |
| Đổi phím | 9 hành động, trùng bị từ chối, reset mặc định, lưu và hints cập nhật. Unit và DOM smoke đạt. |
| Chỉ báo hình ảnh | Spawn Bóng Mực có chữ+mũi tên mép, gió báo trước, đèn yếu,10giây cuối. DOM smoke có fixture riêng, không nhận fixture là một lần thắng gameplay. |
| Giảm chuyển động | Lưu setting, bỏ camera easing và các hiệu ứng trang trí; không có shake/fullscreenflash ở renderer; tắt pulse mở rộng và lá bay khi bật. Logic và cảnh benchmark không đổi. |
| Chữ | CSS tối thiểu18px, lớn×1,25. DOM smoke kiểm tra computed styles; viewport headless thực tế1262×574 được ghi rõ, không giả là1280×720. Render benchmark thật có framebuffer1280×720. |
| Regression | 64 test;42 scenario byte-identical hai lượt và hash bằng Phase3. Không biết test ẩn nên không tự nhận đã qua tất cả test ẩn. |
| Cài sạch | check-clean.mjs xuất commit/tree nguồn, cài/build/start bằng3 lệnh và chạy verify trong thư mục mới. clean-checkout.json chứa kết quả thật. |
| Tài liệu | README có ảnh/video, hệ thống, điều khiển, test/headless/bench/soak; changelog4phase, retro, credits/license, harness và ghi chép. |
| Video | Đã nhận video người dùng chơi thực tế 191,27s,1280×720; hash và khung mẫu tại docs/demo/manual. MP4 bàn giao nối gameplay này với phần bằng chứng đo thật, có nhãn nguồn. Metadata bản tổng hợp tại docs/demo/release. |
| Release | Gói web chạy sẵn có Node runner, source và dữ liệu đo; tagphase-4 và releasev1.0.0 chỉ tạo khi bàn giao được chuẩn bị. Trạng thái thực tế kiểm tra bằng Git/Release khi hoàn tất, không suy ra từ tên file. |

Các giới hạn: số đo hiệu năng chỉ tham khảo trên máy hiện tại; máy giảng viên sẽ quyết định. DOM smoke không chứng minh toàn bộ bố cục ở mọi viewport, âm thanh ở mọi thiết bị hay trải nghiệm người chơi. Phản hồi Phase3 đầy đủ được người dùng xác nhận trong hội thoại, không dùng thay xác nhận các UI mới của Phase4.

