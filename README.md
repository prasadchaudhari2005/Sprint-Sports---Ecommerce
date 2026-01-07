# Sprint Sport - Premium Sportswear & Equipment Store

## 🚀 Project Overview
Sprint Sport is a full-stack e-commerce web application designed for selling high-quality sports gear. The platform features a premium "Cyber-Tech" aesthetic with glassmorphism UI, a comprehensive admin dashboard, real-time returns management, and integrated Razorpay payments.

## ✨ Key Features
- **Premium UI**: Deep dark theme with neon accents and glassmorphism cards.
- **User Dashboard**: Manage profile, view order history, and track returns.
- **Admin Panel**: Manage products, view feedback, and process return requests.
- **Advanced Returns**: Multi-item return support with image uploads and reason tracking.
- **Payments**: Integrated Razorpay for secure online transactions + COD support.
- **Smart Cart**: Dynamic discount logic and sticky order summaries.

## 🛠️ Tech Stack
- **Frontend**: EJS (Templating), Bootstrap 5, Custom CSS (Glassmorphism).
- **Backend**: Node.js, Express.js.
- **Database**: MySQL.
- **Payment Gateway**: Razorpay.

## 📂 Project Structure
```
sport-app-2/
├── backend/            # Express app logic and routes
│   ├── app.js          # Entry point
│   ├── return_routes.js# Return system logic
│   └── db.js           # Database connection
├── db/                 # Database schemas
│   └── schema.sql      # Main database setup script
├── frontend/           
│   ├── public/         # Static assets (CSS, Images, JS)
│   │   ├── images/     # Product & System images
│   │   └── style.css   # Global Premium Stylesheet
│   └── views/          # EJS Templates (Pages & Partials)
└── .env                # Environment keys (Razorpay/DB)
```

## ⚙️ Setup & Installation
1.  **Clone the Repository**:
    ```bash
    git clone <repo-url>
    cd sport-app-2
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Database Setup**:
    - Import `db/schema.sql` into your MySQL database (`prasad_se`).
    - Ensure your MySQL server is running.

4.  **Configuration**:
    - Create a `.env` file in the root directory:
      ```env
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=your_password
      DB_NAME=prasad_se
      RAZORPAY_KEY_ID=your_key_id
      RAZORPAY_KEY_SECRET=your_key_secret
      ```

5.  **Run the App**:
    ```bash
    npm start
    ```
    - Access the app at `http://localhost:3000`.

## 🛡️ Admin Credentials
- **Default Admin**: `@admin`
- **Password**: `123`
- **Login URL**: `/admin_login`

## 📝 License
This project is licensed under the ISC License.
