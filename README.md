# Block-118 🏢

اپلیکیشن مدیریت ساختمان — ۱۰ طبقه، ۴۰ واحد

## ساختار پروژه
Block-118/
├── client/          # React (Vite + Tailwind) — PWA
├── server/          # Node.js + Express + MongoDB
└── .env.example     # نمونه متغیرهای محیطی

## امکانات (MVP)
- [ ] ورود با OTP پیامکی
- [ ] مدیریت واحدها و ساکنین
- [ ] شارژ ماهانه و پرداخت آنلاین (زرین‌پال)
- [ ] درخواست خرابی/تعمیر
- [ ] اطلاعیه‌ها
- [ ] رزرو امکانات مشترک
- [ ] نظرسنجی و رأی‌گیری

## راه‌اندازی
### Backend
cd server
npm install
cp ../.env.example .env
npm run dev

### Frontend
cd client
npm install
npm run dev

## پشته فناوری
- Frontend: React + Vite + Tailwind (PWA)
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Auth: OTP پیامکی (کاوه‌نگار) + JWT
- Payment: زرین‌پال
