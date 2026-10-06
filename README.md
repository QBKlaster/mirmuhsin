# Model of OTS – QarDU — sayt va admin panel

| Qism | Qayerda | Nima |
|---|---|---|
| **Sayt** (`index.html`, logotiplar) | GitHub Pages | hamma koʻradi; admin panel ham shu yerda — `#/admin` |
| **Backend** (`admin-apps-script/Code.gs`) | Google Apps Script + Google jadval | maʼlumotlar, login/parol tekshiruvi, xatlar |

Admin panelga kirish: saytning eng pastki oʻng burchagidagi kichik qulf belgisi yoki toʻgʻridan-toʻgʻri `…/mirmuhsin/#/admin`.

---

## Oʻrnatish (bir marta, ~10 daqiqa)

1. **Jadval.** [sheets.new](https://sheets.new) → nomi `Model of OTS` → **Extensions → Apps Script**.
2. **Kod.** Chapdagi `Code.gs` ichini toʻliq oʻchirib, shu papkadagi `admin-apps-script/Code.gs` ni qoʻying. Diskcha belgisi bilan saqlang. (Boshqa fayl kerak emas.)
3. **Ruxsatlar.** Yuqoridagi funksiyalar roʻyxatidan **`setup`** ni tanlab **Run** → hisobingizni tanlang → **Advanced → Go to … (unsafe) → Allow**.
4. **Deploy.** **Deploy → New deployment** → tishli gʻildirak → **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** → chiqqan **Web app URL** (`…/exec`) dan nusxa oling.
5. **Saytga ulash.** `index.html` dagi qatorga shu manzilni qoʻying:
   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/.../exec";
   ```
   va GitHub'ga yuklang.

**Kodni keyin oʻzgartirsangiz:** Deploy → Manage deployments → ✏️ → Version: **New version** → Deploy. Manzil oʻzgarmaydi.

---

## Admin panel

Login va parol bilan kiriladi. Kirish 6 soat amal qiladi (brauzer yopilsa — qayta kirish kerak).

| Boʻlim | Nima qiladi |
|---|---|
| **Arizalar** | Toʻliq jadval: F.I.Sh., yoʻnalish, bosqich, kurs, telefon, pochta, Telegram, Instagram, davlat, jamoa, motivatsiya. Qidiruv, filtr, statistika, Excel'ga yuklab olish. Rolni shu yerda biriktirasiz, holatni `Accepted`/`Rejected` qilib xat yuborasiz. Telegram/Instagram username bosilsa — profil ochiladi (obunani tekshirish uchun). |
| **Tadbirlar** | Sana, joy, tavsif — saytda ortga sanash bilan chiqadi. |
| **Yangiliklar** | Ikki tilda eʼlonlar. |
| **Asoschi** | Rasm yuklash (avtomatik kichraytiriladi, Drive'ga saqlanadi) va matnni ikki tilda tahrirlash. |
| **Umumiy maʼlumot** | Pochta, telefon, Telegram kanal, Instagram, shahar, bosh sahifa matni. |
| **Foydalanuvchilar** | *Faqat bosh admin koʻradi.* Yangi admin qoʻshish, faolsizlantirish, parolini tiklash, oʻchirish. |
| **Parolim** | Har bir admin oʻz parolini almashtiradi. |

O'zgarish saytda 1 daqiqagacha kechikishi mumkin.

### Login va parol talablari

- **Login:** 4–32 belgi, lotin harfi bilan boshlanadi, faqat harf, raqam, `_ . -`.
- **Parol:** kamida 8 belgi; kamida 1 ta katta harf, 1 ta kichik harf, 1 ta raqam, 1 ta maxsus belgi; boʻsh joy yoʻq; ichida login boʻlmasin.

### Rollar

- **Bosh admin** (`MirmuhsinXON_0908`) — hamma narsa + foydalanuvchilarni boshqarish. Uni oʻchirib yoki faolsizlantirib boʻlmaydi.
- **Admin** — arizalar, tadbirlar, yangiliklar, asoschi, sozlamalar. Foydalanuvchi qoʻsha olmaydi.

---

## Xavfsizlik

- **Parollar ochiq saqlanmaydi.** Jadvalning `Users` varagʻida faqat tuzlangan xesh turadi (SHA-256, 1000 marta). Parolni hech kim — jadvalni ochgan odam ham — oʻqiy olmaydi.
- **Hamma tekshiruv serverda.** Sayt kodi ochiq boʻlsa ham, login/parolsiz hech narsa qilib boʻlmaydi: har bir amalda sessiya va rol Apps Script'da qayta tekshiriladi.
- **Bloklash.** 5 marta notoʻgʻri parol → o'sha login 15 daqiqaga bloklanadi.
- **Sessiya bekor qilinadi**, agar foydalanuvchi oʻchirilsa, faolsizlantirilsa yoki paroli almashsa.
- **Parolni unutsangiz:** jadvaldagi `Users` varagʻidan bosh admin qatorini oʻchiring — keyingi soʻrovda u boshlangʻich parol bilan qayta tiklanadi. Shuning uchun Google jadvalni hech kimga **Share** qilmang.
- Google hisobingizda **ikki bosqichli tasdiqlash** (2FA) yoqilgan boʻlsin — butun maʼlumot shu hisobda.

---

## Galereyaga surat qoʻshish

Suratlarni `assets/gallery/` papkasiga yuklang (`1.jpg`, `2.jpg` …, har biri 300 KB gacha) va `index.html` dagi `gallery:` boʻlimida `<div class="empty">…</div>` ni almashtiring:

```html
<div class="grid g3">
  <img src="assets/gallery/1.jpg" alt="">
  <img src="assets/gallery/2.jpg" alt="">
</div>
```

Saytdagi doimiy matnlar (davlatlar, bosqichlar, baholash, qoidalar) `index.html` ichidagi `STATES`, `STEPS`, `CRITERIA`, `C = { en: …, uz: … }` da.
