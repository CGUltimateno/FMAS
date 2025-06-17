# ⚽ Football Match Analysis System (FMAS)

A full-stack football data analysis platform that brings **real-time insights**, **interactive visualizations**, and **match outcome predictions** to the pitch.

Built with:
- ⚛️ React (frontend)
- 🟩 Node.js (backend)
- 🤖 Machine Learning model (match predictions)
- 📡 [API-Football](https://api-football.com/) for live + historical data

---

## 📌 Features

- 🔍 Match Outcome Predictions with probability distribution  
- 📊 Team & Player Statistics (real-time + historical)  
- 📈 Interactive Visualizations (charts, pies, etc.)  
- 🌐 Cross-League Comparisons  
- 🧠 Integrated Machine Learning workflow  
- 🛠️ Custom backend endpoints to interact with the ML model  
- 🧹 Clean modular architecture, ready to scale or deploy  

---

## 🧠 Machine Learning

Our prediction system is trained using historical match data and generates win/draw/loss probabilities based on:
- Rolling averages (form metrics)
- Team stats
- League performance

The backend sends match input (team IDs) to the ML model, which returns probabilistic predictions.

---

## 🏗️ System Architecture

```plaintext
Frontend (React)
    |
    | REST API
    v
Backend (Node.js + Express)
    |
    | Internal API Calls
    v
ML Model (Python) <-> CSV Dataset (Local)
```
- Frontend uses Axios to hit custom endpoints (ex: /predict)
- Backend formats data and calls the ML microservice
- Python model returns probabilities → sent back to frontend

## 📦 Local Setup
```plaintext
# Clone the repo
git clone https://github.com/CGUltimateno/FMAS.git
cd FMAS

# Install backend
cd backend
npm install
npm start

# In a new terminal: frontend
cd frontend
npm install
npm run dev
```

