# 🌟 Store Rating Management System  

A **Full-Stack Web Application** that enables users to **rate stores (1–5)** with secure, role-based access for **Admins**, **Store Owners**, and **Normal Users**.  

Built using **React.js**, **Express.js**, and **PostgreSQL/MySQL**, this project follows clean coding and validation best practices.  

---

## 🚀 Live Demo  
🔗 [**View Live App**](https://rating-app-snowy.vercel.app/)

---

## 🧠 Tech Stack  

| Category | Technology Used |
|-----------|-----------------|
| **Frontend** | React.js |
| **Backend** | Express.js / Loopback / Nest.js |
| **Database** | PostgreSQL / MySQL |
| **Authentication** | JWT (JSON Web Token) |
| **Styling** | Tailwind CSS / Bootstrap |
| **Version Control** | Git & GitHub |
| **Deployment** | Vercel / Render / Railway |

---

## 👥 User Roles & Functionalities  

### 👑 System Administrator  
- Add new **Stores**, **Users**, and **Admins**  
- Dashboard showing **Total Users**, **Stores**, and **Ratings**  
- View & Filter **Stores** and **Users** by Name, Email, Address, Role  
- View all user details (including store owners’ ratings)  
- Secure **Logout** option  

### 🙋 Normal User  
- **Signup/Login**  
- View & Search **Stores** by Name or Address  
- **Submit/Edit Ratings (1–5)**  
- View **Overall** and **Personal** ratings  
- **Update Password** and Logout  

### 🏪 Store Owner  
- **Login** and **Password Update**  
- Dashboard showing:  
  - Users who rated their store  
  - Average store rating  
- Logout securely  

---

## 🧾 Form Validations  

| Field | Validation Rule |
|--------|----------------|
| **Name** | 20–60 characters |
| **Address** | Max 400 characters |
| **Password** | 8–16 chars, at least 1 uppercase & 1 special symbol |
| **Email** | Must follow valid email format |

---

## ⚙️ Setup Instructions  

```bash
# 1️⃣ Clone Repository
git clone https://github.com/yourusername/store-rating-system.git

# 2️⃣ Install Dependencies
cd backend && npm install
cd ../frontend && npm install

# 3️⃣ Configure Environment
# Create a .env file inside the backend folder and add:
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
JWT_SECRET=your_secret_key

# 4️⃣ Run Servers
# Backend
npm run dev

# Frontend
npm run dev

# 5️⃣ Open the App
# Access the project in your browser at:
http://localhost:5173

