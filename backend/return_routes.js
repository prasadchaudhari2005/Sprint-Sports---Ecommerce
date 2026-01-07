module.exports = function (app, db, upload) {
    // ==========================================
    // RETURN SYSTEM ROUTES
    // ==========================================

    function daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
    }

    // Helper to get product name
    async function getProductName(db, pid) {
        const [rows] = await db.query("SELECT product_name FROM products WHERE product_id = ?", [pid]);
        return rows.length > 0 ? rows[0].product_name : "Unknown Item";
    }

    // 1. GET Return Request Page
    app.get("/return-request/:billId", async (req, res, next) => {
        if (!req.session.user) return res.redirect("/user_login");
        const billId = req.params.billId;

        const sql = `
        SELECT
            b.*,
            p1.product_name as name1, p1.img_url as img1, p1.price as price1,
            p2.product_name as name2, p2.img_url as img2, p2.price as price2,
            p3.product_name as name3, p3.img_url as img3, p3.price as price3
        FROM bills b 
        LEFT JOIN products p1 ON b.p1 = p1.product_id
        LEFT JOIN products p2 ON b.p2 = p2.product_id
        LEFT JOIN products p3 ON b.p3 = p3.product_id
        WHERE b.bill_id = ? AND b.user_id = ?
        `;

        try {
            const [bills] = await db.query(sql, [billId, req.session.user.id]);
            if (bills.length === 0) return res.redirect("/mybills");
            const bill = bills[0];

            // 1. Check Return Window
            const billDate = new Date(bill.bill_date);
            const today = new Date();
            const dayDiff = daysBetween(today, billDate);
            const isWindowClosed = dayDiff > 7;

            // 2. Fetch Previous Returns
            const [prevReturns] = await db.query("SELECT product_id, quantity FROM returns WHERE bill_id = ?", [billId]);
            const returnedMap = {};
            prevReturns.forEach(r => {
                if (r.product_id) returnedMap[r.product_id] = (returnedMap[r.product_id] || 0) + r.quantity;
            });

            // 3. Construct Items
            const items = [];
            const productSlots = [
                { id: bill.p1, name: bill.name1, img: bill.img1, price: bill.price1, qty: bill.q1 },
                { id: bill.p2, name: bill.name2, img: bill.img2, price: bill.price2, qty: bill.q2 },
                { id: bill.p3, name: bill.name3, img: bill.img3, price: bill.price3, qty: bill.q3 }
            ];

            productSlots.forEach(slot => {
                if (slot.id) {
                    const previouslyReturned = returnedMap[slot.id] || 0;
                    const availableQty = slot.qty - previouslyReturned;
                    let status = "Eligible";

                    if (bill.status !== 'Delivered') status = "Not Delivered";
                    else if (isWindowClosed) status = "Return Window Closed";
                    else if (availableQty <= 0) status = "Fully Returned";

                    items.push({
                        ...slot,
                        previouslyReturned,
                        availableQty,
                        status,
                        isEligible: status === "Eligible" && availableQty > 0
                    });
                }
            });

            res.render("return_request", {
                user: req.session.user,
                cartCount: req.session.cartCount || 0,
                bill: bill,
                items: items,
                isWindowClosed
            });

        } catch (err) {
            next(err);
        }
    });

    // 2. POST Handle Return Submission
    app.post("/return-request", upload.single('returnImage'), async (req, res, next) => {
        if (!req.session.user) return res.redirect("/user_login");

        const { billId } = req.body;
        let selectedProducts = req.body['selected_products'];
        let imageUrl = req.file ? '/images/products/' + req.file.filename : null;

        // --- SCOPE START: MANUAL ENTRY HANDLING ---
        // If no auto-selected products, check if user entered manual details
        if (!selectedProducts && req.body.manual_product_name) {
            const productName = req.body.manual_product_name;
            const qty = parseInt(req.body.manual_qty || 1);
            const type = req.body.manual_reason_type;
            const detail = req.body.manual_reason_details;
            const fullReason = `${type}: ${detail || ''}`;

            try {
                // Insert with NULL product_id
                await db.query(`INSERT INTO returns(user_id, bill_id, product_id, product_name, quantity, reason, status, image_url) VALUES(?, ?, NULL, ?, ?, ?, 'Requested', ?)`,
                    [req.session.user.id, billId, productName, qty, fullReason, imageUrl]);

                return res.render("success", { msg: "Manual return request submitted successfully!", user: req.session.user });
            } catch (err) {
                return next(err);
            }
        }
        // --- SCOPE END ---

        if (!selectedProducts) {
            return res.render("success", { msg: "Please select items to return or enter details manually.", user: req.session.user });
        }

        if (!Array.isArray(selectedProducts)) selectedProducts = [selectedProducts];

        try {
            const [bills] = await db.query("SELECT * FROM bills WHERE bill_id = ? AND user_id = ?", [billId, req.session.user.id]);
            if (bills.length === 0) throw new Error("Invalid Order");
            const bill = bills[0];

            // Re-Verify Window
            const dayDiff = daysBetween(new Date(), new Date(bill.bill_date));
            if (dayDiff > 7) return res.render("success", { msg: "Return window closed (7 days).", user: req.session.user });

            // Re-Verify Quantities
            const [prevReturns] = await db.query("SELECT product_id, quantity FROM returns WHERE bill_id = ?", [billId]);
            const returnedMap = {};
            prevReturns.forEach(r => {
                if (r.product_id) returnedMap[r.product_id] = (returnedMap[r.product_id] || 0) + r.quantity;
            });

            let successCount = 0;

            for (const pid of selectedProducts) {
                const returnQty = parseInt(req.body['qty_' + pid] || 0);
                if (returnQty <= 0) continue;

                const type = req.body['reason_type_' + pid];
                const detail = req.body['reason_details_' + pid];
                const fullReason = type ? `${type}: ${detail || ''}` : 'General Return';

                let originalQty = 0;
                let productName = "Item";
                if (bill.p1 == pid) { originalQty = bill.q1; productName = await getProductName(db, pid); }
                else if (bill.p2 == pid) { originalQty = bill.q2; productName = await getProductName(db, pid); }
                else if (bill.p3 == pid) { originalQty = bill.q3; productName = await getProductName(db, pid); }

                const previouslyReturned = returnedMap[pid] || 0;

                if (returnQty <= (originalQty - previouslyReturned)) {
                    await db.query(`INSERT INTO returns(user_id, bill_id, product_id, product_name, quantity, reason, status, image_url) VALUES(?, ?, ?, ?, ?, ?, 'Requested', ?)`,
                        [req.session.user.id, billId, pid, productName, returnQty, fullReason, imageUrl]);
                    successCount++;
                }
            }

            const msg = successCount > 0
                ? "Return request submitted successfully!"
                : "Return failed. Please check quantities.";

            res.render("success", { msg, user: req.session.user });

        } catch (err) {
            next(err);
        }
    });

    // Admin & My Returns Routes
    app.get("/myreturns", async (req, res, next) => {
        if (!req.session.user) return res.redirect("/user_login");
        try {
            const [returns] = await db.query("SELECT * FROM returns WHERE user_id = ? ORDER BY created_at DESC", [req.session.user.id]);
            res.render("myreturns", { user: req.session.user, cartCount: req.session.cartCount || 0, returns });
        } catch (err) { next(err); }
    });

    app.get("/admin/returns", async (req, res, next) => {
        if (!req.session.user || !req.session.user.isAdmin) return res.redirect("/admin_login");
        try {
            const [returns] = await db.query(`SELECT r.*, u.name, u.email FROM returns r JOIN users u ON r.user_id = u.user_id ORDER BY r.created_at DESC`);
            res.render("admin_returns", { returns });
        } catch (err) { next(err); }
    });

    app.post("/admin/return-status", async (req, res, next) => {
        if (!req.session.user || !req.session.user.isAdmin) return res.redirect("/admin_login");
        try {
            await db.query("UPDATE returns SET status = ? WHERE return_id = ?", [req.body.status, req.body.returnId]);
            res.redirect("/admin/returns");
        } catch (err) { next(err); }
    });
};
