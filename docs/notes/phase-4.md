# Phase 4 — Ghi chép

## Kế hoạch và thiết kế

Đọc Ticket-04 trước khi sửa. Tách việc thành benchmark/soak đo thật, bảng điểm trên đĩa, accessibility, kiểm tra sạch và phát hành. Giữ nguyên gameplay; chế độ benchmark dùng cùng logic wander nhưng khóa phát hiện/chase, không gọi các bước pickup/hit/spawn/fuel/end. Các bất biến có unit test. Scene chuẩn tắt các hiệu ứng sáng tạo ngoài chuẩn, vẽ đủ200actor bằng InstancedMesh thay vì giảm số lượng để đạt FPS.

Benchmark mở profile Chromium mới, chỉ đọc/ghi ứng dụng localhost của chính nó. Không dùng hồ sơ người dùng, không điều khiển tab có tài khoản hoặc vượt chặn CUA cũ. Peak RSS trình duyệt không đo đúng từ web nên null; rAF không cho bảo đảm tắt vsync nên false. Quantile95 dùng nearest-rank;1%low lấy ceil(0,01N) frame chậm nhất; không cắt outlier. Khoảng đo được chốt đúng30.000ms sau warmup3s.

Bảng điểm normalrun dùng data/leaderboard.json, ghi atomic và không commit. Static hosting dùng localStorage và export bằng nút; CLI export dùng file của Node runner. Tên bị giới hạn đúng bộ ký tự, điểm tổng chỉ các Đêm thắng. Tạm dừng/đổi phím xử lý phím thật, rồi chuyển về input chuẩn nên không đổi Contract. Test fixture dùng thư mục dữ liệu và profile tạm, không chèn điểm giả vào dữ liệu người chơi.

## Kiểm chứng và vấn đề đã xử lý

-64 test và42 scenario giữ nguyên từng hash Phase3. CI kiểm tra logic và các báo cáo đo đã commit; không tự coi CI là GPU benchmark mới.
- Benchmark đầu: avg138,33 nhưng1%low28,07, chưa đạt. Lưu bench-initial.json. Sau tối ưu instancing, lần đo thật đạt139,8/35,43 FPS, load4995,88ms. Cửa sổ bù chrome bên ngoài để viewport và framebuffer đều1280×720; script ghi kích thước thực tế, không đo ở độ phân giải thấp rồi đổi nhãn.
- Soak đầu không crash nhưng RSS37,46→50,08MB, vượt20%. Không tăng giả baseline hoặc bỏ Đêm. Cấu hình jitless/nursery1MB/oldheap64MB và GC sau reset giảm bộ nhớ; lượt cuối44,08→47,34MB,0crash,10kết quả. Baseline sau tải Đêm đầu; điểm cuối sau giải phóng Đêm cuối và tải Game mới, flags ghi nguyên trong JSON.
- UI DOM smoke17mục: cấu hình headless Windows bị giới hạn viewport1262×574 dù yêu cầu cửa sổ1280×720. Ghi kích thước thực thay vì báo sai; kiểm tra minfont18, scale1,25, lưu setting/key conflict/reset, score submit/persist/display và4cues. Đây không phải FPS hoặc bằng chứng bố cục toàn bộ màn hình chuẩn.
- Self-test chỉ bật khi server chuyên dụng trả config, tránh người chơi vô tình chèn fixture vào leaderboard thật. Test phímR khi nhập tên để không kích hoạt replay.
- Checkout sạch cài dependency, build, start và verify thành công; source commit/tree nằm trong clean-checkout.json. Không sử dụng node_modules/dist của workspace để giả làm cài sạch.
- Đã thêm giải phóng các instance buffers khi đổi Đêm và giảm chuyển động không làm thay luật hoặc nhiên liệu.

## Demo và bàn giao

Ảnh là PNG từ renderer thật. Video tự động dự phòng quay runtime bằng MediaRecorder MP4: gameplay dùng bot gửi input thật, tiếp theo cảnh chuẩn và các số đọc từ bench/soak/verification đã chạy. Metadata ghi rõ nguồn. Sau đó đã nhận video thủ công của người dùng, ưu tiên dùng trong Release (xem mục bổ sung bên dưới). Không gọi bot là thao tác của người dùng, không nhận số đo cũ làm kết quả của khung hình video.

Tài liệu nguồn, ADR, changelog bốn phase, retro, harness, license/credits và các báo cáo giữ trong repo. Package loại dữ liệu người chơi, hồ sơ browser, token và media lớn khỏi zip runtime; video đính kèm Release riêng. Không in hoặc ghi credential khi gọi GitHub API; dùng xác thực GitHub hiện có chỉ cho repo origin được yêu cầu.

## AI, token và giới hạn

Codex thực hiện, không dùng subagent. AGENTS và verify/CI giúp chặn kết thúc khi test đỏ; đo GPU/soak chỉ chạy lại khi có thay đổi hoặc thất bại cần xử lý. Ước lượng Phase4 khoảng30.000–60.000token, không có usage/billing chính xác; tổng ước tính và bài học trong retro. Không gán chi phí tiền khi không có dữ liệu.

Không biết mốc giờ Coach, không tự xác nhận đúng hạn hoặc kết quả test ẩn. Hiệu năng được đo ở máy hiện tại, không bảo đảm cho mọi GPU/máy chấm. UI mới có kiểm tra DOM, vẫn cần người dùng đánh giá cảm giác và bố cục khi chơi. Không sửa tag đã phát hành.

## Video người dùng bổ sung

Đã nhận demo.mp4 từ người dùng. Browser giải mã: 191,266667 giây, 1280×720, 144.558.712 byte; SHA-256 af51e4e180cd81db1d7e51a6f1049014d2ce8efe0e73e1923607c1261b30875a. Khung mẫu cho thấy chơi, châm dầu, thua/lưu điểm. Bản gốc giữ nguyên ngoài repo; metadata/ảnh được lưu. Release nối gameplay này với đoạn bằng chứng từ giây 35 của demo-auto, có nhãn nguồn.

Trong kiểm tra đóng gói, Node --test tự tìm module browser tên ui-self-test.mjs và báo lỗi môi trường DOM. Đổi tên thành ui-smoke-view.mjs để không bị nhận nhầm là test Node; không loại bỏ test mô phỏng. Build và verify sau đó đạt 64/64. PowerShell chặn npm.ps1; README hướng dẫn dùng npm.cmd, không yêu cầu đổi chính sách hệ thống.

Video bàn giao giải mã thành công: 235,248233 giây, 1280×720, 40.808.105 byte; SHA-256 cef36b7b71ee0f26608eda04adee1c8fc2bc22ee0785d30eb199d8af56d3d119. Khung cuối có bằng chứng test/headless/soak/bench; nhãn tiếng Việt đã kiểm tra bằng ảnh decode. Bản xuất thử đầu có nhãn sai encoding, được sửa bằng meta charset UTF-8 và xuất lại; không dùng bản lỗi.

Checkout sạch của commit 7f0eefd đã npm ci/build/start/verify thành công trong 33,90 giây. Các thay đổi sau đó chỉ là tài liệu, metadata video và helper kiểm tra video; src gameplay giữ cùng tree b15f9952a05aa3e4a499b8c2c8831d65b04c6532. Gói phát hành được build tiếp từ Git archive sạch của commit gắn tag; manifest ghi commit và SHA-256 từng file.
