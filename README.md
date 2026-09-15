# Tvarita Arts Collective 🎨🎭

Tvarita Arts Collective is a full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to preserve, promote, and showcase traditional Indian regional art forms—with a special focus on folk traditions like Garhwali (Chaunphula, Pandav Nritya), Kumaoni (Chholiya, Jhora), Kerala (Theyyam, Kathakali), and Maharashtra (Koli Dance, Lavani).

The platform features interactive regional art discovery, administrative workflows for approving community-contributed folk art forms, artist verification, and event ticketing for upcoming cultural shows.

---

## 🌟 Key Features

* Cultural Discovery Map: Interactive visual exploration of Indian states with classical and lesser-known folk traditions.
* Propose & Verify Art Forms: Community members can submit unlisted regional folk art forms, complete with media and cultural history, subject to admin approval.
* Artist Verification Portal: Secure team verification workflow for performing groups and regional cultural troupes.
* Cultural Event Listings: Discover, post, and explore upcoming cultural shows, live dance performances, and ticketed events.
* Admin Control Center: Dashboard for platform administrators to review pending art submissions, verify artist teams, and moderate community content.

---

## 🏗️ Architecture & Deployment

* Frontend: React, React Router, Tailwind CSS, Vite (Render: https://twarita.onrender.com)
* Backend: Node.js, Express.js, Socket.IO (Render: https://twaritabackend.onrender.com)
* Database: MongoDB Atlas, Mongoose ODM (Cloud Cluster: tvarita_db)

---

## 🛠️ Local Setup & Installation

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB database instance
* npm or yarn

### 1. Repository Clone
git clone https://github.com/rajat7302/Tvarita
cd Tvarita

### 2. Backend Setup
cd backend
npm install

Create a .env file in the backend/ directory:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

Start the backend server:
npm run dev

### 3. Frontend Setup
cd ../frontend
npm install

Create a .env file in the frontend/ directory:
VITE_API_BASE_URL=http://localhost:5000/api

Start the Vite development server:
npm run dev

---

## 🚀 Deployment & Configuration Notes

### CORS Configuration
Ensure server.js explicitly includes PATCH and matches production origins:
app.use(cors({
  origin: ['http://localhost:5173', 'https://twarita.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

### Single Page Application (SPA) Routing
Set up a Rewrite Rule on Render Static Site hosting:
* Source: /*
* Destination: /index.html
* Action: Rewrite (200)

---

## 📜 License

Distributed under the MIT License.
EOF