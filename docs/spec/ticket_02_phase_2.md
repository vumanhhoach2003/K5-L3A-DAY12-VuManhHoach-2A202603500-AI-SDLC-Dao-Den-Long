# TICKET-02 — "Ba hòn đảo" (Phase 2)

* **Loại:** Feature + chuẩn hóa

* **Ưu tiên:** Cao

* **Tag nộp:** `phase-2`

* **Contract:** `v1.1`

## Bối cảnh

Đêm 1 đã chạy được. Nhà sản xuất chơi thử bản của các bạn và thấy mỗi bản cho cảm giác điều khiển rất khác nhau. Ticket này có hai việc: (1) đồng bộ số liệu chuẩn để mọi bản cho cảm giác giống nhau, và (2) mở rộng game thành 3 Đêm cùng các tính năng mới.

**Về sáng tạo:** Những gì bạn đã sáng tạo thêm ở Phase 1 vẫn được giữ và bạn vẫn được thêm ý riêng, kể cả nhân vật mới và kẻ địch mới (ngoài Bóng Mực và Gió Lạc), miễn là số liệu chuẩn, bản đồ chuẩn và Test Contract dưới đây không bị đổi và phần thêm không làm đổi đầu ra headless (ví dụ tắt khi chạy headless).

---

## Phần 1 — Số liệu chuẩn (bắt buộc, thay mọi giá trị bạn tự chọn)

Logic chạy **60 tick/giây**. Đơn vị: **mét, giây**. Trục $Y$ hướng lên.

| Nhóm | Hằng số | Giá trị |
| ----- | ----- | ----- |
| **Di chuyển** | Tốc độ chạy | $6.0\text{ m/s}$; tăng tốc/dừng trong $\le 0.1\text{ s}$; điều khiển trên không đầy đủ |
| **Nhảy** | Vận tốc / trọng lực / điều kiện | Vận tốc $7.0\text{ m/s}$, trọng lực $-20\text{ m/s}^2$, chỉ nhảy khi chạm đất |
| **Lướt (mới)** | Tốc độ / thời gian / hồi chiêu | $14\text{ m/s}$ / $0.2\text{ s}$ / $1.5\text{ s}$ (tính từ lúc bắt đầu lướt) |
| **Lướt (mới)** | Hướng & quy tắc | Hướng đang di chuyển; nếu đứng yên thì hướng nhân vật đang quay mặt. Lướt trên không giữ nguyên độ cao. Không bất tử khi lướt |
| **Đom đóm** | Sức chứa | $10$ |
| **Đom đóm** | Nhặt | Tự động khi khoảng cách $XZ \le 1.0\text{ m}$ và chênh cao giữa chân Mây và mặt đất nơi đặt đom đóm $\le 1.5\text{ m}$ |
| **Đom đóm** | Số lượng & sinh | $20$ lúc bắt đầu tại $20$ điểm khác nhau; trần $30$; tại các tick $240, 480, \dots$ sinh thêm $1$ ở một điểm trống nếu dưới $30$; hết điểm trống thì bỏ lượt |
| **Đèn lồng** | Chi phí thắp | $10$ đom đóm, nạp nhiều lần được, đèn nhớ tiến độ |
| **Đèn lồng** | Tương tác | Trong bán kính $2.0\text{ m}$; mỗi lần bấm nạp $\min(\text{đang mang}, \text{còn thiếu})$ vào một đèn. Chỉ xét đèn chưa sáng; chọn đèn gần nhất, bằng nhau thì `id` nhỏ hơn |
| **Vùng an toàn** | Bán kính & quy tắc | Đèn đã sáng tạo vùng bán kính $6\text{ m}$: Bóng Mực ở ngoài bị chặn ở mép $6\text{ m}$. Bóng đang ở trong lúc đèn vừa thắp bị đẩy ra mép trong tối đa $30\text{ tick}$ và không gây sát thương trong lúc đó |
| **Tỏa Sáng** | Chi phí / bán kính / hồi chiêu | $3$ đom đóm / $5\text{ m}$ / $3\text{ s}$ |
| **Tỏa Sáng** | Hiệu ứng | Tâm $=$ chân Mây $+ 0.8\text{ m}$. Mục tiêu chốt ngay tick kích hoạt (khoảng cách 3D tới tâm Bóng Mực $\le 5\text{ m}$). Bóng Mực choáng $120\text{ tick}$, trong $15\text{ tick}$ đầu bị đẩy lùi tổng $4\text{ m}$ theo phương ngang (dừng nếu gặp vật cản; trùng vị trí thì đẩy theo $+X$). Pulse lại làm mới choáng và đẩy lùi. Không chết. Không đủ $3$ đom đóm thì không kích hoạt |
| **Bóng Mực** | Tốc độ | $4.0\text{ m/s}$ (Đêm 3: $4.5\text{ m/s}$) |
| **Bóng Mực** | Phát hiện / bỏ đuổi | $12\text{ m}$ / $18\text{ m}$ |
| **Bóng Mực** | Chạm | Khoảng cách $XZ \le 1.0\text{ m}$ và chênh cao $\le 1.5\text{ m}$. Tối đa $1$ lần mất Ngọn Lửa mỗi tick. Bóng gây hit lùi $2\text{ m}$ trong $60\text{ tick}$ (recoil); bóng chạm lúc Mây bất tử không làm gì |
| **Bóng Mực** | Lịch sinh | $2$ con tại tick $300$, sau đó $1$ con mỗi khoảng sinh (tick $300 + 480k$ ở Đêm 1); hết điểm hợp lệ thì bỏ lượt. Id `S1`, `S2`, … theo thứ tự sinh |
| **Bị đánh** | Hậu quả | $-1$ Ngọn Lửa; rơi $\lfloor \text{đang mang} / 2 \rfloor$ đom đóm ra vành $1.5\text{–}2.5\text{ m}$ quanh Mây (tồn tại $480\text{ tick}$, nhặt lại được từ tick sau); bất tử $90\text{ tick}$ |
| **Rơi khỏi đảo** | Điều kiện & hậu quả ($Y < -10$) | Xảy ra đúng $1$ lần, bỏ qua bất tử: $-1$ Ngọn Lửa, mất toàn bộ đom đóm. Chờ $60\text{ tick}$ (không nhặt, không bị chạm), rồi hồi sinh ở điểm xuất phát, vận tốc $0$, bất tử $90\text{ tick}$. Hết Ngọn Lửa thì thua ngay, không hồi sinh |
| **Máu** | Ngọn Lửa | $3$, hồi đầy đầu mỗi Đêm |
| **Thời gian** | Đêm 1 / 2 / 3 | $300$ / $330$ / $360\text{ s}$ |
| **Thắng / thua** | Điều kiện xét sau mỗi tick | Hết Ngọn Lửa $\rightarrow$ luôn thua (`no_flames`); còn sống và tất cả đèn sáng $\rightarrow$ thắng (kể cả đúng tick hết giờ); còn lại mà hết giờ $\rightarrow$ thua (`dawn`) |

