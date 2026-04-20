# ⚡ Resume Analyzer — AI Powered

Dark-themed, full-stack resume analyzer powered by NVIDIA Llama 3.1 AI.

## 🚀 How to Run

### Terminal 1 — Backend
```bash
cd backend
npm install
node server.js
```
✅ Should say: `Server running on http://localhost:5050`

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ Open: http://localhost:5173

---

## 🍃 MongoDB Setup (for persistent login/signup)

1. Install MongoDB Community: https://www.mongodb.com/try/download/community
2. Open MongoDB Compass
3. Connect to: `mongodb://localhost:27017`
4. Open `backend/.env` and set:
   ```
   MONGODB_URI=mongodb://localhost:27017/resumeanalyzer
   ```
5. Restart backend — it will auto-create the database!

---

## 🔑 NVIDIA API Key
Already configured in `backend/.env`. To change it, update `NVIDIA_API_KEY=`.

## 📁 Structure
```
├── backend/
│   ├── .env              ← API keys & MongoDB URI
│   ├── server.js
│   ├── controllers/      ← auth, resume logic
│   ├── models/User.js    ← Mongoose schema
│   ├── routes/
│   └── services/
│       └── aiService.js  ← NVIDIA NIM integration
└── frontend/
    └── src/
        ├── pages/        ← Landing, Login, Signup, Dashboard
        └── services/api.js
```
