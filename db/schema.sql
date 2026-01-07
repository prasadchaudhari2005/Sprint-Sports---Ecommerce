-- Create Database
DROP DATABASE IF EXISTS prasad_se;
CREATE DATABASE prasad_se;
USE prasad_se;

-- Table: admin
CREATE TABLE admin (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_no VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO admin (admin_id, username, password, email, phone_no) VALUES
(1, '@admin', '123', 'admin@gmail.com', '8523760798');

-- Table: users
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (user_id, name, address, age, phone_number, email, password) VALUES
(1, 'user', 'chittod road', 20, '1234567890', 'user@gmail.com', '123');

-- Table: products
CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  img_url MEDIUMTEXT NOT NULL,
  description TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample products
INSERT INTO products (product_id, product_name, price, quantity, img_url, description) VALUES
(4, 'Badminton', 750.00, 15, 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQB4h6jjJqa1cNFBrpkARyi8AmOnFdImbXnuNDbILE7P7VoP0yfeHolZCLu4_VLhBVroMwAwxMzkdK36ONpzXvzG6shN_fNmNnXXyKQ1gaaFfPXUiaLSBJg', 'A lightweight and durable badminton racket set, perfect for players of all levels. Comes with high-tension strings for powerful shots.'),
(5, 'Baseball', 800.00, 15, 'https://media.istockphoto.com/id/153550763/photo/baseball-and-bat.jpg?s=612x612&w=0&k=20&c=JGG_BC1Dq1UGe6aoJlB5yiz9pngOY89dwEM64T6i_pE=', 'Official size and weight baseball, featuring a solid cork core and a full-grain leather cover for excellent durability and a classic feel.'),
(6, 'Football', 900.00, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM7hKoY52cPk7ECu1o2WPSN20D_r4ep1ghGg&s', 'A high-quality, all-weather football designed for optimal performance on grass and turf. Its durable construction ensures long-lasting play.'),
(7, 'VollyBall', 300.00, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhqDLbCyXmvs53TFxmp2quqAK0usE6ot58Qg&s', 'Soft-touch volleyball with a sponge-backed synthetic leather cover for a comfortable feel. Ideal for both indoor and outdoor games.'),
(8, 'Swimming Cap', 150.00, 15, 'https://m.media-amazon.com/images/I/61OnV6xdL+L._SX679_.jpg', 'A comfortable, tear-resistant silicone swimming cap that reduces drag and protects hair from chlorine. Designed for a snug, hydrodynamic fit.'),
(9, 'Swimming Goggle', 200.00, 15, 'https://m.media-amazon.com/images/I/51IqY5dVAeL._SX679_.jpg', 'Anti-fog and UV-protected swimming goggles with a comfortable silicone seal to prevent leaks. Features an adjustable strap for a secure fit.'),
(10, 'Sport Shoes', 2000.00, 10, 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSwUwy3NwJHY-gz-2aVSsYShD0AH3m-HxCiRvfzd4LjA4rdGsudAJt4i8gkxoojOgqboGtyFNzyJMgEWX0jQFdCL6zgTQNHhBekerognuE', 'Versatile and breathable sport shoes with a cushioned sole for maximum comfort during running, training, or casual wear. Provides excellent support.'),
(11, 'Boxing Gloves', 1000.00, 10, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQsvDtTq4ZJVhA_IUQI571bk3GYUEPczs-NZnv0njx3NQALIkHwEOsaat3cocP9lruCt237GH3omM4qlXs8kskBbLvgacW3ZT5CLVwbRPLPrtupFckTU9r9tg', 'Durable synthetic leather boxing gloves with multi-layer foam padding for excellent shock absorption and wrist support during training.'),
(12, 'Cricket bat', 1500.00, 15, 'https://m.media-amazon.com/images/I/715pGcbI56L._SY879_.jpg', 'A well-balanced cricket bat made from high-quality wood, designed for powerful hitting and precision. Ideal for club and practice matches.'),
(13, 'Season Ball', 300.00, 15, 'https://m.media-amazon.com/images/I/81mKhH0eCGL._SX679_.jpg', 'A hand-stitched, 4-piece leather season ball with a cork core, offering excellent swing and seam movement for competitive cricket.'),
(14, 'Football', 500.00, 15, 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTqX46VzEp9-iBDLmUljfdkoTnDeh-FOpMgi95ocwLUjJ761nn9LhbzjMDeeigkT-UxjaZ2cru-jDtxViYHEmsFIoeG7mX6F9oesJcNZmUfvffD-P0-a6clUQ', 'A durable training football with a machine-stitched body for a soft touch and reliable performance. Perfect for practice and recreational play.'),
(15, 'Rugby', 600.00, 15, 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQALp3FxpEj8TLpDdkcO8J__ZBO2js6hW45vEij-DprLKbgn4b71kFOqfFZYmxKGakjKdxpvgqQkUwE28QFs6Sfob96lTo7OHnnjB3QkCokm2PW7Z9zRDdx', 'Official size rugby ball with a high-grip synthetic surface for superior handling and passing in all weather conditions.'),
(16, 'Hockey', 800.00, 15, 'https://m.media-amazon.com/images/I/61tUFAhyAgL._SX679_.jpg', 'A composite hockey stick offering a great balance of power and control. Its lightweight design is perfect for fast-paced gameplay.'),
(17, 'Dumbells', 800.00, 15, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQll5wxP6v8GQfXe9lniLU0E0pu3jRcZvYndp7FQgpyso2iydpRMPy9LN6FY8J53Mw4u-55J2IEV5fp0ho67fOVM3X48RET4WhuZCNvrKqQDubh8q5vJ2kf', 'A pair of cast iron dumbbells with a non-slip grip, perfect for strength training, bodybuilding, and general fitness exercises at home.'),
(18, 'Yoga Mat', 350.00, 15, 'https://m.media-amazon.com/images/I/81feGML0NAL._SX679_.jpg', 'A thick, non-slip yoga mat providing extra cushioning for your joints during yoga or pilates. Made from eco-friendly, easy-to-clean material.'),
(19, 'Skate Board', 1200.00, 10, 'https://buildkitboards.com/cdn/shop/files/Short-97-1p-2_1024x1024.jpg?v=1697647243', 'A durable 7-ply maple wood skateboard with high-rebound wheels and sturdy trucks, suitable for both beginners and experienced skaters.');

-- Table: bills
CREATE TABLE bills (
  bill_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'PENDING',
  bill_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  p1 INT,
  q1 INT,
  p2 INT,
  q2 INT,
  p3 INT,
  q3 INT,
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

INSERT INTO bills (bill_id, user_id, total_amount, status, bill_date, p1, q1, p2, q2, p3, q3, shipping_name, shipping_address, shipping_phone, shipping_pincode, payment_mode) VALUES
(1, 1, 2300.00, 'Delivered', '2025-09-26 06:11:52', 7, 1, 6, 1, 5, 1, 'User', 'Default Address', '8523760798', '000000', 'Online');

-- Table: cart
CREATE TABLE cart (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: feedback
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'New'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: returns (UPDATED for Manual Entry Support)
CREATE TABLE IF NOT EXISTS returns (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bill_id INT NOT NULL,
    product_id INT NULL,  -- Allow NULL for manual entries
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