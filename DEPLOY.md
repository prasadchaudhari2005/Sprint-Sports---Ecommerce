# Complete Deployment Guide (Render + TiDB)

This is the **full guidance** you requested. Follow these exact steps.

---

## Part 1: Database Setup (TiDB Cloud)
**Goal:** connect your app to a free 5GB database and create the tables.

1.  **Get Credentials:**
    - Log in to your [TiDB Dashboard](https://tidbcloud.com/).
    - Click **"Connect"** (Top Right).
    - **COPY** the following values to a notepad:
        - **Host**: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
        - **Port**: `4000`
        - **User**: `4HmJMzREHhsaqo2.root`
        - **Password**: **Click the "Generate Password" button** in that popup! Copy it immediately.

2.  **Create Tables:**
    - On TiDB, click **"SQL Editor"** (Left Sidebar).
    - **COPY & PASTE** the entire code block below into the editor and click **Run**:

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS prasad_se;
USE prasad_se;

-- Table: admin
CREATE TABLE IF NOT EXISTS admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_no VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO admin (username, password, email, phone_no) VALUES
('@admin', '123', 'admin@gmail.com', '8523760798');

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (name, address, age, phone_number, email, password) VALUES
('user', 'chittod road', 20, '1234567890', 'user@gmail.com', '123');

-- Table: products
CREATE TABLE IF NOT EXISTS products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  img_url MEDIUMTEXT NOT NULL,
  description TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample products
INSERT INTO products (product_name, price, quantity, img_url, description) VALUES
('Badminton', 750.00, 15, 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQB4h6jjJqa1cNFBrpkARyi8AmOnFdImbXnuNDbILE7P7VoP0yfeHolZCLu4_VLhBVroMwAwxMzkdK36ONpzXvzG6shN_fNmNnXXyKQ1gaaFfPXUiaLSBJg', 'A lightweight and durable badminton racket set.'),
('Baseball', 800.00, 15, 'https://media.istockphoto.com/id/153550763/photo/baseball-and-bat.jpg?s=612x612&w=0&k=20&c=JGG_BC1Dq1UGe6aoJlB5yiz9pngOY89dwEM64T6i_pE=', 'Official size and weight baseball.'),
('Football', 900.00, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM7hKoY52cPk7ECu1o2WPSN20D_r4ep1ghGg&s', 'A high-quality, all-weather football.'),
('VollyBall', 300.00, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhqDLbCyXmvs53TFxmp2quqAK0usE6ot58Qg&s', 'Soft-touch volleyball.'),
('Swimming Cap', 150.00, 15, 'https://m.media-amazon.com/images/I/61OnV6xdL+L._SX679_.jpg', 'Comfortable silicone swimming cap.'),
('Swimming Goggle', 200.00, 15, 'https://m.media-amazon.com/images/I/51IqY5dVAeL._SX679_.jpg', 'Anti-fog swimming goggles.'),
('Sport Shoes', 2000.00, 10, 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSwUwy3NwJHY-gz-2aVSsYShD0AH3m-HxCiRvfzd4LjA4rdGsudAJt4i8gkxoojOgqboGtyFNzyJMgEWX0jQFdCL6zgTQNHhBekerognuE', 'Versatile sport shoes.'),
('Boxing Gloves', 1000.00, 10, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQsvDtTq4ZJVhA_IUQI571bk3GYUEPczs-NZnv0njx3NQALIkHwEOsaat3cocP9lruCt237GH3omM4qlXs8kskBbLvgacW3ZT5CLVwbRPLPrtupFckTU9r9tg', 'Durable boxing gloves.'),
('Cricket bat', 1500.00, 15, 'https://m.media-amazon.com/images/I/715pGcbI56L._SY879_.jpg', 'High-quality wood cricket bat.'),
('Season Ball', 300.00, 15, 'https://m.media-amazon.com/images/I/81mKhH0eCGL._SX679_.jpg', 'Leather season ball.'),
('Football', 500.00, 15, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTqX46VzEp9-iBDLmUljfdkoTnDeh-FOpMgi95ocwLUjJ761nn9LhbzjMDeeigkT-UxjaZ2cru-jDtxViYHEmsFIoeG7mX6F9oesJcNZmUfvffD-P0-a6clUQ', 'Training football.'),
('Rugby', 600.00, 15, 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQALp3FxpEj8TLpDdkcO8J__ZBO2js6hW45vEij-DprLKbgn4b71kFOqfFZYmxKGakjKdxpvgqQkUwE28QFs6Sfob96lTo7OHnnjB3QkCokm2PW7Z9zRDdx', 'Official size rugby ball.'),
('Hockey', 800.00, 15, 'https://m.media-amazon.com/images/I/61tUFAhyAgL._SX679_.jpg', 'Composite hockey stick.'),
('Dumbells', 800.00, 15, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQll5wxP6v8GQfXe9lniLU0E0pu3jRcZvYndp7FQgpyso2iydpRMPy9LN6FY8J53Mw4u-55J2IEV5fp0ho67fOVM3X48RET4WhuZCNvrKqQDubh8q5vJ2kf', 'Cast iron dumbbells.'),
('Yoga Mat', 350.00, 15, 'https://m.media-amazon.com/images/I/81feGML0NAL._SX679_.jpg', 'Non-slip yoga mat.'),
('Skate Board', 1200.00, 10, 'https://buildkitboards.com/cdn/shop/files/Short-97-1p-2_1024x1024.jpg?v=1697647243', 'Maple wood skateboard.');

-- Table: bills
CREATE TABLE IF NOT EXISTS bills (
  bill_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'PENDING',
  bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  p1 INT, q1 INT, p2 INT, q2 INT, p3 INT, q3 INT,
  shipping_name VARCHAR(255),
  shipping_address TEXT,
  shipping_phone VARCHAR(20),
  shipping_pincode VARCHAR(20),
  payment_mode VARCHAR(50) DEFAULT 'Online',
  subtotal INT DEFAULT 0,
  discount_amount INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (p1) REFERENCES products(product_id) ON DELETE SET NULL,
  FOREIGN KEY (p2) REFERENCES products(product_id) ON DELETE SET NULL,
  FOREIGN KEY (p3) REFERENCES products(product_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: cart
CREATE TABLE IF NOT EXISTS cart (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: feedback
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'New'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: returns
CREATE TABLE IF NOT EXISTS returns (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bill_id INT NOT NULL,
    product_id INT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    reason TEXT NOT NULL,
    status ENUM('Requested', 'Approved', 'Rejected') DEFAULT 'Requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## Part 2: App Hosting Setup (Render)
**Goal:** Run your Node.js code on the cloud.

1.  Log in to [Render Dashboard](https://dashboard.render.com/).
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect to your repo: `Sprint-Sports---Ecommerce`.
4.  **Settings**:
    - **Name**: `sport-app` (or any unique name)
    - **Region**: `Singapore` (Best speed for India)
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
    - **Plan**: `Free`

5.  **Environment Variables**:
    Scroll down to "Environment Variables" and click **"Add Environment Variable"** for each row below.
    *Replace the `<...>` placeholders with your actual values.*

    | Key | Value | Where to find it? |
    | :--- | :--- | :--- |
    | `PORT` | `10000` | Just type `10000` |
    | `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` | I copied this from your screenshot |
    | `DB_PORT` | `4000` | Always `4000` for TiDB |
    | `DB_USER` | `4HmJMzREHhsaqo2.root` | I copied this from your screenshot |
    | `DB_PASSWORD` | `<Your Generated Password>` | **Paste the password you generated** |
    | `DB_NAME` | `test` | Default name (or `prasad_se` if you changed it in SQL Editor) |
    | `RAZORPAY_KEY_ID` | `<Your Razorpay ID>` | Use your local `.env` value or Razorpay dashboard |
    | `RAZORPAY_KEY_SECRET` | `<Your Razorpay Secret>` | Use your local `.env` value or Razorpay dashboard |

6.  Click **"Create Web Service"**.

---

## Part 3: Go Live
1.  Render will take about 3-5 minutes to build.
2.  Once it says **"Live"** (Green), click the link found at the top left (e.g., `https://sport-app.onrender.com`).
3.  **Wait**: The first time you open it, it might take **1 minute** to load because the Free Tier "wakes up".
4.  Test your app!
