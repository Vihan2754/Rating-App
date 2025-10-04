# 🌟 Store Rating Management System  

A **Full-Stack Web Application** that enables users to **rate stores (1–5)** with secure, role-based access for **Admins**, **Store Owners**, and **Normal Users**.  

Built using **React.js**, **Express.js**,**Node.js**, and **MongoDB**, this project follows clean coding and validation best practices.  

---

## 🚀 Live Demo  
🔗 [**View Live App**](https://rating-app-snowy.vercel.app/)

---

## 🧠 Tech Stack  

| Category | Technology Used |
|-----------|-----------------|
| **Frontend** | React.js |
| **Backend** | Express.js,NodeJS |
| **Database** | MongoDB |
| **Authentication** | JWT (JSON Web Token) |
| **Styling** | Tailwind CSS |
| **Version Control** | Git & GitHub |
| **Deployment** | Vercel  |

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
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<your_db_name>
JWT_SECRET=your_secret_key
PORT=5000

# 4️⃣ Run Servers
# Backend
npm run dev

# Frontend
npm run dev

# 5️⃣ Open the App
# Access the project in your browser at:
http://localhost:5173
<img width="1919" height="871" alt="Screenshot 2025-10-04 015953" src="https://github.com/user-attachments/assets/7c9a718b-a1ee-4f96-aed1-c980e5ad3cc9" />
<img width="1919" height="867" alt="Screenshot 2025-10-04 020101" src="https://github.com/user-attachments/assets/7b7b1f9b-3879-42bd-8d70-f089e9a4a20e" />
<img width="1919" height="862" alt="Screenshot 2025-10-04 020116" src="https://github.com/user-attachments/assets/82f887e1-262e-4417-853d-94eccb84a86b" />
<img width="1919" height="871" alt="Screenshot 2025-10-04 020133" src="https://github.com/user-attachments/assets/2e53763f-2085-414c-b19d-869fe0ad5793" />

<img width="1919" height="869" alt="Screenshot 2025-10-04 020029" src="https://github.com/user-attachments/assets/615abf86-4183-4d27-9e15-ea8ee47d2883" />

