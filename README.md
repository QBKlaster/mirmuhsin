# Model of OTS — sayt va admin panel

Ikki qismdan iborat:

| Qism | Qayerda turadi | Kim koʻradi |
|---|---|---|
| **Sayt** (`index.html`, `assets/`) | GitHub + Vercel | hamma |
| **Admin panel** (`admin-apps-script/`) | Google Apps Script serveri | faqat siz |

Admin panelning kodi saytga **umuman yuborilmaydi**. Brauzerda "kodni koʻrish" qilgan odam faqat oddiy sayt kodini koʻradi — panel manzili ham, kodi ham, maʼlumotlar bazasi ham u yerda yoʻq. Kirish parol bilan emas, Google hisobi orqali tekshiriladi.

---

## 1-qadam. Google jadvali va kod

1. [sheets.new](https://sheets.new) — yangi jadval oching, nomini `Model of OTS` qoʻying.
2. **Extensions → Apps Script**.
3. Chapdagi `Code.gs` faylining ichidagi hamma narsani oʻchirib, `admin-apps-script/Code.gs` faylidagi kodni toʻliq nusxalang.
4. Chapdagi **Files** yonidagi **+** → **HTML** → nomiga `Admin` deb yozing (kengaytmasiz). Ochilgan fayl ichidagini oʻchirib, `admin-apps-script/Admin.html` ni toʻliq nusxalang.
5. `Code.gs` boshidagi sozlamalarni toʻldiring:

```js
var ADMIN_EMAILS = ['sizning.pochtangiz@gmail.com'];   // panelga kiradiganlar
var REPLY_EMAIL  = 'info@modelofots.uz';               // arizachilarga javob pochtasi
```

6. Diskcha belgisini bosib saqlang.

`Events`, `News`, `Settings`, `Applications` varaqlari birinchi ishlatilganda oʻzi yaratiladi.

---

## 2-qadam. Ikkita deployment

Bitta kod, ikkita turli ruxsat. **Ikkalasi ham kerak.**

### A — sayt uchun (ochiq)

1. **Deploy → New deployment** → tishli gʻildirak → **Web app**.
2. Description: `site api`, Execute as: **Me**, Who has access: **Anyone**.
3. **Deploy** → **Authorize access** → hisobingizni tanlang → "Google hasn't verified this app" chiqsa: **Advanced → Go to … (unsafe) → Allow**.
4. Chiqqan **Web app URL** dan nusxa oling va `index.html` ichiga qoʻying:

```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/.../exec";
```

Bu manzil orqali sayt faqat **eʼlon qilingan** yangiliklar va tadbirlarni oʻqiydi hamda arizalarni yuboradi. Bu manzildan turib hech narsani tahrirlab boʻlmaydi.

### B — admin panel uchun (yopiq)

1. Yana **Deploy → New deployment** → **Web app**.
2. Description: `admin`, Execute as: **Me**, Who has access: **Only myself**.
   *(Sekretariatda boshqa odam ham panelga kirishi kerak boʻlsa: **Anyone with Google account** ni tanlang va uning pochtasini `ADMIN_EMAILS` roʻyxatiga qoʻshing. Roʻyxatda yoʻq odam kira olmaydi.)*
3. **Deploy** → chiqqan URL — sizning admin panelingiz. Uni brauzerda xatcho'pga saqlang.

> Bu manzilni saytga, Telegramga, hech qayerga joylamang. Kodni keyin oʻzgartirsangiz: **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**, aks holda eski kod ishlashda davom etadi.

---

## 3-qadam. Saytni joylash

1. GitHub'da repozitoriy oching, masalan `modelofots`.
2. **Faqat** `index.html`, `assets/` va shu `README.md` ni yuklang.
   **`admin-apps-script/` papkasini yuklamang** — u Apps Script uchun, GitHub'da turishi shart emas.
3. [vercel.com](https://vercel.com) → **Add New → Project** → repozitoriyni tanlang → Framework: **Other** → **Deploy**.
4. Domen ulash: Vercel'da loyiha → **Settings → Domains** → domen nomini yozing → koʻrsatilgan `A` yoki `CNAME` yozuvini domen registratori DNS panelida qoʻshing.

Matnni keyin GitHub'dagi `index.html` ni tahrirlab oʻzgartirasiz — Vercel saytni oʻzi yangilaydi. Yangilik va tadbirlar uchun esa kodga tegish shart emas: ular admin paneldan boshqariladi.

---

## 4-qadam. Admin paneldan foydalanish

Panel manzilini ochasiz, Google hisobingiz bilan kirasiz. Toʻrtta boʻlim:

**Tadbirlar** — nom (oʻzbekcha va inglizcha), boshlanish vaqti, tugash vaqti, manzil, havola, tavsif. Saqlaganingizdan keyin:
- tadbir saytdagi *Tadbirlar* sahifasida chiqadi, ostida ortga sanash ishlaydi;
- eng yaqin tadbir bosh sahifada katta raqamlar bilan koʻrinadi;
- vaqti kelganda "Hozir davom etmoqda", oʻtib ketganda "Yakunlandi" deb yozilib, "Oʻtgan tadbirlar" ga tushadi.

**Yangiliklar** — sana, sarlavha va matn (ikki tilda), ixtiyoriy rasm havolasi. Soʻnggi ikkitasi bosh sahifada ham chiqadi.

**Umumiy maʼlumot** — pochta, telefon, Telegram (murojaat), Telegram kanal, shahar nomi, bosh sahifadagi katta matn. Bu yerda oʻzgartirilgani saytdagi asl matnni almashtiradi; boʻsh qoldirsangiz asl matn qoladi.

**Arizalar** — barcha arizalar roʻyxati. `Status` ni `Accepted` yoki `Rejected` ga oʻzgartirasiz, soʻng "Qabul qilinganlarga xat yuborish" tugmasini bosasiz. Xat yuborilgan arizaga ikkinchi marta yuborilmaydi. "Jadvalni ochish" tugmasi Google jadvalini ochadi — u yerdan **File → Download → Microsoft Excel (.xlsx)**.

Har bir yozuvda **"Saytda koʻrinsin"** belgisi bor. Uni oʻchirib qoʻysangiz, yozuv saqlanadi, lekin saytda chiqmaydi — oldindan tayyorlab qoʻyish uchun qulay.

O'zgarish saytda 1 daqiqagacha kechikishi mumkin (tezlik uchun javob 60 soniya keshlanadi).

---

## Xavfsizlik

Nima qilingan:

- **Panel kodi maxfiy.** Panel Google serverida ishlaydi; saytga na kodi, na manzili chiqadi.
- **Parol yoʻq, Google autentifikatsiyasi bor.** Parolni oʻgʻirlab boʻlmaydi, chunki u umuman mavjud emas. Kirish faqat `ADMIN_EMAILS` roʻyxatidagi hisob bilan.
- **Ikki qavatli tekshiruv.** Deployment darajasida ("Only myself") va kod darajasida (`requireAdmin_()` har bir amalda pochtani qayta tekshiradi).
- **Ochiq manzil faqat oʻqiydi.** Sayt ishlatadigan manzil orqali yangilik qoʻshib, oʻchirib yoki arizalarni koʻrib boʻlmaydi — u faqat eʼlon qilingan kontentni beradi.
- **Ariza shakli cheklangan.** Faqat maʼlum maydonlar qabul qilinadi, uzunligi cheklanadi, pochta tekshiriladi; boshqa maʼlumot yozib boʻlmaydi.
- **Kiritilgan matn xavfsiz chiqariladi.** Sayt ham, panel ham matnni HTML sifatida bajarmaydi, shuning uchun tashqaridan kod qoʻshib boʻlmaydi.

Nima qilishingiz kerak:

1. Admin pochtangizda **ikki bosqichli tasdiqlash** (2FA) yoqilgan boʻlsin. Butun himoya shu hisobga tayanadi.
2. Admin panel manzilini hech qayerda eʼlon qilmang.
3. `ADMIN_EMAILS` da faqat kerakli odamlar tursin; jamoadan chiqqan odamni roʻyxatdan darhol oʻchiring.
4. Google jadvalini **Share** orqali begonalarga ochmang — arizalar oʻsha yerda.
5. Deployment B ni hech qachon "Anyone" ga oʻzgartirmang.

---

## Galereyaga surat qoʻshish

1. Suratlarni `assets/gallery/` papkasiga yuklang (`1.jpg`, `2.jpg` …), har biri 300 KB dan oshmasin.
2. `index.html` dagi `gallery:` boʻlimida `<div class="empty">…</div>` qatorini almashtiring:

```html
<div class="grid g3">
  <img src="assets/gallery/1.jpg" alt="">
  <img src="assets/gallery/2.jpg" alt="">
  <img src="assets/gallery/3.jpg" alt="">
</div>
```

---

## Fayllar

| Fayl | Nima uchun |
|---|---|
| `index.html` | Butun sayt: dizayn, matnlar, sahifalar, ariza shakli, ortga sanash |
| `assets/logo.webp`, `logo-mark.webp`, `favicon.png` | Logotip |
| `admin-apps-script/Code.gs` | Backend: kontent, arizalar, xat yuborish, ruxsat tekshiruvi |
| `admin-apps-script/Admin.html` | Admin panel koʻrinishi |

Saytdagi doimiy matnlar (davlatlar, lavozimlar, sessiya tartibi, qoidalar) `index.html` pastidagi `<script>` ichida: `STATES`, `POSITIONS`, `STEPS`, `SECRETARIAT` va `C = { en: …, uz: … }`. Qoʻshtirnoq ichidagi matnni oʻzgartiring, qoʻshtirnoq va vergullarga tegmang.