### Điểm (chuẩn hóa)

* $+10$ mỗi đom đóm nạp
* $+100$ mỗi đèn thắp
* $+5$ mỗi Bóng Mực trúng Tỏa Sáng (mỗi con mỗi lần, kể cả con đang choáng)
* Khi thắng: $+\lfloor \text{giây còn lại} \rfloor \times 2 + 50 \times \text{Ngọn Lửa còn lại}$
* **Tổng điểm game:** Tổng điểm các Đêm đã thắng.

### Thứ tự xử lý trong một tick (bắt buộc)

1. Đọc input (xử lý `pause` trước; nếu vừa tạm dừng thì dừng bước ở đây).
2. Giảm các bộ đếm: thời gian, hồi chiêu, bất tử, choáng, bùa, TTL đom đóm rơi, hồi bùa.
3. Di chuyển Mây (nhảy, lướt, bục nhảy, gió) rồi kiểm tra rơi khỏi đảo.
4. Nhặt đom đóm và bùa.
5. Tương tác với đèn.
6. Cập nhật vùng an toàn.
7. Tỏa Sáng.
8. Di chuyển Bóng Mực và Gió Lạc.
9. Chạm: Gió Lạc cướp trước, rồi Bóng Mực gây hit (xét theo `id` tăng dần).
10. Sinh đom đóm, Bóng Mực, Gió Lạc theo lịch (thực thể mới chỉ tương tác được từ tick sau).
11. Xét thắng/thua.
12. Ghi snapshot nếu tới lượt.

> **Khi đang tạm dừng:** `tick` vẫn tăng nhưng `sim_tick`, thời gian, hồi chiêu, spawn, TTL đều đứng yên; snapshot ghi `state: "paused"`.

---

