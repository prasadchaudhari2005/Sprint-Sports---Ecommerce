const db = require("./db");
const express = require('express')
const app = express();
const session = require("express-session");
const path = require("path");
const PDFDocument = require("pdfkit");
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Razorpay = require('razorpay');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../frontend/public/images/products');
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Safe filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(session({
    secret: "mySuperSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false
    }
}));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server Listening at  http://localhost:${port}/`);
    console.log("Server updated with Buy Now feature - Ready!");
});

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "../frontend/views"));

// --- Helper Function for Discount Logic ---
function applyDiscount(total) {
    let discountPercent = 0;
    let nextOffer = "";

    // Logic: 3k->5%, 5k->10%, 8k->15%, >8k->20%
    if (total > 8000) {
        discountPercent = 20;
        nextOffer = "Maximum discount applied!";
    } else if (total === 8000) {
        discountPercent = 15;
        nextOffer = "Add any item to get 20% OFF!";
    } else if (total >= 5000) {
        discountPercent = 10;
        let diff = 8000 - total;
        nextOffer = `Add items worth ₹${diff} more for 15% OFF!`;
    } else if (total >= 3000) {
        discountPercent = 5;
        let diff = 5000 - total;
        nextOffer = `Add items worth ₹${diff} more for 10% OFF!`;
    } else {
        discountPercent = 0;
        let diff = 3000 - total;
        nextOffer = `Add items worth ₹${diff} more for 5% OFF!`;
    }

    let discountAmount = (total * discountPercent) / 100;
    let finalTotal = Math.round(total - discountAmount);

    return {
        subtotal: total,
        discountPercent,
        discountAmount: Math.round(discountAmount),
        finalTotal,
        nextOffer
    };
}
// ------------------------------------------

app.get("/about", (req, res) => {
    res.render("about", { user: req.session.user, cartCount: req.session.cartCount || 0 });
});

app.get("/privacy-policy", (req, res) => {
    res.render("privacy_policy", { user: req.session.user, cartCount: req.session.cartCount || 0 });
});

app.get("/return-policy", (req, res) => {
    res.render("return_policy", { user: req.session.user, cartCount: req.session.cartCount || 0 });
});

app.get("/contact", (req, res) => {
    res.render("contact", { user: req.session.user, cartCount: req.session.cartCount || 0 });
});

app.post("/contact", async (req, res, next) => {
    const { name, email, subject, message } = req.body;
    const sql = `INSERT INTO feedback (name, email, subject, message) VALUES (?, ?, ?, ?)`;
    try {
        await db.query(sql, [name, email, subject, message]);
        // Ideally we'd flash a success message here or redirect to a success page.
        // For now, redirect back to contact with a query param or just simple redirect.
        res.send(`<script>alert('Thank you for your feedback!'); window.location.href='/contact';</script>`);
    } catch (err) {
        next(err);
    }
});

app.get("/admin/feedback", async (req, res, next) => {
    // Admin check
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }

    try {
        const [feedback] = await db.query("SELECT * FROM feedback ORDER BY created_at DESC");
        res.render("admin_feedback", { feedback, user: req.session.user });
    } catch (err) {
        next(err);
    }
});

app.post("/admin/feedback/delete/:id", async (req, res, next) => {
    // Admin check
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }

    const feedbackId = req.params.id;
    try {
        await db.query("DELETE FROM feedback WHERE feedback_id = ?", [feedbackId]);
        res.redirect("/admin/feedback");
    } catch (err) {
        next(err);
    }
});

