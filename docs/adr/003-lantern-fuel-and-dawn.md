# ADR 003 — Dầu đèn và thắng tại bình minh

## Bối cảnh

Ticket-03 thay luật đèn vĩnh viễn sáng, thắng ngay khi thắp hết và toàn bộ điểm Phase 2. Contract chuyển sang v1.2; các tag cũ và bằng chứng cũ phải giữ nguyên.

## Quyết định

Mỗi đèn có `fuel_units` nguyên, một đơn vị bằng 1/60 nhiên liệu. Dầu tối đa 6000 đơn vị; mỗi tick đang sáng trừ 1, mỗi Bóng Mực hút hợp lệ trừ thêm 5. Logic dùng số nguyên, chỉ làm tròn một chữ số khi xuất `fuel`. `ever_lit` giữ lịch sử, `relit_count` đếm thắp lại; đèn tắt xóa tiến độ nạp nhưng không xóa lịch sử.

Trong bước 2, tính hao và hút từ trạng thái drain của tick trước, trừ đồng thời rồi tắt đèn cạn. Bước tương tác chọn đèn nhận được gần nhất, bao gồm đèn sáng chưa đầy. Bước vùng an toàn chỉ bảo vệ khi dầu thật ≥30; refuel có thể khôi phục vùng an toàn trước pulse và contact. Wander chọn đèn yếu trước đèn tắt; chase giữ luật đuổi người chơi; drain thoát theo các điều kiện của ticket.

Chỉ đánh giá thắng khi thời gian bằng 0, sau tất cả cập nhật. Hết máu ưu tiên trước; còn sống cần ceil(0,6 × tổng đèn) đang sáng. Đèn cuối được nạp đúng tick bình minh vẫn tính. Bonus thắng chỉ tính đèn đang sáng, floor dầu thật và máu; không có thưởng thời gian. Sức chứa tính từ số lần thắp trong Đêm và đặt lại khi tạo Game mới.

## Hệ quả và kiểm chứng

Thay các test thắng sớm, điểm nạp, đèn không nhận thêm và vùng an toàn vô điều kiện; ghi lý do trong ghi chép Phase 3. Giữ test còn hiệu lực về movement, input, dash, rơi, bùa, Gió Lạc, pause và map. Thêm scenario cho hao dầu chính xác, refuel, tắt/thắp lại, drain cộng dồn, biên 30, pulse drain, sức chứa, bình minh và ưu tiên hết máu. Bảng màu dễ phân biệt là cài đặt trình bày, không tác động simulation hoặc output headless.
