# Phase 3 — Ghi chép thực hiện

## Yêu cầu, kế hoạch và quyết định

Đọc toàn bộ Ticket-03 do người dùng cung cấp, xác định sáu thay đổi cốt lõi trước khi sửa. Kế hoạch: ADR → mô hình dầu và trạng thái đèn/địch → test logic và hồi quy → cập nhật UI/cài đặt → scenario, bằng chứng, changelog và tag.

ADR: [003 — Dầu đèn và thắng tại bình minh](../adr/003-lantern-fuel-and-dawn.md). Logic vẫn dùng chung cho browser và headless. Dầu tính bằng đơn vị nguyên 1/60, không đọc lại số đã làm tròn từ snapshot. Cài đặt bảng màu chỉ đi vào renderer, không ảnh hưởng simulation.

## Quy ước được làm rõ

- Scenario fuel được quy đổi sang số nguyên gần nhất theo đơn vị1/60. Đèn lit thiếu fuel mặc định 100; đèn tắt xuất fuel 0. lit hàm ý ever_lit=true. relit_count ban đầu 0, chỉ tăng khi game thực sự thắp lại.
- Bước2 lấy các shade đang drain có target hợp lệ, trong 2 m và dầu<30 ở đầu bước, trừ đồng thời hao và hút. Event fuel_drain phát theo các mốc sim_tick chia hết60, mỗi con một dòng; giá trị là dầu sau tổng hao/hút. Đèn cạn tắt ngay sau đó.
- Drain mới bắt đầu ở bước8 không hút ngược về bước 2 của cùng tick. Pulse ở bước7 dừng hút từ tick sau; hao/hút của bước 2 đã diễn ra trước đó.
- Wander vẫn phát hiện Mây trong12m theo Phase 2. Chỉ khi còn wander mới chọn đèn yếu; wander đi1 m/s như đã khai báo ở Phase 2. Drain phát hiện Mây trong 6 m như Ticket03. Hết choáng về wander rồi áp dụng AI thường.
- Refuel khôi phục vùng an toàn ở bước6, đẩy ra mép ngay trong 1 tick (≤30), không gây hit trong tick đẩy. Vùng an toàn dùng fuel_units≥1800; snapshot có thể hiển thị30.0 dù dầu thật 29,983, nên không dùng snapshot làm logic.
- Đèn đầy 100 ở snapshot0 có thể hao 1/60 trước bước tương tác đầu tiên, trở thành đèn nhận được và dùng1 con để bù. Test “đèn đầy bị bỏ” kiểm tra tại đúng trạng thái đầy, không bỏ qua thứ tựtick của ticket.
- Bonus bình minh dùng floor dầu thật, không floor số snapshot làm tròn. successful_lights tăng ở bước nạp/thắp; pickup ở bước4 đã qua nên sức chứa mới có hiệu lực cho lượt nhặt từ tick sau.

## Test bị luật mới thay thế

| Kiểm tra Phase 2 | Cập nhật Phase 3 và lý do |
| --- | --- |
| Contract1.1, thời lượng 300/330/360 | Contract1.2,240/270/300; giữ kiểm tra tuning khớp runtime |
| Điểm nạp 10/con, thắp100 | Điểm nạp 5/con, thắp đầu100; partial deposit cập nhật15 và150 điểm |
| Thắng sớm all_lit và thưởng thời gian | Chỉ dawn_survived với ngưỡng 60%; bonus đèn/dầu/máu, không thời gian |
| Full-route thắp5đèn là won | Cùng route50con vẫn playing tại tick1427; có scenario duy trì đến dawn riêng |
| Đèn sáng không nhận thêm | Thêm test refuel, ceil, cap, nearest nhận được và bỏ đèn đầy |
| Mọi đèn sáng đều bảo vệ | Chỉ dầu≥30; thêm test mất/phục hồi an toàn, drain cộng dồn và pulse drain |
| Settings chỉ volume/sensitivity | Thêm colorblind lưu bền; dữ liệu cũ thiếu khóa vẫn mặc định false |