app.get("/", async (req, res, next) => {
    const searchTerm = req.query.search || "";
    let sql = 'SELECT * FROM products';
    const params = [];

    if (searchTerm) {
        sql += ' WHERE product_name LIKE ?';
        params.push(`%${searchTerm}%`);
    }

    try {
        const [products] = await db.query(sql, params);

        if (req.session.user) {
            const userId = req.session.user.id;
            const [cartResults] = await db.query('SELECT product_id, quantity FROM cart WHERE user_id = ?', [userId]);

            const cartItems = cartResults.reduce((acc, item) => {
                acc[item.product_id] = item.quantity;
                return acc;
            }, {});

            const cartCount = cartResults.reduce((sum, item) => sum + item.quantity, 0);
            req.session.cartCount = cartCount; // Store cart count in session

            res.render("main", { products, user: req.session.user, cartCount, cartItems, searchTerm });
        } else {
            res.render("main", { products, user: null, cartCount: 0, cartItems: {}, searchTerm });
        }
    } catch (err) {
        next(err);
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res, next) => {
    const { name, age, phone_number, email, password, address } = req.body;

    // Simple backend validation
    if (!name || !email || !password || !phone_number || !age || !address) {
        // Ideally you would pass an error message to the view
        return res.send('<script>alert("All fields are required"); window.location.href="/register";</script>');
    }

    try {
        // Check if user already exists
        const checkSql = "SELECT * FROM users WHERE email = ?";
        const [existingUser] = await db.query(checkSql, [email]);

        if (existingUser.length > 0) {
            return res.send('<script>alert("Email already registered"); window.location.href="/register";</script>');
        }

        // Insert new user
        // Note: In a production app, passwords must be hashed (e.g., using bcrypt)
        const sql = "INSERT INTO users (name, address, age, phone_number, email, password) VALUES (?, ?, ?, ?, ?, ?)";
        await db.query(sql, [name, address, age, phone_number, email, password]);

        // Redirect to user login on success
        res.redirect("/user_login");
    } catch (err) {
        next(err);
    }
});
app.get("/login", (req, res) => {
    // This page will show two buttons: "User Login" and "Admin Login"
    res.render("login_options");
});

app.get("/admin_login", (req, res) => {
    // Pass the error message from the session, then clear it.
    const error_msg = req.session.error_msg;
    req.session.error_msg = null;
    res.render("admin_login", { error_msg });
});

app.post("/admin_login", async (req, res, next) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM admin WHERE email = ?`;

    try {
        const [results] = await db.query(sql, [email]);

        if (results.length > 0) {
            const admin = results[0];
            // In a real app, admin passwords should also be hashed.
            if (password === admin.password) {
                req.session.user = {
                    id: admin.admin_id,
                    name: admin.username,
                    isAdmin: true // Set a flag for admin users
                };
                res.redirect("/admin");
            } else {
                req.session.error_msg = "Invalid email or password.";
                res.redirect("/admin_login");
            }
        } else {
            req.session.error_msg = "Invalid email or password.";
            res.redirect("/admin_login");
        }
    } catch (err) {
        next(err);
    }
});

app.get("/admin", (req, res) => {
    // A simple check to ensure only logged-in users see the admin page.
    if (req.session.user && req.session.user.isAdmin) {
        res.render("admin");
    } else {
        res.redirect("/admin_login");
    }
});

app.get("/signup", (req, res) => {
    const error_msg = req.session.error_msg;
    const success_msg = req.session.success_msg;
    req.session.error_msg = null;
    req.session.success_msg = null;
    res.render("admin_signup", { error_msg, success_msg });
});

app.post("/signup", async (req, res, next) => {
    const { username, email, phone_no, password, confirm_password } = req.body;

    // Validation
    if (!username || !email || !phone_no || !password || !confirm_password) {
        req.session.error_msg = "All fields are required.";
        return res.redirect("/signup");
    }

    if (password !== confirm_password) {
        req.session.error_msg = "Passwords do not match.";
        return res.redirect("/signup");
    }

    if (password.length < 6) {
        req.session.error_msg = "Password must be at least 6 characters long.";
        return res.redirect("/signup");
    }

    try {
        // Check if email already exists
        const checkSql = "SELECT * FROM admin WHERE email = ?";
        const [existingAdmin] = await db.query(checkSql, [email]);

        if (existingAdmin.length > 0) {
            req.session.error_msg = "Email already registered.";
            return res.redirect("/signup");
        }

        // Insert new admin
        const insertSql = "INSERT INTO admin (username, email, password, phone_no) VALUES (?, ?, ?, ?)";
        await db.query(insertSql, [username, email, password, phone_no]);

        req.session.success_msg = "Account created successfully! Please login.";
        res.redirect("/admin_login");
    } catch (err) {
        next(err);
    }
});

app.get("/user_login", (req, res) => {
    // Pass the error message from the session, then clear it.
    const error_msg = req.session.error_msg;
    req.session.error_msg = null;
    res.render("user_login", { error_msg });
});

app.post("/user_login", async (req, res, next) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;

    try {
        const [results] = await db.query(sql, [email, password]);

        if (results.length > 0) {
            const user = results[0];
            req.session.user = {
                id: user.user_id,
                name: user.name,
                email: user.email,
                address: user.address,
                age: user.age,
                phone_number: user.phone_number,
            };
            req.session.cartCount = 0; // Initialize cart count on login
            res.redirect("/");
        } else {
            req.session.error_msg = "Invalid email or password.";
            res.redirect("/user_login"); // User not found or wrong password
        }
    } catch (err) {
        next(err);
    }
});

app.get("/profile", (req, res) => {
    // Add a check to ensure the user is logged in
    if (req.session.user) {
        res.render("profile", { user: req.session.user, cartCount: req.session.cartCount || 0 });
    } else {
        res.redirect("/user_login"); // Redirect to login if not logged in
    }
});

app.get("/additems", (req, res) => {
    res.render("additems");
});



// Admin Return Management Routes
// Admin Return Management Routes handled in return_routes.js

app.post("/additems", upload.single('image'), async (req, res, next) => {
    // Security check: Ensure only an admin can add items
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }

    const { name, price, quantity, img_url, description } = req.body;
    let sql = `INSERT INTO products(product_name,price,quantity,img_url,description) VALUES (?,?,?,?,?)`;

    // Determine Logic for Image
    let finalImg = "https://via.placeholder.com/300"; // Default placeholder
    if (req.file) {
        finalImg = '/images/products/' + req.file.filename;
    } else if (img_url && img_url.trim() !== "") {
        finalImg = img_url.trim();
    }

    try {
        await db.query(sql, [name, price, quantity, finalImg, description]);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});



app.get("/checkout", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/user_login");
    }
    const userId = req.session.user.id;
    const { productId } = req.query;

    try {
        let total = 0;
        let isSingleBuy = false;
        let singleProductId = null;

        if (productId) {
            // Buy Now logic
            const [product] = await db.query('SELECT price FROM products WHERE product_id = ?', [productId]);
            if (product.length > 0) {
                total = product[0].price; // Single item, quantity 1
                isSingleBuy = true;
                singleProductId = productId;
            }
        } else {
            // Cart Logic
            const sql = `
            SELECT 
                c.quantity,
                p.price
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?;
            `;
            const [products] = await db.query(sql, [userId]);
            for (const item of products) {
                total += item.price * item.quantity;
            }
        }

        // Apply Discount
        const discountDetails = applyDiscount(total);
        const finalTotal = discountDetails.finalTotal;

        res.render("checkout", {
            total: finalTotal, // Pass discounted total
            subtotal: total,   // Optional: if you want to show subtotal on checkout
            key_id: process.env.RAZORPAY_KEY_ID,
            user: req.session.user,
            cartCount: req.session.cartCount || 0,
            isSingleBuy,
            singleProductId
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading checkout");
    }
});

app.post("/create-order", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { amount } = req.body;
    const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_" + Date.now()
    };
    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.post("/place-order-cod", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { isSingleBuy, singleProductId, shippingDetails } = req.body;
    const uid = req.session.user.id;
    const status = "Pending";
    const payment_mode = "COD";

    const { name, phone, address, pincode } = shippingDetails;

    let total = 0;
    let p1 = null, q1 = null, p2 = null, q2 = null, p3 = null, q3 = null;

    try {
        if (isSingleBuy && singleProductId) {
            // Handle Single Buy
            const [product] = await db.query('SELECT price FROM products WHERE product_id = ?', [singleProductId]);
            if (product.length > 0) {
                total = product[0].price;
                p1 = singleProductId;
                q1 = 1;

                const insertBill = `
                    INSERT INTO bills (
                        user_id, total_amount, status, bill_date, 
                        p1, q1, p2, q2, p3, q3,
                        shipping_name, shipping_phone, shipping_address, shipping_pincode, payment_mode
                    ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await db.query(insertBill, [uid, total, status, p1, q1, p2, q2, p3, q3, name, phone, address, pincode, payment_mode]);
            }
        } else {
            // Handle Cart Buy
            const getCart = `
                SELECT c.product_id, c.quantity, p.price 
                FROM cart c 
                JOIN products p ON c.product_id = p.product_id 
                WHERE c.user_id = ?
                LIMIT 3
            `;
            const [cartItems] = await db.query(getCart, [uid]);

            if (cartItems.length === 0) {
                return res.json({ success: false, message: "Cart is empty" });
            }

            for (const item of cartItems) {
                total += item.price * item.quantity;
            }
            // Apply Discount for COD
            const discountDetails = applyDiscount(total);
            total = discountDetails.finalTotal;

            if (cartItems.length > 0) { p1 = cartItems[0].product_id; q1 = cartItems[0].quantity; }
            if (cartItems.length > 1) { p2 = cartItems[1].product_id; q2 = cartItems[1].quantity; }
            if (cartItems.length > 2) { p3 = cartItems[2].product_id; q3 = cartItems[2].quantity; }

            const insertBill = `
                INSERT INTO bills (
                    user_id, total_amount, status, bill_date, 
                    p1, q1, p2, q2, p3, q3,
                    shipping_name, shipping_phone, shipping_address, shipping_pincode, payment_mode,
                    subtotal, discount_amount
                ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await db.query(insertBill, [uid, total, status, p1, q1, p2, q2, p3, q3, name, phone, address, pincode, payment_mode, discountDetails.subtotal, discountDetails.discountAmount]);

            // Clear Cart
            await db.query("DELETE FROM cart WHERE user_id = ?", [uid]);
            req.session.cartCount = 0;
        }

        res.json({ success: true, redirect: "/billing" });

    } catch (err) {
        console.error("Error in COD placement:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.post("/verify-payment", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isSingleBuy, singleProductId, shippingDetails } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        const uid = req.session.user.id;
        const status = "Paid";
        const payment_mode = "Online";
        // Default to user details if shipping missing (fallback)
        const name = (shippingDetails && shippingDetails.name) || req.session.user.name;
        const phone = (shippingDetails && shippingDetails.phone) || req.session.user.phone_number;
        const address = (shippingDetails && shippingDetails.address) || req.session.user.address;
        const pincode = (shippingDetails && shippingDetails.pincode) || "";

        let total = 0;
        let p1 = null, q1 = null, p2 = null, q2 = null, p3 = null, q3 = null;

        try {
            if (isSingleBuy && singleProductId) {
                // Handle Single Buy
                const [product] = await db.query('SELECT price FROM products WHERE product_id = ?', [singleProductId]);
                if (product.length > 0) {
                    total = product[0].price;
                    p1 = singleProductId;
                    q1 = 1;

                    const insertBill = `
                        INSERT INTO bills (
                            user_id, total_amount, status, bill_date, 
                            p1, q1, p2, q2, p3, q3,
                            shipping_name, shipping_phone, shipping_address, shipping_pincode, payment_mode,
                            subtotal, discount_amount
                        ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    await db.query(insertBill, [uid, total, status, p1, q1, p2, q2, p3, q3, name, phone, address, pincode, payment_mode, total, 0]);
                }
            } else {
                // Handle Cart Buy
                const getCart = `
                    SELECT c.product_id, c.quantity, p.price 
                    FROM cart c 
                    JOIN products p ON c.product_id = p.product_id 
                    WHERE c.user_id = ?
                    LIMIT 3
                `;
                const [cartItems] = await db.query(getCart, [uid]);

                if (cartItems.length === 0) {
                    return res.json({ success: false, message: "Cart is empty" });
                }

                for (const item of cartItems) {
                    total += item.price * item.quantity;
                }
                // Apply Discount for Online Payment Verification
                const discountDetails = applyDiscount(total);
                total = discountDetails.finalTotal;

                if (cartItems.length > 0) { p1 = cartItems[0].product_id; q1 = cartItems[0].quantity; }
                if (cartItems.length > 1) { p2 = cartItems[1].product_id; q2 = cartItems[1].quantity; }
                if (cartItems.length > 2) { p3 = cartItems[2].product_id; q3 = cartItems[2].quantity; }

                const insertBill = `
                    INSERT INTO bills (
                        user_id, total_amount, status, bill_date, 
                        p1, q1, p2, q2, p3, q3,
                        shipping_name, shipping_phone, shipping_address, shipping_pincode, payment_mode
                    ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await db.query(insertBill, [uid, total, status, p1, q1, p2, q2, p3, q3, name, phone, address, pincode, payment_mode]);

                // Clear Cart ONLY for cart checkout
                await db.query("DELETE FROM cart WHERE user_id = ?", [uid]);
                req.session.cartCount = 0;
            }

            res.json({ success: true, redirect: "/billing" });

        } catch (err) {
            console.error("Error in verification:", err);
            res.status(500).json({ success: false, message: "Database error" });
        }

    } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
    }
});

app.get("/billing", async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/user_login");
    }
    const uid = req.session.user.id;

    // Query using the p1, q1, p2, q2, p3, q3 columns
    const sql = `
        SELECT 
            b.bill_id, 
            b.total_amount, 
            b.status, 
            b.bill_date,
            b.subtotal,
            b.discount_amount,
            b.p1, b.q1,
            b.p2, b.q2,
            b.p3, b.q3,
            p1.product_name,
            p2.product_name as product_name2,
            p3.product_name as product_name3
        FROM bills b
        LEFT JOIN products p1 ON b.p1 = p1.product_id
        LEFT JOIN products p2 ON b.p2 = p2.product_id
        LEFT JOIN products p3 ON b.p3 = p3.product_id
        WHERE b.user_id = ?
        ORDER BY b.bill_date DESC
    `;

    try {
        const [billsData] = await db.query(sql, [uid]);
        const bills = billsData.map(b => {
            let items = [];
            if (b.product_name) items.push(b.product_name);
            if (b.product_name2) items.push(b.product_name2);
            if (b.product_name3) items.push(b.product_name3);
            return {
                bill_id: b.bill_id,
                total_amount: b.total_amount,
                status: b.status,
                bill_date: b.bill_date,
                subtotal: b.subtotal,
                discount_amount: b.discount_amount,
                items: items.join(', '),
                // Pass individual item details for return modal
                p1: b.p1, name1: b.product_name,
                p2: b.p2, name2: b.product_name2,
                p3: b.p3, name3: b.product_name3
            };
        });
        res.render("userbilling", { bills, user: req.session.user, cartCount: req.session.cartCount || 0, searchTerm: "" });
    } catch (err) {
        next(err);
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Error logging out.");
        }
        res.clearCookie("connect.sid"); // Optional: clear cookie
        res.redirect("/");
    });
});

app.get("/cart", async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/user_login');
    }

    const id = req.session.user.id;
    const sql = `
    SELECT 
        c.cart_id,
        c.user_id,
        c.quantity,
        u.name AS user_name,
        u.address,
        u.phone_number,
        p.product_id,
        p.product_name,
        p.price,
        p.img_url
    FROM cart c
    JOIN users u ON c.user_id = u.user_id
    JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = ?;
`;

    try {
        const [products] = await db.query(sql, [id]);
        let total = 0;
        let titem = 0;
        for (const item of products) {
            total += item.price * item.quantity;
            titem += item.quantity;
        }

        const discountDetails = applyDiscount(total);

        res.render("cart", {
            products,
            total: discountDetails.finalTotal,
            subtotal: total,
            discountPercent: discountDetails.discountPercent,
            discountAmount: discountDetails.discountAmount,
            nextOffer: discountDetails.nextOffer,
            titem,
            cartCount: titem
        });
    } catch (err) {
        next(err);
    }
});

app.post("/clear-cart", async (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: "Please log in to clear your cart." });
    }

    const uid = req.session.user.id;
    const clearCartSql = "DELETE FROM cart WHERE user_id = ?";

    try {
        await db.query(clearCartSql, [uid]);
        req.session.cartCount = 0; // Reset cart count in session
        res.json({ success: true, message: "Cart cleared successfully!" });
    } catch (err) {
        console.error("Error clearing cart:", err);
        res.status(500).json({ success: false, message: "Database error." });
    }
});

app.post("/addtocart/:id", async (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).json({ success: false, message: "Please log in to add items to your cart." });
    }

    const productId = req.params.id;
    const uid = req.session.user.id;
    const checkCartSql = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";

    try {
        const [results] = await db.query(checkCartSql, [uid, productId]);

        let newCartSql;
        if (results.length > 0) {
            newCartSql = "UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?";
        } else {
            newCartSql = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)";
        }

        await db.query(newCartSql, [uid, productId]);

        const [countResult] = await db.query('SELECT SUM(quantity) AS cartCount FROM cart WHERE user_id = ?', [uid]);
        const cartCount = countResult[0].cartCount || 0;
        req.session.cartCount = cartCount; // Update session
        res.json({ success: true, message: "Item added to cart!", cartCount: cartCount });
    } catch (err) {
        res.status(500).json({ success: false, message: "Database error." });
    }
});

app.get("/product/:pid", async (req, res, next) => {
    const productId = req.params.pid;
    const sql = `SELECT * FROM products WHERE product_id = ?`;

    try {
        const [result] = await db.query(sql, [productId]);
        if (!result || result.length === 0) {
            return res.status(404).send("Product not found");
        }
        const product = result[0];
        res.render("dashboard", { product, user: req.session.user, cartCount: req.session.cartCount || 0 });
    } catch (err) {
        next(err);
    }
});

app.get("/bills", async (req, res, next) => {
    try {
        const [result] = await db.query("select * from bills");
        res.render("bills", { result }); // Pass result to template
    } catch (err) {
        next(err);
    }
});

app.get("/updatecartminus/:pid", async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/user_login');
    }
    const uid = req.session.user.id;
    const pid = req.params.pid;
    const sql = "select quantity from cart where user_id = ? and product_id = ?"

    try {
        const [result] = await db.query(sql, [uid, pid]);
        let q = result[0].quantity;

        if (q === 1) {
            const deleteSql = "delete from cart where user_id = ? and product_id = ?";
            await db.query(deleteSql, [uid, pid]);
        } else {
            q = q - 1;
            const updateSql = "update cart set quantity = ? where user_id = ? and product_id = ?";
            await db.query(updateSql, [q, uid, pid]);
        }
        // Recalculate and update session
        const [countResult] = await db.query('SELECT SUM(quantity) AS cartCount FROM cart WHERE user_id = ?', [uid]);
        req.session.cartCount = (countResult[0] && countResult[0].cartCount) || 0;

        res.redirect("/cart");
    } catch (err) {
        next(err);
    }
});

app.get("/updatecartplus/:pid", async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/user_login');
    }
    const uid = req.session.user.id;
    const pid = req.params.pid;
    const sql = "select quantity from cart where user_id = ? and product_id = ?"

    try {
        const [result] = await db.query(sql, [uid, pid]);
        let q = result[0].quantity;
        q = q + 1;
        const updateSql = "update cart set quantity = ? where user_id = ? and product_id = ?";
        await db.query(updateSql, [q, uid, pid]);

        // Recalculate and update session
        const [countResult] = await db.query('SELECT SUM(quantity) AS cartCount FROM cart WHERE user_id = ?', [uid]);
        req.session.cartCount = (countResult[0] && countResult[0].cartCount) || 0;
        res.redirect("/cart");
    } catch (err) {
        next(err);
    }
});

app.post("/billing", async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/user_login');
    }
    const uid = req.session.user.id;
    const status = "Pending";

    // Fetch all cart items for this user
    const getCart = `
        SELECT c.product_id, c.quantity, p.price 
        FROM cart c 
        JOIN products p ON c.product_id = p.product_id 
        WHERE c.user_id = ?
        LIMIT 3
    `;

    try {
        const [cartItems] = await db.query(getCart, [uid]);

        if (cartItems.length === 0) {
            return res.redirect("/cart");
        }

        let total = 0;
        for (const item of cartItems) {
            total += item.price * item.quantity;
        }

        // Prepare values for p1, q1, p2, q2, p3, q3
        let p1 = null, q1 = null, p2 = null, q2 = null, p3 = null, q3 = null;

        if (cartItems.length > 0) {
            p1 = cartItems[0].product_id;
            q1 = cartItems[0].quantity;
        }
        if (cartItems.length > 1) {
            p2 = cartItems[1].product_id;
            q2 = cartItems[1].quantity;
        }
        if (cartItems.length > 2) {
            p3 = cartItems[2].product_id;
            q3 = cartItems[2].quantity;
        }

        // Insert into bills table with p1, q1, p2, q2, p3, q3
        const insertBill = `
            INSERT INTO bills (user_id, total_amount, status, bill_date, p1, q1, p2, q2, p3, q3) 
            VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(insertBill, [uid, total, status, p1, q1, p2, q2, p3, q3]);

        // Clear the user's cart
        const clearCart = "DELETE FROM cart WHERE user_id = ?";
        await db.query(clearCart, [uid]);
        req.session.cartCount = 0; // Reset cart count in session

        res.redirect("/billing");
    } catch (err) {
        console.error("Error in POST /billing:", err.message);
        next(err);
    }
});