## Phần 2 — Bản đồ chuẩn

Góc đo từ trục $+X$, ngược chiều kim đồng hồ khi nhìn từ trên xuống, trên mặt phẳng $XZ$.

### Đêm 1 — Đảo Bến (chuẩn hóa lại)

* Đảo tròn tâm $(0,0,0)$, bán kính $40\text{ m}$. Ngoài $40\text{ m}$ là biển mây (rơi).
* Xuất phát $(0,0,0)$, quay mặt về $+Z$.
* **Đèn:** `L1` $(0,0,25)$ · `L2` $(23.8,0,7.7)$ · `L3` $(14.7,0,-20.2)$ · `L4` $(-14.7,0,-20.2)$ · `L5` $(-23.8,0,7.7)$.
* **Điểm sinh đom đóm:** $8$ điểm trên bán kính $12\text{ m}$ (mỗi $45^\circ$) và $16$ điểm trên bán kính $33\text{ m}$ (mỗi $22.5^\circ$).
* **Bóng Mực:** Sinh trên $12$ điểm bán kính $37\text{ m}$ ($15^\circ, 45^\circ, \dots$), cách người chơi $\ge 15\text{ m}$; $2$ con lúc giây thứ $5$, sau đó mỗi $8\text{ s}$; tối đa $6$.

### Đêm 2 — Đảo Cau (mới)

* Hai đảo tròn bán kính $28\text{ m}$, tâm **A** $(0,0,0)$ và **B** $(70,0,0)$, nối bằng cầu tre $x \in [26, 44]$, $z \in [-2, 2]$, không lan can.
* **Bục nhảy:** Hình tròn bán kính $1\text{ m}$ tại $(20,0,18)$ và $(50,0,-18)$: chân Mây chạm bục thì được bắn lên với vận tốc $Y$ $14\text{ m/s}$ và vận tốc ngang $24\text{ m/s}$ hướng về tâm đảo kia. Vận tốc phóng giữ nguyên tới khi chạm đất (phím di chuyển không ghi đè; vẫn được lướt). Bay khoảng $1.4\text{ s}$, đáp trong đảo đích.
* **Điểm sinh đom đóm mỗi đảo:** $4$ điểm trên bán kính $10\text{ m}$ ($0^\circ, 90^\circ, 180^\circ, 270^\circ$) và $8$ điểm trên bán kính $22\text{ m}$ (mỗi $45^\circ$).
* **Bóng Mực sinh:** Trên $8$ điểm bán kính $26\text{ m}$ mỗi đảo ($22.5^\circ, 67.5^\circ, \dots$); sinh mỗi $7\text{ s}$, tối đa $8$.
* **Đèn (`L1`…`L6` theo thứ tự):** $(0,0,20)$, $(17,0,-10)$, $(-17,0,-10)$, $(70,0,20)$, $(87,0,-10)$, $(53,0,-10)$.

### Đêm 3 — Đảo Chuông (mới)

* Đảo tròn bán kính $45\text{ m}$, có $3$ tầng:
  * **Tầng 0 ($Y=0$):** Toàn đảo.
  * **Tầng 1 ($Y=3$):** Vành khăn bán kính $12\text{–}24\text{ m}$ ở nửa có $z > 0$.
  * **Tầng 2 ($Y=6$):** Đĩa bán kính $8\text{ m}$ ở tâm.
* Mép các tầng là vách đứng (không đi lên được; bước ra thì rơi xuống tầng dưới).
* **2 dốc thẳng:** Rộng $3\text{ m}$ dọc theo bán kính ở góc $30^\circ$ và $150^\circ$: chân dốc ở bán kính $30\text{ m}$ ($Y=0$), đỉnh dốc ở bán kính $24\text{ m}$ ($Y=3$).
* **Bục nhảy:** Bán kính $1\text{ m}$ tại $(0,3,13)$: vận tốc $Y$ $12\text{ m/s}$ và vận tốc ngang $8\text{ m/s}$ hướng $-Z$, giữ tới khi chạm đất $\rightarrow$ đáp lên tầng 2.
* **Tháp chuông:** Cao $8\text{ m}$ ở tâm tầng 2, hình trụ bán kính $2\text{ m}$, không leo được.
* **Điểm sinh đom đóm ($30$):** Tầng 0 có $18$ điểm bán kính $34\text{ m}$ (mỗi $20^\circ$ từ $0^\circ$); tầng 1 có $8$ điểm bán kính $18\text{ m}$ ($20^\circ, 40^\circ, \dots, 160^\circ$); tầng 2 có $4$ điểm bán kính $5\text{ m}$ ($45^\circ, 135^\circ, 225^\circ, 315^\circ$).
* **Bóng Mực sinh:** Trên $16$ điểm bán kính $43\text{ m}$ (mỗi $22.5^\circ$); sinh mỗi $6\text{ s}$, tối đa $10$.
* **Đèn (`L1`…`L7`):** $(0,6,6)$, $(18,3,10)$, $(-18,3,10)$, $(35,0,-10)$, $(-35,0,-10)$, $(20,0,-35)$, $(-20,0,-35)$.
* **Gió mạnh:** Mỗi $30\text{ s}$ có một cơn gió kéo dài $5\text{ s}$ theo hướng ngẫu nhiên, đẩy người chơi $2\text{ m/s}$; báo trước $2\text{ s}$ bằng lá bay và âm thanh.

