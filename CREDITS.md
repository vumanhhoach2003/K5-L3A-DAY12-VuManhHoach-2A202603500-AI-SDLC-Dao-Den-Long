# Nguồn và ghi công

- Đảo Đèn Lồng, Mây, Bóng Mực và đề bài: bản gốc lab Day 12 AI SDLC của giảng viên. Giấy phép MIT mã mới không áp dụng lại cho tài liệu lab.
- Three.js **0.181.2**: https://github.com/mrdoob/three.js — tác giả Three.js, MIT; LICENSE sao vào `dist/vendor/THREE-LICENSE.txt` khi build, không sửa mã thư viện.
- Mã game, hình học, màu sắc, bố cục và hiệu ứng tạo trong repo với **OpenAI Codex**. Nón lá, đèn, cây, đá, sao, mây là hình học thủ tục. Không tải model, texture, font, nhạc hoặc dùng ImageGen. Font hệ thống.
- Phase 2: nhạc nền, âm báo gió và toàn bộ hiệu ứng được tổng hợp bằng Web Audio trong `src/audio.mjs`, giai điệu thủ tục nguyên gốc; không lấy âm thanh/nhạc bên ngoài. Bản đồ theo Ticket-02 của lab. Bảng màu chuẩn trong `src/palette.mjs`.
- Phase 3: luật dầu/drain theo Ticket-03; thanh dầu và vết rách giấy là hình học tạo trong mã với Codex. Chế độ màu dễ phân biệt theo bảng màu của ticket, không dùng asset bên ngoài.
- Skill quy trình: Sites và Computer Use của OpenAI. UI bị chặn trước khi xác minh game, chưa có bằng chứng hình ảnh.
