# Trader Discipline — Discipline & Execution System for Traders

A full-stack trading discipline, psychology, and performance tracking web application built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Express API**, and **MongoDB Atlas**.

---

## 🌟 Key Features

- **Daily Practice Checklist**: Pre-market prep, liquidity sweeps, market structure, news analysis, and trade plans.
- **Disciplined Trade Execution Journal**: Detailed log of setups, risk management, execution plan adherence, psychology states, and post-trade notes.
- **Mistake Tracker & Prevention Engine**: Track FOMO, early exits, chasing trades, revenge trading, and prevention rules.
- **Trade Psychology & Emotional State Log**: Quick mindset check-ins, fear/greed tracking, tilt management.
- **Daily & Weekly Deep Performance Reviews**: End-of-day and end-of-week reflection modules.
- **Core Trading Skill Practice Tracking**: Progressive tracking of essential chart reading and execution skills.
- **MongoDB Atlas Cloud Database**: Persistent cloud storage synced across all devices without relying on browser local storage.
- **100% Vercel & GitHub Ready**: Built with Vite and Vercel serverless API routes (`/api`) with rewrite configuration (`vercel.json`).

---

## 🚀 How to Deploy on GitHub and Vercel (সহজ নির্দেশিকা)

### ধাপ ১: GitHub-এ আপলোড করুন (Push to GitHub)
```bash
git init
git add .
git commit -m "feat: trader discipline with MongoDB Atlas and Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

---

### ধাপ ২: MongoDB Atlas ক্লাস্টার তৈরি করুন (Setup MongoDB Atlas)
1. [MongoDB Atlas](https://www.mongodb.com/atlas)-এ ফ্রি অ্যাকাউন্ট খুলে একটি নতুন **Free (M0) Cluster** তৈরি করুন।
2. **Database Access** এ গিয়ে একটি Database User (Username এবং Password) তৈরি করুন।
3. **Network Access** এ গিয়ে `0.0.0.0/0` (Allow Access from Anywhere) যোগ করুন যাতে Vercel সার্ভারলেস ফাংশন থেকে কানেক্ট হতে পারে।
4. **Connect → Drivers** এ ক্লিক করে আপনার Connection String কপি করুন:
   ```env
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/trader_discipline?retryWrites=true&w=majority
   ```
   *(আপনার ইউজারনেম ও পাসওয়ার্ড বসিয়ে নিন)*

---

### ধাপ ৩: Vercel-এ ডিপ্লয় করুন (Deploy to Vercel)
1. [Vercel](https://vercel.com)-এ লগইন করে **Add New... → Project** নির্বাচন করুন।
2. আপনার GitHub রিপোজিটরিটি সিলেক্ট করে **Import** এ ক্লিক করুন।
3. Vercel স্বয়ংক্রিয়ভাবে **Vite** ফ্রেমওয়ার্ক ডিটেক্ট করবে:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. **Environment Variables** সেকশনে গিয়ে নিচের ভ্যারিয়েবলটি যোগ করুন:
   - **Key**: `MONGODB_URI`
   - **Value**: আপনার MongoDB Atlas কানেকশন স্ট্রিং
   *(ঐচ্ছিক)*: `MONGODB_DB_NAME=trader_discipline`
5. **Deploy** বাটনে ক্লিক করুন!

কয়েক সেকেন্ডের মধ্যে আপনার ট্রেডার ডিসিপ্লিন অ্যাপ লাইভ হয়ে যাবে এবং ক্লাউড মঙ্গোডিবি অ্যাটলাসের সাথে সুরক্ষিতভাবে কাজ করবে!

---

## 💻 Local Development (লোকাল রান করার নিয়ম)

1. রিপোজিটরি ক্লোন করুন:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   cd trader-discipline
   ```

2. ডিপেন্ডেন্সি ইনস্টল করুন:
   ```bash
   npm install
   ```

3. `.env` ফাইল তৈরি করুন:
   ```env
   MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/trader_discipline?retryWrites=true&w=majority"
   ```
   *(যদি MONGODB_URI না দেওয়া হয়, অ্যাপটি স্বয়ংক্রিয়ভাবে লোকাল ফাইল স্টোরেজ ফলব্যাকে চলবে)*

4. ডেভেলপমেন্ট সার্ভার চালু করুন:
   ```bash
   npm run dev
   ```

5. ব্রাউজারে ওপেন করুন: `http://localhost:3000`

---

## 🗄️ Database Collections Structure

- `users` — ট্রেডার অ্যাকাউন্ট, পাসওয়ার্ড হ্যাশ, টাইমজোন।
- `daily_practice` — প্রতিদিনের প্রিপারেশন, মার্কেট স্ট্রাকচার চেকলিস্ট ও নোটস।
- `trades` — সব ট্রেডের এন্ট্রি, স্টপলস, টার্গেট, সাইকোলজি স্টেট এবং ফলাফল।
- `mistakes` — ভুল ট্রেডের রেকর্ড এবং প্রিভেনশন প্ল্যান।
- `psychology_logs` — মাইন্ডসেট ও মানসিক অবস্থার টাইমস্ট্যাম্পড লগ।
- `daily_reviews` & `weekly_reviews` — ডেসিপ্লিন এবং রুলস রিভিউ।
- `skills` — স্ট্রাকচার, লিকুইডিটি, রিক্স ম্যানেজমেন্ট ইত্যাদি স্কিল ট্র্যাকিং।
- `sessions` — অথেনটিকেশন টোকেন সেশন।
