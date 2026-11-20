# Nguồn và ghi công

- Đảo Đèn Lồng, Mây, Bóng Mực và đề bài: bản gốc lab Day 12 AI SDLC của giảng viên. Giấy phép MIT mã mới không áp dụng lại cho tài liệu lab.
- Three.js **0.181.2**: https://github.com/mrdoob/three.js — tác giả Three.js, MIT; LICENSE sao vào `dist/vendor/THREE-LICENSE.txt` khi build, không sửa mã thư viện.
- Mã game, hình học, màu sắc, bố cục và hiệu ứng tạo trong repo với **OpenAI Codex**. Nón lá, đèn, cây, đá, sao, mây là hình học thủ tục. Không tải model, texture, font, nhạc hoặc dùng ImageGen. Font hệ thống.
- Phase 2: nhạc nền, âm báo gió và toàn bộ hiệu ứng được tổng hợp bằng Web Audio trong `src/audio.mjs`, giai điệu thủ tục nguyên gốc; không lấy âm thanh/nhạc bên ngoài. Bản đồ theo Ticket-02 của lab. Bảng màu chuẩn trong `src/palette.mjs`.
- Phase 3: luật dầu/drain theo Ticket-03; thanh dầu và vết rách giấy là hình học tạo trong mã với Codex. Chế độ màu dễ phân biệt theo bảng màu của ticket, không dùng asset bên ngoài.
- Phase 4: benchmark, soak, persistence, keybindings, tối ưu instancing và công cụ đóng gói có hỗ trợ OpenAI Codex. Ảnh PNG là khung render thật từ ứng dụng. `demo-auto.mp4` quay runtime bằng Canvas captureStream/MediaRecorder, input tự động được ghi rõ; số liệu đọc từ báo cáo thật. Video người dùng chơi thực tế dài 191,266667 giây, 1280×720; hash và khung mẫu tại `docs/demo/manual/`. Giữ nguyên bản gốc; video Release nối bản này với phần bằng chứng từ giây 35 của bản tự động, có nhãn nguồn.
- Skill quy trình: Sites và Computer Use của OpenAI. CUA từng bị chặn xác minh URL ở phase trước; Phase 4 có bằng chứng từ CLI của ứng dụng trong profile riêng và video chơi thực tế do người dùng cung cấp.
