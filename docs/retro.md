# Retro — Đảo Đèn Lồng qua bốn phase

## Sản phẩm và kết quả

Từ repo chỉ có tài liệu lab, dự án trở thành game web 3D với ba Đêm, cùng một mô phỏng cho giao diện và headless. Phase 1 xây vòng thu thập/thắp đèn; Phase 2 chuẩn hóa số liệu và mở rộng bản đồ; Phase 3 thay luật đèn vĩnh viễn bằng dầu và thắng tại bình minh; Phase 4 thêm đo đạc, lưu điểm, đổi phím và đóng gói. Các tag cũ được giữ để có thể chấm từng giai đoạn, không sửa lịch sử khi phát hiện lỗi sau bàn giao.

| Phase | Điều kiểm chứng được | Bài học |
| --- | --- | --- |
| 1 | 20 test tại tag, 21 sau sửa camera; 6 scenario | Test world-space đúng chưa đủ chứng minh trái/phải trên màn hình đúng. Phản hồi người chơi phát hiện lỗi mà logic thuần bỏ sót. |
| 2 | 38 test, 23 scenario; người dùng xác nhận UI/âm thanh và 143,32 FPS ở Đêm 2 | Phải tách test để cô lập cơ chế: đi qua cầu tự nhặt bùa làm tốc độ tăng đúng luật, không phải bug movement. |
| 3 | 58 test, 42 scenario; người dùng xác nhận các mục hiển thị mới | Thứ tự tick và độ chính xác dầu quyết định đúng/sai ở biên, nhất là tick bình minh. ADR giúp giải thích những test cũ bị thay. |
| 4 | 64 test; 42 output giữ nguyên hash Phase 3; bench và soak thật | Hiệu năng là số đo riêng, không suy ra từ cảm giác chơi mượt hoặc từ tốc độ headless. |

Benchmark chuẩn trên máy thực hiện đạt 139,8 FPS trung bình, 1% low 35,43 FPS, tải cảnh 4995,88 ms. Soak mười Đêm không crash; RSS từ 44,08 lên 47,34 MB, tăng 7,38%. Đây là số tham khảo trên Windows hiện tại, không thay kết quả giảng viên chạy trên máy chung. Bản web không có RSS trình duyệt đáng tin để báo nên peak_mem_mb là null; requestAnimationFrame không bảo đảm tắt vsync nên vsync_off=false, công khai trong README.

## Làm việc với AI: hiệu quả và thất bại

Hiệu quả nhất là đọc contract trước, xác định cách kiểm chứng rồi mới cho AI viết. Logic thuần không nhập Three.js giúp test nhanh, tái lập và giữ được các con số qua nhiều thay đổi. Bằng chứng JSONL kèm input/seed và hash cụ thể đáng tin hơn lời “đã chạy”. Những phần chỉ nhìn/nghe được được hỏi lại người dùng, không dùng unit test để tự nhận đạt mỹ thuật hoặc âm thanh.

AI từng suy luận sai camera: một ánh xạ đúng theo trục tọa độ vẫn đảo trái/phải khi đặt camera ở phía khác. Sửa bằng trục camera thực tế và thêm test chiếu qua PerspectiveCamera ở nhiều góc. AI cũng đếm nhầm một bước dashLeft trong test bùa; đối chiếu chuỗi trạng thái cho thấy kỳ vọng sai, nên sửa test chứ không sửa game theo test sai. Khi test cầu bị tăng tốc, kiểm tra đã phát hiện nguyên nhân là bùa, vì thế cô lập bùa khỏi test cầu và giữ test tích hợp riêng.

Phase 3 có rủi ro lớn hơn: khôi phục tất cả test cũ một cách máy móc sẽ vô tình giữ lại luật thắng sớm và vùng an toàn sai. Cách xử lý là liệt kê luật bị thay, ghi ADR, cập nhật điểm/thời lượng và thêm các tình huống cuối tick. Dầu dùng đơn vị nguyên 1/60, chỉ làm tròn khi xuất; test xác nhận snapshot 30.0 không nhất thiết còn vùng an toàn nếu dầu thật là 29,983.

Ở Phase 4, benchmark đầu có 1% low 28,07 FPS, chưa đạt dù trung bình cao. Bản tối ưu gom actor vào InstancedMesh vẫn vẽ đủ 200 con, không giảm cảnh hoặc bỏ frame chậm; lần đo sau vượt ngưỡng. Soak mặc định không crash nhưng RSS tăng khoảng 33,7%. Thay vì tăng giả baseline, dùng V8 jitless, nursery nhỏ, giới hạn heap và GC sau reset; so sánh đều từ trạng thái đã tải Game, ghi toàn bộ flags và số RSS thật. Chi phí là soak chạy chậm hơn, nhưng không đổi gameplay hay chuỗi ngẫu nhiên.

## Harness, nguồn lực và lần làm tiếp theo

AGENTS hữu ích vì ngắn, chỉ rõ lệnh, contract, thứ tự tick và điều không được làm với bằng chứng. verify/CI là thành phần hiệu quả nhất: lỗi test, sai kỳ vọng, không tất định, đổi hash hồi quy hoặc fail ngưỡng đo sẽ dừng lệnh. Skills Sites và Computer Use cung cấp quy trình triển khai/kiểm tra; CUA Windows từng bị chặn xác minh URL nên đã dừng, không vượt chặn. Benchmark và video dự phòng sau đó được chính ứng dụng chạy trong cửa sổ/profile Chromium riêng qua CLI sản phẩm, không điều khiển hồ sơ trình duyệt người dùng.

Không có số usage/billing chính xác từ phiên. Ước lượng tổng 100.000–200.000 token cho bốn phase, bao gồm đọc tài liệu, code, sửa test, kiểm chứng và ghi chép; đây không phải số đo chi phí. Không có dữ liệu giá/billing để gán một số tiền đáng tin. Tiết kiệm bằng một simulation dùng chung, giữ Three.js hiện tại, dùng lại scenario còn hiệu lực, không tạo asset ảnh/âm thanh bên ngoài và không dùng agent phụ.

Nếu làm lại, kiểm tra quyền dùng trình duyệt ngay từ đầu, dành sẵn một smoke test cho UI và đặt ngân sách thời gian cho benchmark/video trước khi trang trí cảnh. Tách persistence và điều khiển sớm sẽ giảm công nối vào UI cuối buổi. Bàn giao cần giữ cả kết quả chưa đạt ban đầu, giới hạn quan sát và nguồn video rõ ràng; không có bằng chứng thì không ghi hoàn tất chỉ vì code đã tồn tại.