---

## Phần 3 — Tính năng mới

1. **Gió Lạc (Đêm 2 và 3):** Dải lụa xám xanh bay nhanh ($7\text{ m/s}$), tối đa $2$ con, sinh tại tick $1200, 2400, \dots$ trên điểm sương ngẫu nhiên, id `D1`, `D2`, …
   * Trạng thái: `idle` (lượn chậm $2\text{ m/s}$) $\rightarrow$ `chase` $\rightarrow$ `flee` $\rightarrow$ `removed`.
   * `idle` $\rightarrow$ `chase` khi Mây mang $\ge 5$ đom đóm và cách $\le 15\text{ m}$ (kiểm tra mỗi tick); điều kiện mất thì về `idle`.
   * Chạm ($XZ \le 1.2\text{ m}$): cướp $\min(3, \text{đang mang})$ đom đóm, chuyển `flee` (bay ra xa Mây $7\text{ m/s}$ trong $240\text{ tick}$ rồi biến mất cùng số đã cướp). Mỗi con chỉ cướp $1$ lần.
   * Tỏa Sáng trúng Gió Lạc đang `chase` $\rightarrow$ nó chuyển `flee` không cướp; trúng lúc `flee` có mang đồ $\rightarrow$ thả lại toàn bộ đom đóm đã cướp tại chỗ (thành đom đóm rơi), biến mất sau $120\text{ tick}$.
   * Không làm mất Ngọn Lửa; vùng an toàn của đèn không chặn Gió Lạc; bất tử của Mây không ngăn bị cướp.
2. **Bùa Gió:** Lá bùa đỏ viền vàng, id `C1`, `C2`. Nhặt theo luật như đom đóm. Hiệu lực $600\text{ tick}$ (nhặt lại thì làm mới): tốc độ chạy $7.2\text{ m/s}$ và Lướt không hồi chiêu (vẫn cần nhấn lại nút; nhấn khi đang lướt bị bỏ qua; lướt vẫn $14\text{ m/s}$ trong $12\text{ tick}$). Bùa xuất hiện lại sau $2700\text{ tick}$. Vị trí: Đêm 2 $(35,0,0)$; Đêm 3 $(30,0,25)$ và $(-30,0,25)$.
3. **Chuỗi 3 Đêm:** Menu chính $\rightarrow$ giới thiệu Đêm (tên đảo, lời Ông Đăng) $\rightarrow$ chơi $\rightarrow$ kết quả $\rightarrow$ Đêm kế tiếp. Thắng Đêm 3 thì hiện màn hình Bình Minh với tổng điểm. Thua thì được chơi lại Đêm đó.
4. **Tạm dừng (`Esc`/`P`):** Logic dừng hoàn toàn. Có Tiếp tục / Chơi lại Đêm / Cài đặt / Về menu.
5. **Cài đặt:** Âm lượng và độ nhạy chuột, được lưu giữa các lần mở game.
6. **Âm thanh:** Nhạc nền đêm và hiệu ứng cho: nhặt, thắp đèn, tỏa sáng, bị đánh, nhảy, lướt, thắng, thua, Bóng Mực xuất hiện, đếm ngược $10\text{ s}$ cuối.
7. **HUD đầy đủ:** Ngọn Lửa (trên trái), đồng hồ `mm:ss` (trên giữa, đổi màu đỏ và nhấp nháy khi $\le 30\text{ s}$), đèn `k/n` và điểm (trên phải), thanh đom đóm $10$ ô (dưới giữa), biểu tượng hồi chiêu Lướt và Tỏa Sáng (dưới phải), nhắc `"E — Nạp ánh sáng (x/10)"` khi đứng gần đèn, mũi tên chỉ tới đèn chưa sáng gần nhất khi nó ở ngoài màn hình.
8. **Bảng màu chuẩn** (sai lệch tối đa $10\%$ mỗi kênh RGB; áp dụng cho các thành phần liệt kê, màu cho chi tiết khác do bạn tự chọn):

