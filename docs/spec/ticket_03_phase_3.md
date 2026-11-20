# TICKET-03 — CHANGE REQUEST "Đèn cạn dầu" (Phase 3)

* **Loại:** Change Request — thay đổi luật cốt lõi

* **Ưu tiên:** Rất cao

* **Tag nộp:** `phase-3`

* **Contract:** `v1.2`

## Vì sao thay đổi

Playtest cho thấy người chơi giỏi thắp hết đèn trong $2$ phút rồi game kết thúc, thiếu căng thẳng ở cuối Đêm. Nhà thiết kế quyết định: đèn thắp rồi vẫn có thể tắt, mục tiêu chuyển từ *"thắp hết"* sang *"giữ đảo sáng tới bình minh"*.

> **Cảnh báo:** Ticket này thay thế một số luật đã có. Những luật cũ bị thay được đánh dấu `[THAY THẾ]`. Bạn phải ghi lại quyết định thiết kế (ví dụ một ADR ngắn) và cập nhật test của mình.

**Về sáng tạo:** Phần sáng tạo của bạn từ các phase trước vẫn được giữ và vẫn được thêm ý riêng (kể cả nhân vật, kẻ địch mới), miễn là luật, số liệu và Test Contract dưới đây không bị đổi và đầu ra headless không đổi. Ý sáng tạo nào xung đột với luật mới thì phải điều chỉnh theo luật mới.

## 1. Nhiên liệu đèn — `[THAY THẾ]` luật *"đèn đã sáng không nhận thêm đom đóm"*

| Quy tắc | Giá trị | 
| ----- | ----- | 
| **Nhiên liệu tối đa** | $100$ | 
| **Khi vừa thắp (lần đầu hoặc thắp lại)** | $\text{fuel} = 100$ | 
| **Hao hụt khi đang sáng** | $1.0\text{ đơn vị/giây}$ (tính theo tick: $\frac{1}{60}$ mỗi tick) | 
| **Châm dầu** | Bấm Tương tác ở đèn đang sáng: $\text{used} = \min\left(\text{đang mang}, \left\lceil \frac{100 - \text{fuel}}{10} \right\rceil\right)$, $\text{fuel} = \min(100, \text{fuel} + 10 \times \text{used})$, trừ $\text{used}$ đom đóm. Đèn đầy dầu ($\text{used} = 0$) không được chọn khi tương tác, không phát sự kiện, không cộng điểm | 
| **Chọn đèn khi tương tác** | Chỉ xét đèn nhận được (chưa sáng, hoặc sáng nhưng chưa đầy dầu); gần nhất, bằng nhau thì `id` nhỏ hơn | 
| **Độ chính xác** | Nên tính dầu theo đơn vị nguyên $\frac{1}{60}$ để không bị sai số số thực; chỉ làm tròn khi xuất ra | 
| **Hết dầu ($\text{fuel} \le 0$)** | Đèn chuyển sang tắt, $\text{deposited} = 0$, phát sự kiện `lantern_out`, ánh sáng môi trường giảm theo. Đèn nhớ `ever_lit = true` | 
| **Thắp lại** | Đèn đã từng sáng (`ever_lit`) chỉ cần $5$ đom đóm; đèn chưa từng sáng vẫn cần $10$ | 
| **Hiển thị** | Thanh dầu trên đèn đang sáng; khi $\text{fuel} < 30$ thì đèn và thanh dầu nhấp nháy chậm ($1\text{ Hz}$) | 

## 2. Bóng Mực hút dầu — `[THAY THẾ]` luật *"Bóng Mực không bao giờ vào vùng an toàn"*

* Đèn có $\text{fuel} < 30$ mất vùng an toàn. Đúng $30$ thì vẫn còn vùng an toàn.

* Chỉ Bóng Mực ở trạng thái `wander` mới chọn đèn yếu: đi tới đèn sáng có $\text{fuel} < 30$ gần nhất (bằng nhau thì `id` nhỏ hơn). Không có thì đi về đèn tắt gần nhất như trước. Bóng đang `chase` không đổi mục tiêu.

* Khi cách đèn đó $\le 2\text{ m}$ ($XZ$): chuyển sang trạng thái mới `drain`, đứng yên và hút $5\text{ fuel/giây}$ liên tục ($\frac{5}{60}$ mỗi tick). Nhiều con thì cộng dồn. Đèn vẫn tự hao $1\text{/giây}$.

* Từ `drain`: sang `chase` nếu Mây vào trong $6\text{ m}$; sang `stunned` nếu trúng Tỏa Sáng; sang `wander` nếu đèn tắt, nếu $\text{fuel}$ được châm lên $\ge 30$, hoặc nếu cách đèn $> 2\text{ m}$.

* Hết choáng thì về `wander`.

* Khi đèn được châm dầu lên $\ge 30$ lúc có Bóng Mực trong vùng $6\text{ m}$, các con đó bị đẩy ra mép vùng trong tối đa $30\text{ tick}$ và không gây sát thương trong lúc đó (giống khi đèn vừa thắp).

## 3. Luật thắng mới — `[THAY THẾ]` *"thắng ngay khi tất cả đèn sáng"*

