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

## 🚀 Panduan Deploy Online Multiplayer (100% Gratis & Real-Time WebSocket)

Agar Anda dan teman bisa bermain bersama di meja yang sama serta mengobrol lewat fitur **Live Chat** secara real-time, game ini membutuhkan server Node.js + WebSocket (Socket.IO). 

Berikut adalah pilihan hosting yang **100% gratis** dan mendukung WebSocket:

---

### Opsi 1: Render.com (Sangat Direkomendasikan - Paling Mudah)
1. Buka **[Render.com](https://render.com/)** dan login dengan akun GitHub Anda.
2. Di dashboard Render, klik tombol **New +** $\rightarrow$ pilih **Web Service** (atau pilih **Blueprint** jika ingin membaca `render.yaml` otomatis).
3. Hubungkan repositori GitHub Anda: **`Jonanda27/tes2`**.
4. Jika memilih manual Web Service:
   - **Name**: `poker-online` *(atau nama lain)*
   - **Region**: `Oregon (US West)` atau `Frankfurt (EU Central)`
   - **Branch**: `main`
   - **Root Directory**: *(biarkan KOSONG agar membaca root)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**
5. Klik **Create Web Service**.
6. Render akan otomatis mem-build frontend dan backend, lalu memberikan URL HTTPS (misal: `https://poker-online.onrender.com`).
7. **Bermain Bareng Teman**: Bagikan link tersebut ke teman Anda, pilih nomor meja yang sama (misal `meja-1`), dan Anda berdua akan langsung duduk bareng dan bisa saling chat secara real-time!

*(Catatan Free Tier Render: Server akan sleep jika tidak ada aktivitas selama 15 menit. Saat pertama kali dibuka kembali butuh waktu ~45 detik untuk cold-start, setelah itu lancar).*

---

### Opsi 2: Koyeb.com (Alternatif Bagus - Bebas Sleep)
1. Buka [Koyeb.com](https://www.koyeb.com) dan login dengan akun GitHub.
2. Buat App baru $\rightarrow$ pilih **GitHub**.
3. Pilih repositori `Jonanda27/tes2`.
4. Pilih **Dockerfile** (otomatis terdeteksi dari repo ini).
5. Port diarahkan ke **3050**.
6. Pilih Free Eco Instance $\rightarrow$ Deploy!

---

### Opsi 3: Hugging Face Spaces (RAM 16 GB - Selamanya Gratis)
1. Buka [HuggingFace.co/spaces](https://huggingface.co/spaces) $\rightarrow$ **Create new Space**.
2. Pilih Space SDK: **Docker** $\rightarrow$ **Blank**.
3. Hubungkan / mirror repositori GitHub Anda.
4. Hugging Face akan mem-build Dockerfile dan game online Anda berjalan 24/7 gratis dengan RAM 16 GB!
