# ♠ Texas Hold'em Online Multiplayer Game (VIP Lounge)

Game kartu poker Texas Hold'em online real-time yang dapat dimainkan bersama teman via browser di laptop maupun HP dengan Room Code / Invite Link.

## 🌟 Fitur Utama
- **Modal Chip Awal**: Setiap pemain yang duduk otomatis mendapatkan **Rp 100.000**.
- **Fitur Rebuy**: Jika chip habis (Rp 0), pemain dapat langsung mengisi ulang Rp 100.000 secara gratis.
- **Aturan Standar Texas Hold'em**:
  - 2 Kartu tangan (*Hole Cards*) + 5 Kartu komunitas di meja (*Flop, Turn, River*).
  - *Small Blind* (Rp 1.000) & *Big Blind* (Rp 2.000).
  - Evaluasi kombinasi kartu standar 7-card (Royal Flush hingga High Card) beserta penentu *tiebreaker*.
  - Kalkulasi *Side Pot* otomatis jika ada pemain yang All-In dengan chip berbeda.
- **Server-Authoritative Anti-Cheat**: Kartu lawan tidak dikirim ke browser sebelum tahap Showdown.
- **Multiplayer & Room System**:
  - Tombol **Salin Link Undangan** untuk share ke teman (contoh: `?room=meja-1` atau kode custom seperti `?room=TEMAN`).
  - Maksimal 8 kursi per meja dengan spectator mode (penonton) jika belum duduk.
- **Bot AI**:
  - Tombol **+ Bot AI** untuk menambahkan pemain komputer saat ingin bermain solo atau mengisi kursi kosong bersama teman.
- **Audio & Visual Premium**:
  - Desain meja oval green felt dengan lis kulit mahoni dan aksen emas.
  - Efek suara sintetis (Web Audio API) untuk pembagian kartu, denting chip, ketuk check, dan musik kemenangan.
  - Efek perayaan konfeti saat Showdown.
  - Live Dealer Chat & Log di pojok kanan bawah.

---

## 🚀 Cara Menjalankan

### Menjalankan Server & Client Bersamaan
Di folder root:
```bash
# Install dependencies
pnpm install:all

# Jalankan dalam mode development (Server port 3050 & Client port 5173)
pnpm dev
```

### Menjalankan Build Produksi (Single Port 3050)
Server Node.js sudah otomatis menyajikan bundle client dari `client/dist`:
```bash
# Build client & server
npm run build

# Jalankan server
npm start
```
Buka browser di: **`http://localhost:3050`**

---

## 🌐 Bermain Bersama Teman
1. Buka game di browser Anda (`http://localhost:3050`).
2. Klik tombol **Meja: MEJA-1** di pojok kanan atas, lalu klik **Salin Link Undangan Teman**.
3. Jika bermain di jaringan lokal (WiFi yang sama), ganti `localhost` dengan IP lokal laptop Anda (misal `http://192.168.1.50:3050?room=meja-1`).
4. Teman Anda tinggal membuka link tersebut, klik kursi kosong bertanda **+ Duduk**, dan permainan langsung dimulai!

---

## 🚀 Panduan Deploy Gratis 100% (Tanpa WebSocket / Standalone Client)

Aplikasi game ini sekarang sudah dilengkapi **Local Game Engine** bawaan di sisi browser! Anda tidak perlu lagi menyewa atau menjalankan server WebSocket terpisah yang sering *sleep* atau lemot. Seluruh logika Texas Hold'em, Bot AI, chip, dompet, audio, serta 4 minigame (Blackjack, Roulette, Crash, Slots) berjalan langsung di browser dengan sangat cepat dan mulus.

---

### Opsi 1: Vercel (Paling Direkomendasikan - 1 Klik Selesai)
1. Buka [Vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **Add New...** $\rightarrow$ **Project**.
3. Pilih repositori **`Jonanda27/tes2`**.
4. Vercel akan otomatis membaca file `vercel.json` yang sudah kami sediakan:
   - **Framework Preset**: Vite
   - **Build Command**: `npm --prefix client run build`
   - **Output Directory**: `client/dist`
5. Klik **Deploy**.
6. Selesai dalam 30 detik! Anda akan mendapatkan link HTTPS gratis (misal: `https://tes2-xxx.vercel.app`) yang **selalu aktif 24/7 tanpa pernah masuk mode sleep**.

---

### Opsi 2: GitHub Pages (100% Gratis Tanpa Akun Tambahan)
Repositori ini sudah dilengkapi GitHub Actions workflow otomatis:
1. Buka repositori Anda di GitHub: `https://github.com/Jonanda27/tes2`.
2. Klik tab **Settings** $\rightarrow$ menu **Pages** di sebelah kiri.
3. Pada bagian **Build and deployment** $\rightarrow$ **Source**, pilih **GitHub Actions**.
4. Lakukan git push ke branch `main`. GitHub Actions akan otomatis mem-build dan merilis game Anda ke link:
   `https://jonanda27.github.io/tes2/`

---

### Opsi 3: Netlify atau Cloudflare Pages
- Cukup hubungkan repositori `Jonanda27/tes2` di dashboard Netlify atau Cloudflare Pages.
- Build command: `npm --prefix client run build`
- Publish directory: `client/dist`