| Dùng cho | Hex |
| ----- | ----- |
| Trời đêm / sương | `#0E1430` / `#1B2350` |
| Cỏ / cát / gỗ / biển mây | `#2F5D50` / `#C9B48A` / `#6B4A2F` / `#12384A` |
| Đèn sáng / lõi / đèn tắt | `#FFB347` / `#FFE9B0` / `#5B5F6E` |
| Đom đóm lõi / quầng | `#FFF6C2` / `#FFE58A` |
| Bóng Mực thân / viền / bị choáng | `#120A1A` / `#7A3CFF` / `#3A3450` |
| Áo Mây / khăn Mây và Bùa Gió | `#E8E2D0` / `#C8102E` |
| Viền vàng, điểm số / Gió Lạc | `#F2C14E` / `#8FA3B8` |
| UI nguy hiểm / chữ UI | `#FF5A5F` / `#F5F1E6` |

* **Ánh sáng môi trường tăng theo tiến độ:**
  $$\text{cường độ} = 0.15 + 0.55 \times \frac{\text{đèn sáng}}{\text{tổng đèn}}$$

---

## Phần 4 — Test Contract v1.1 (thay đổi so với v1.0)

* `contract_version`: `"1.1"`; `tuning` phải khớp số chuẩn ở Phần 1, thêm các khóa `dash_speed`, `dash_duration_s`, `dash_cooldown_s`, `night2_duration_s`, `night3_duration_s`.
* `--night` nhận `1`, `2`, `3`.
* Snapshot gốc thêm `night`, `wind` `{active, dir_deg}`. `player` thêm `vel`, `grounded`, `invuln`, `dash_cd_s`, `pulse_cd_s`, `charm_s`.
* Snapshot thêm các mảng bắt buộc: `motes` (`id`, `pos`, `kind = random/dropped`, `ttl_s`), `drifters` (`id`, `pos`, `state`, `stolen`), `charms` (`id`, `available`, `respawn_s`).
* Scenario thêm `player.{invuln_ticks, dash_cd_ticks, pulse_cd_ticks, charm_ticks}`, `shades[].{state, state_ticks_left}`, `drifters`, `charms`, cờ `random_drifters`, `wind_enabled`. Các mảng `drifters`, `charms` thay thế danh sách mặc định.
* Input thêm `dash` và `pause` (đều kích hoạt khi chuyển `false` $\rightarrow$ `true`).
* Sự kiện mới:
  * `dash`: `{}`
  * `charm_picked`: `{"charm_id": ..., "charm_ticks": ...}`
  * `drifter_steal`: `{"drifter_id": ..., "amount": ..., "carried": ...}`
  * `drifter_drop`: `{"drifter_id": ..., "amount": ...}`
  * `night_start`: `{"night": ...}`
  * `paused`: `{}`
  * `resumed`: `{}`
  * `player_hit` do rơi thêm trường `lost`.
* Từ `v1.1`, trạng thái Bóng Mực phải dùng đúng tên: `spawning`, `wander`, `chase`, `recoil`, `stunned`.
* Chạy headless một Đêm đầy đủ (tối đa $21.600$ tick) phải xong trong $\le 30$ giây.

---

## Định nghĩa hoàn thành (DoD)

* Có bằng chứng game chạy đúng các yêu cầu của phase (định dạng tự chọn).
* Mọi test ẩn Phase 1 vẫn đạt khi chạy với số chuẩn (regression).
* Tài liệu spec của bạn (tên và vị trí tự chọn) có acceptance criteria cho từng mục ở Phần 3.
* File hướng dẫn agent (`AGENTS.md` hoặc tương đương) và các skill được cập nhật cho phạm vi mới (lịch sử git phải thể hiện).
* Test của bạn có ít nhất 1 scenario headless cho mỗi tính năng mới.
* Bản thường đạt $\ge 30\text{ FPS}$ trung bình ở $1280 \times 720$.