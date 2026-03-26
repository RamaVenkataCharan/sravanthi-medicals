# 🏥 Sravanthi Medicals – Pharmacy Management System

## 📌 Overview

Sravanthi Medicals is a full-stack pharmacy management system designed to streamline **billing, inventory management, and reporting** for medical stores.
It includes a **web dashboard**, **mobile application**, and a **robust backend API**.

---

## ⚙️ Tech Stack

### Backend

* FastAPI (Python)
* SQLite (Pharmacy Database)
* REST API Architecture

### Frontend (Web)

* React + Vite
* TypeScript
* Tailwind CSS

### Mobile App

* React Native (Expo)
* TypeScript

### Database & Tools

* Supabase (optional integration)
* CSV data import scripts

---

## 🚀 Features

### 💊 Inventory Management

* Add, update, and delete medicines
* Batch tracking and expiry management
* Stock monitoring

### 🧾 Billing System

* Generate invoices
* Add multiple items to bill
* Automatic total calculation

### 📊 Reports & Analytics

* Sales reports
* Inventory insights
* Billing history

### 🔐 Authentication

* Secure user login
* Role-based access (extendable)

---

## 📁 Project Structure

```
project/
 ├── backend/     # FastAPI server
 ├── frontend/    # React web app
 ├── mobile/      # React Native mobile app
 ├── scripts/     # Data seeding and utilities
 └── supabase/    # Database migrations
```

---

## 🛠️ Installation & Setup

### 1. Clone Repository

```
git clone https://github.com/your-username/sravanthi-medicals.git
cd sravanthi-medicals/project
```

---

### 2. Backend Setup

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

👉 Runs on: http://127.0.0.1:8000

---

### 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

👉 Runs on: http://localhost:5173

---

### 4. Mobile App Setup

```
cd mobile
npm install
npx expo start
```

* Press `w` → open in browser
* Press `a` → Android emulator
* Or scan QR using Expo Go

---

## 📌 API Documentation

FastAPI provides interactive docs:

👉 http://127.0.0.1:8000/docs

---

## 🔮 Future Enhancements

* Cloud deployment (AWS / Render)
* Payment integration
* Barcode scanning
* Multi-store support
* AI-based demand prediction

---

## 👨‍💻 Author

**Rama Venkata Charan**
B.Tech CSE Student | Full Stack Developer

---

## ⭐ Contribution

Feel free to fork, contribute, and improve this project.

---

## 📄 License

This project is for educational and development purposes.