Giữ các test còn hiệu lực: camera yaw/A-D, normalization, input giữ giá trị/cạnh lên, jump/dash, bùa, Gió Lạc, rơi/hồi sinh, drop TTL, spawn, map/cầu/dốc/bục/tháp/gió, pause, CLI mã lỗi và byte-identical. Không skip hoặc tắt test. Bằng chứng Phase 1/2 không sửa; chạy lại test cũ nguyên trạng bằng checkout đúng tag.

## Kết quả và phạm vi bằng chứng

58 test đạt. 42 scenario có kỳ vọng trong manifest, mỗi scenario chạy 2 lần so từng byte và kiểm tra kết quả thật. Trong đó16 scenario kế thừa Phase 2 còn hiệu lực. Fixture maintain-to-dawn đi bộ/nhặt/châm bằng input bình thường, giữ3 đèn đến tick 14400 và thắng với 768 điểm; nó đặt sẵn3 đèn sáng, kho đom đóm và tắt địch để cô lập bảo trì, không chứng minh người đã chơi thắng màn mặc định. Các test drain riêng có địch, các test threshold kiểm tra cả ba Đêm.

Build/cú pháp và HTTP được kiểm tra; log mới lưu `docs/proof/phase-3`. Headless chạy đủ thời lượng mới 14.400/16.200/18.000tick trong ngưỡng 30 s. Không có bộ test ẩn nên không tự xác nhận đạt test ẩn.

Renderer/cài đặt mới cần người dùng chơi thử; đã gửi yêu cầu kiểm tra thanh dầu, nhấp nháy, refuel/relight và chế độ màu. Công cụ CUA trước đó bị chặn xác minh URL Windows; không dùng cách khác để vượt chặn và không gán feedback Phase 2 cho Phase 3. Số FPS Phase 2 giữ là bằng chứng lịch sử; chưa có số FPS Phase 3.

## Harness, token và retro

AGENTS, verify và CI cập nhật Phase 3. Tách lanterns/accessibility để test số nguyên và ánh xạ trình bày mà không cần GPU. Không dùng subagent. Skill Sites/Computer Use đã đọc được giữ theo quy trình repo cục bộ; không đăng một Site riêng.

Không có usage/billing chính xác. Ước lượng thô20.000–40.000token cho Phase 3, không phải số đo. Tiết kiệm bằng kế thừa16 scenario, giữ engine và logic cũ không bị thay, tập trung test biên. Khi chạy bộ cũ,6 test đỏ phản ánh các luật hoặc schema thay thật; cập nhật có lý do, không sửa gameplay để khôi phục luật cũ.

Bài học: thứ tự tick quan trọng hơn giá trị hiển thị; cần test riêng30thật và30.0làmtròn, expiry rồi relight trong cùng tick, refuel trước contact và bonus từ dầu chưa làm tròn. Tài liệu ADR/changelog giúp người chấm hiểu thay đổi thay vì coi regression là lỗi ngẫu nhiên.

Chưa biết mốc giờ Coach nên không khẳng định đúng hạn. Tag phase-3 giữ bàn giao và nêu giới hạn QA; không sửa tag Phase 1/2, chưa làm Release/video của Phase 4.

## Bổ sung xác nhận hiển thị sau bàn giao

Người dùng xác nhận có thanh dầu, nhấp nháy khi dưới30; trong chế độ màu đã bật, bình thường vàng và dầu yếu trắng. Lưu báo cáo tại `docs/proof/phase-3/manual-acceptance.md`. Xác nhận này thay thế ghi chú “chưa có quan sát thanh dầu”, trong đúng phạm vi được báo cáo; không tự nhận đã đo 1 Hz hoặc thử hết các chi tiết màu/refuel/relight. Không sửa gameplay, giữ nguyên tag phase-3 và bổ sung bằng chứng trên main.