| Quy tắc | Giá trị mới | 
| ----- | ----- | 
| **Thời gian Đêm 1 / 2 / 3** | $240$ / $270$ / $300\text{ s}$ | 
| **Thắng** | Mây còn sống khi hết giờ (bình minh) và số đèn đang sáng tại tick cuối $\ge \lceil 0.6 \times \text{tổng đèn} \rceil$: Đêm 1 cần $3/5$, Đêm 2 cần $4/6$, Đêm 3 cần $5/7$ | 
| **Không còn thắng sớm** | Thắp đủ đèn không kết thúc Đêm | 
| **Thua** | Hết Ngọn Lửa (ngay lập tức, kể cả ở tick cuối) · hoặc hết giờ mà số đèn sáng dưới ngưỡng | 
| **Lý do kết thúc** | Thắng: `dawn_survived` · Thua: `dawn` hoặc `no_flames` | 
| **Thứ tự trong tick** | Theo thứ tự xử lý của Ticket-02, bổ sung: ở bước 2 trừ dầu (hao + bị hút); ngay sau bước 2, đèn có $\text{fuel} \le 0$ tắt. Bước *"xét thắng/thua"* diễn ra sau mọi cập nhật của tick, kể cả tick bình minh: hết Ngọn Lửa luôn thua `no_flames` trước | 

## 4. Sức chứa tăng dần (mới)

$$\text{Sức chứa} = \min\left(20, \, 10 + 2 \times \text{successful\_lights}\right)$$

* `successful_lights` $=$ số lần thắp thành công trong Đêm (tính cả thắp lại; đèn đặt sẵn bằng scenario không tính).

* Đặt lại về $0$ ở đầu mỗi Đêm.

* HUD hiển thị `đang mang / sức chứa`.

## 5. Điểm mới — `[THAY THẾ]` toàn bộ công thức điểm cũ

| Sự kiện | Điểm | 
| ----- | ----- | 
| Mỗi đom đóm nạp vào đèn (thắp mới, thắp lại hoặc châm dầu) | $+5$ | 
| Thắp lần đầu | $+100$ | 
| Thắp lại | $+40$ | 
| Bóng Mực trúng Tỏa Sáng | Tổng $+5$ mỗi con; tổng $+15$ nếu ngay trước đó nó đang `drain` | 
| Bình minh (chỉ khi thắng): mỗi đèn đang sáng | $+50 + \lfloor \text{fuel} \rfloor$ | 
| Bình minh (chỉ khi thắng): mỗi Ngọn Lửa còn lại | $+50$ | 
| Thưởng thời gian | Bỏ | 

* **Tổng điểm game, chơi lại:** Không đổi so với Ticket-02.

## 6. Chế độ mù màu (mới)

Thêm cài đặt *"Bảng màu dễ phân biệt"* (được lưu):

* Viền và mắt Bóng Mực đổi từ `#7A3CFF` sang `#00B3FF`.

* Màu cảnh báo UI đổi từ `#FF5A5F` sang `#FFFFFF`, kèm biểu tượng `⚠`.

* Đèn tắt và đèn sáng phải phân biệt được không cần màu: đèn tắt bị xẹp $20\%$ và giấy có vết rách; đèn sắp hết dầu nhấp nháy.

## 7. Test Contract v1.2 (thay đổi)

* `contract_version`: `"1.2"`. `tuning` thêm `fuel_max: 100`, `fuel_decay_per_s: 1.0`, `fuel_per_mote: 10`, `relight_cost: 5`, `win_ratio: 0.6`, `drain_per_s: 5`, `low_fuel_threshold: 30`, `capacity_max: 20`; `night1_duration_s = 240`, `night2_duration_s = 270`, `night3_duration_s = 300`.

* **Snapshot:** Mỗi đèn thêm `fuel` (số thực, $1$ chữ số thập phân; đèn tắt có `fuel: 0`), `ever_lit` và `relit_count`; `player` thêm `capacity`. Bóng Mực có thêm trạng thái `drain`.

* **Scenario:** Mỗi đèn được đặt `lit`, `fuel`, `ever_lit`; `player` thêm `successful_lights`; `shades[]` thêm `target_lantern_id`. Đèn đặt `lit: true` mà không có `fuel` thì mặc định `fuel: 100`.

* **Sự kiện mới:**

  * `refuel`: `{"lantern_id": ..., "amount": ..., "fuel": ...}`

  * `lantern_out`: `{"lantern_id": ...}`

  * `fuel_drain`: `{"lantern_id": ..., "shade_id": ..., "fuel": ...}` (ghi mỗi $60$ tick khi đang hút)

  * `lantern_lit` thêm `relight: true|false`

  * `game_over.reason` có thêm `dawn_survived`; `all_lit` không còn dùng.

## Định nghĩa hoàn thành (DoD)

* Có bằng chứng game chạy đúng các yêu cầu của phase (định dạng tự chọn).

* Có ít nhất 1 ghi chú quyết định thiết kế (ADR hoặc tương đương, tên và vị trí tự chọn) mô tả cách bạn thay đổi mô hình trạng thái đèn và luật thắng.

* Test cũ bị luật mới làm sai phải được cập nhật hoặc xóa có ghi lý do, không được bỏ qua (skip) âm thầm.

* Có changelog (tên và vị trí tự chọn) liệt kê các thay đổi phá vỡ tương thích (breaking changes) của Phase 3.

* Mọi test ẩn Phase 1–2 không bị thay thế vẫn đạt.