// DEBUG: Show all bills for user
app.get("/debug-bills", async (req, res, next) => {
    if (!req.session.user) {
        return res.json({ error: "Not logged in" });
    }
    const uid = req.session.user.id;
    try {
        const [bills] = await db.query("SELECT bill_id, user_id, total_amount, status, bill_date FROM bills WHERE user_id = ? ORDER BY bill_id DESC", [uid]);
        res.json({
            userID: uid,
            totalBills: bills.length,
            bills: bills.map(b => ({
                bill_id: b.bill_id,
                total_amount: b.total_amount,
                status: b.status,
                bill_date: b.bill_date
            }))
        });
    } catch (err) {
        res.json({ error: err.message });
    }
});

app.get("/my-bills", async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/user_login');
    }
    const uid = req.session.user.id;
    const sql = `
        SELECT 
            b.bill_id, 
            b.total_amount, 
            b.status, 
            b.bill_date,
            p1.product_name,
            p2.product_name as product_name2,
            p3.product_name as product_name3
        FROM bills b
        LEFT JOIN products p1 ON b.p1 = p1.product_id
        LEFT JOIN products p2 ON b.p2 = p2.product_id
        LEFT JOIN products p3 ON b.p3 = p3.product_id
        WHERE b.user_id = ?
        ORDER BY b.bill_date DESC
    `;

    try {
        const [billsData] = await db.query(sql, [uid]);
        const bills = billsData.map(b => {
            let items = [];
            if (b.product_name) items.push(b.product_name);
            if (b.product_name2) items.push(b.product_name2);
            if (b.product_name3) items.push(b.product_name3);
            return {
                bill_id: b.bill_id,
                total_amount: b.total_amount,
                status: b.status,
                bill_date: b.bill_date,
                items: items.join(', ')
            };
        });

        if (req.session.user) {
            const userId = req.session.user.id;
            const [result] = await db.query('SELECT SUM(quantity) AS cartCount FROM cart WHERE user_id = ?', [userId]);
            const cartCount = result[0].cartCount || 0;
            res.render("userbilling", { bills, user: req.session.user, cartCount, searchTerm: "" });
        } else {
            res.render("userbilling", { bills, user: null, cartCount: 0, searchTerm: "" });
        }
    } catch (err) {
        next(err);
    }
});
app.get("/mybills", async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/user_login");
    }

    const userId = req.session.user.id;
    // Updated query to handle up to 3 products with product IDs
    const sql = `
        SELECT 
            b.bill_id, 
            b.total_amount, 
            b.status, 
            b.bill_date,
            b.p1,
            b.p2,
            b.p3,
            p1.product_name as name1,
            p2.product_name as name2,
            p3.product_name as name3,
            CONCAT(
                IFNULL(p1.product_name, ''), 
                IF(p2.product_name IS NOT NULL, CONCAT(', ', p2.product_name), ''), 
                IF(p3.product_name IS NOT NULL, CONCAT(', ', p3.product_name), '')
            ) AS items
        FROM bills b
        LEFT JOIN products p1 ON b.p1 = p1.product_id
        LEFT JOIN products p2 ON b.p2 = p2.product_id
        LEFT JOIN products p3 ON b.p3 = p3.product_id
        WHERE b.user_id = ?
        ORDER BY b.bill_date DESC
    `;

    try {
        const [bills] = await db.query(sql, [userId]);
        res.render("userbilling", {
            user: req.session.user,
            bills: bills,
            cartCount: req.session.cartCount || 0
        });
    } catch (err) {
        next(err);
    }
});

app.get("/cart", async (req, res, next) => {
    // Determine user ID if logged in (for possible DB cart in future)
    // For now purely session based cart as per implementation
    // But we need to render the cart page
    // Ensure cartCount is accurate
    const cart = req.session.cart || [];
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.render("checkout", {
        user: req.session.user,
        cart: cart,
        totalAmount: totalAmount,
        cartCount: req.session.cartCount || 0
    });
});





app.get("/download-invoice/:bill_id", async (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.redirect("/user_login");
    }

    const billId = req.params.bill_id;
    const userId = req.session.user.id;

    // Added u.phone_number to the query
    const sql = `
        SELECT 
            b.bill_id, 
            b.total_amount, 
            b.status, 
            b.bill_date,
            u.name AS username, 
            u.address,
            u.email AS user_email,
            u.phone_number,
            p1.product_name AS product1, b.q1, p1.price AS price1,
            p2.product_name AS product2, b.q2, p2.price AS price2,
            p3.product_name AS product3, b.q3, p3.price AS price3
        FROM bills b
        JOIN users u ON b.user_id = u.user_id
        LEFT JOIN products p1 ON b.p1 = p1.product_id
        LEFT JOIN products p2 ON b.p2 = p2.product_id
        LEFT JOIN products p3 ON b.p3 = p3.product_id        
        WHERE b.bill_id = ? AND b.user_id = ?
    `;

    try {
        const [rows] = await db.query(sql, [billId, userId]);

        if (rows.length === 0) {
            return res.status(404).send("Invoice not found or access denied.");
        }

        const bill = rows[0];

        // Collect bill items
        const items = [];
        if (bill.product1) items.push({ name: bill.product1, qty: bill.q1 || 0, price: bill.price1 || 0 });
        if (bill.product2) items.push({ name: bill.product2, qty: bill.q2 || 0, price: bill.price2 || 0 });
        if (bill.product3) items.push({ name: bill.product3, qty: bill.q3 || 0, price: bill.price3 || 0 });

        const billDate = new Date(bill.bill_date);

        // PDF Generation
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="invoice-${bill.bill_id}.pdf"`
        );

        doc.pipe(res);

        // --- Header Section ---
        // Centered Title
        doc.fillColor("#444444")
            .fontSize(28)
            .text("Sprint Sports", { align: "center" })
            .fontSize(10)
            .fillColor("#777777")
            .text("Premium Sports Gear", { align: "center" });

        doc.moveDown(2);

        // --- Details Section ---
        const metaTop = doc.y;

        // Left Column: Invoice To
        doc.fillColor("#000000").fontSize(10).text("Invoice To:", 50, metaTop);
        doc.font("Helvetica-Bold").text(bill.username.toUpperCase(), 50, metaTop + 15);
        doc.font("Helvetica").text(bill.address || "No Address Provided", 50, metaTop + 30, { width: 250 });
        doc.text(`Phone: ${bill.phone_number || 'N/A'}`, 50, metaTop + 45); // Added Phone
        doc.text(bill.user_email, 50, metaTop + 60);

        // Right Column: Invoice Details
        // Using fixed width for labels to align right, and values starting after
        const labelWidth = 100;
        const labelX = 340;
        const valueX = 450;

        doc.font("Helvetica").text("Invoice #:", labelX, metaTop, { width: labelWidth, align: "right" });
        doc.text(`${bill.bill_id}`, valueX, metaTop, { align: "left" });

        doc.text("Date:", labelX, metaTop + 15, { width: labelWidth, align: "right" });
        doc.text(billDate.toLocaleDateString(), valueX, metaTop + 15, { align: "left" });

        doc.text("Delivery Status:", labelX, metaTop + 30, { width: labelWidth, align: "right" });
        doc.fillColor(bill.status === 'Delivered' ? "#28a745" : "#fd7e14"); // Green or Orange
        doc.text(bill.status, valueX, metaTop + 30, { align: "left" });
        doc.fillColor("#000000"); // Reset color

        doc.moveDown(4);

        // Ensure we are below the address block
        let y = Math.max(doc.y, metaTop + 90);

        // --- Table Section ---
        const itemCodeX = 50;
        const descriptionX = 50;
        const qtyX = 350;     // Adjusted based on image: Item - Qty - Price - Total
        const priceX = 420;
        const totalX = 500;

        // Table Header
        doc.font("Helvetica-Bold").fontSize(10);

        // Draw top line - REMOVED to match image
        // doc.moveTo(50, y).lineTo(550, y).strokeColor("#000000").lineWidth(1).stroke();
        // y += 5;

        doc.text("Item", descriptionX, y);
        doc.text("Qty", qtyX, y, { width: 50, align: "center" });
        doc.text("Price", priceX, y, { width: 60, align: "right" });
        doc.text("Total", totalX, y, { width: 50, align: "right" });

        y += 15;
        // Draw bottom header line
        doc.moveTo(50, y).lineTo(550, y).strokeColor("#000000").lineWidth(1).stroke();
        y += 15;

        // Table Rows
        doc.font("Helvetica");

        items.forEach(item => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.qty) || 0;
            const subtotal = price * qty;

            doc.text(item.name, descriptionX, y, { width: 280 });
            doc.text(qty.toString(), qtyX, y, { width: 50, align: "center" });
            doc.text(price.toFixed(2), priceX, y, { width: 60, align: "right" });
            doc.text(subtotal.toFixed(2), totalX, y, { width: 50, align: "right" });

            y += 20;
        });

        // --- Total Section ---
        y += 10;
        doc.moveTo(50, y).lineTo(550, y).strokeColor("#000000").lineWidth(1).stroke();
        y += 10;

        doc.font("Helvetica-Bold").fontSize(12);
        doc.text("Total:", 400, y, { width: 80, align: "right" });
        doc.text(`Rs ${Number(bill.total_amount).toFixed(2)}`, totalX - 20, y, { width: 70, align: "right" });

        doc.end();
    } catch (err) {
        console.error("Error generating invoice:", err);
        next(err);
    }
});

// Show all bills (Admin only)
app.get("/admin_bills", async (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }
    const sql = `
        SELECT 
            b.bill_id, 
            b.total_amount, 
            b.status, 
            b.bill_date,
            b.shipping_name,
            b.shipping_address,
            b.shipping_phone,
            b.payment_mode,
            u.name AS username,
            b.p1, b.q1, p1.product_name AS item1,
            b.p2, b.q2, p2.product_name AS item2,
            b.p3, b.q3, p3.product_name AS item3
        FROM bills b
        JOIN users u ON b.user_id = u.user_id
        LEFT JOIN products p1 ON b.p1 = p1.product_id
        LEFT JOIN products p2 ON b.p2 = p2.product_id
        LEFT JOIN products p3 ON b.p3 = p3.product_id
        ORDER BY b.bill_date DESC
    `;

    try {
        const [bills] = await db.query(sql);
        res.render("adminbillings", { bills });
    } catch (err) {
        next(err);
    }
});

// Update bill status
app.post("/update-bill/:bill_id", async (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }
    const { status } = req.body;
    const bill_id = req.params.bill_id;
    const sql = "UPDATE bills SET status = ? WHERE bill_id = ?";

    try {
        await db.query(sql, [status, bill_id]);
        res.redirect("/admin_bills");
    } catch (err) {
        next(err);
    }
});

// User Return Request Routes
// User Return Request Routes handled in return_routes.js

// My Returns Page
// My Returns Page handled in return_routes.js
// Admin: Show all products to manage
app.get("/admin/manage-products", async (req, res, next) => {
    // Protect this route
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }

    const sql = "SELECT * FROM products ORDER BY product_name";
    try {
        const [products] = await db.query(sql);
        res.render("manage_products", { products });
    } catch (err) {
        next(err);
    }
});

// Admin: Show form to edit a single product
app.get("/admin/edit-product/:id", async (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }

    const productId = req.params.id;
    const sql = "SELECT * FROM products WHERE product_id = ?";
    try {
        const [result] = await db.query(sql, [productId]);
        if (result.length === 0) return res.status(404).send("Product not found.");
        res.render("edit_product", { product: result[0] });
    } catch (err) {
        next(err);
    }
});

// Admin: Handle the product update
// Admin: Handle the product update
app.post("/admin/update-product/:id", upload.single('image'), async (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }
    const productId = req.params.id;
    const { price, description, img_url } = req.body;
    let sql, params;

    try {
        // Determine the image path to save
        // Priority: 1. Uploaded File, 2. URL provided, 3. Keep existing (do nothing to img column)
        let newImgPath = null;
        if (req.file) {
            newImgPath = '/images/products/' + req.file.filename;
        } else if (img_url && img_url.trim() !== "") {
            newImgPath = img_url.trim();
        }

        if (newImgPath) {
            // Update Price, Description, and Image
            sql = "UPDATE products SET price = ?, description = ?, img_url = ? WHERE product_id = ?";
            params = [price, description, newImgPath, productId];
        } else {
            // Update Price and Description only (keep existing image)
            sql = "UPDATE products SET price = ?, description = ? WHERE product_id = ?";
            params = [price, description, productId];
        }

        await db.query(sql, params);
        res.redirect("/admin/manage-products");
    } catch (err) {
        next(err);
    }
});

// Admin: Show delete product page
app.get("/admin/delete-product", async (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }

    const sql = "SELECT * FROM products ORDER BY product_name";
    try {
        const [products] = await db.query(sql);
        res.render("delete_product", { products });
    } catch (err) {
        next(err);
    }
});

// Admin: Handle delete product
app.post("/admin/delete-product/:id", async (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }

    const productId = req.params.id;
    // Note: This might fail if the product is referenced in other tables (like cart or bills) without ON DELETE CASCADE
    // Ideally, we should handle dependencies here, but for now we'll attempt a direct delete.
    const sql = "DELETE FROM products WHERE product_id = ?";

    try {
        await db.query(sql, [productId]);
        res.redirect("/admin/delete-product");
    } catch (err) {
        // If there's a foreign key constraint error, we should probably handle it gracefully
        console.error("Error deleting product:", err);
        // For a better UX, we could flash an error message, but simpler for now -> just error page via next(err)
        next(err);
    }
});

// Admin: Show form to update price by product name
app.get("/admin/update-price", (req, res) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }
    // Pass any messages from the session to the view
    const message = req.session.update_message;
    req.session.update_message = null; // Clear message after reading
    res.render("update_price", { message });
});

// Admin: Handle the price update by product name
app.post("/admin/update-price", async (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect("/admin_login");
    }

    const { productName, newPrice } = req.body;

    const sql = "UPDATE products SET price = ? WHERE product_name = ?";

    try {
        const [result] = await db.query(sql, [newPrice, productName]);

        req.session.update_message = (result.affectedRows > 0)
            ? { type: 'success', text: `Price for '${productName}' updated successfully!` }
            : { type: 'error', text: `Product '${productName}' not found.` };
        res.redirect("/admin/update-price");
    } catch (err) {
        next(err);
    }
});

// Import return routes
require('./return_routes')(app, db, upload);
