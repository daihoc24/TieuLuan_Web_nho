const express = require("express");
const fs = require("fs").promises;
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình multer để xử lý tải lên file
const upload = multer({
    dest: "uploads/", // Thư mục lưu trữ ảnh tải lên
    limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file tối đa là 10MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
            return cb(new Error("Chỉ chấp nhận file ảnh JPG, JPEG, PNG"));
        }
        cb(null, true);
    },
});
// Helper function to read and write JSON files using async/await
async function readJSONFile(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        throw new Error("Error reading JSON file");
    }
}

async function writeJSONFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
        throw new Error("Error writing to JSON file");
    }
}

// Get comments by product ID
app.get("/comments/:product_id", async (req, res) => {
    const productId = req.params.product_id;

    try {
        const comments = await readJSONFile("comment.json");
        const filteredComments = comments.filter(comment => comment.product_id == productId);
        res.json(filteredComments);
    } catch (err) {
        res.status(500).send("Error reading comments");
    }
});

// Add a new order
app.post("/addOrder", async (req, res) => {
    const newOrder = req.body;

    try {
        const orders = await readJSONFile("order.json");
        const orderId = orders.length > 0 ? orders[orders.length - 1].order_id + 1 : 1;
        const orderWithId = { ...newOrder, order_id: orderId, created_at: new Date().toISOString() };

        orders.push(orderWithId);
        await writeJSONFile("order.json", orders);
        res.status(201).send("Order added successfully");
    } catch (err) {
        res.status(500).send("Error saving order");
    }
});

// Get orders by user ID
app.get("/getOrders", async (req, res) => {
    const userId = parseInt(req.query.user_id);

    if (!userId) {
        return res.status(400).send("User ID is required");
    }

    try {
        const orders = await readJSONFile("order.json");
        const filteredOrders = orders.filter(order => order.user_id === userId);
        res.json(filteredOrders);
    } catch (err) {
        res.status(500).send("Error reading orders");
    }
});

// Add a new comment
app.post("/addComment", async (req, res) => {
    const newComment = req.body;
    const userId = req.body.user_id;

    if (!userId) {
        return res.status(400).send("User ID is required");
    }

    try {
        const comments = await readJSONFile("comment.json");
        const commentId = comments.length > 0 ? comments[comments.length - 1].comment_id + 1 : 1;
        comments.push({ ...newComment, comment_id: commentId, user_id: userId, created_at: new Date().toISOString() });

        await writeJSONFile("comment.json", comments);
        res.status(201).send("Comment added successfully");
    } catch (err) {
        res.status(500).send("Error saving comment");
    }
});

// Get order details by order ID
app.get("/orderDetail/:order_id", async (req, res) => {
    const orderId = parseInt(req.params.order_id);

    try {
        const orders = await readJSONFile("order.json");
        const order = orders.find(order => order.order_id === orderId);
        if (!order) return res.status(404).send("Order not found");

        res.json(order);
    } catch (err) {
        res.status(500).send("Error reading orders");
    }
});

// Verify payment and update the order status
app.post("/verifyPayment", async (req, res) => {
    const { account_number, account_name, bank_name, content, amount } = req.body;
    const order_id = req.query.id;

    if (!order_id) {
        return res.status(400).send({ message: "order_id is required." });
    }

    try {
        const orders = await readJSONFile("order.json");
        const order = orders.find(o => o.order_id === parseInt(order_id));
        if (!order) {
            return res.status(404).send({ message: "Order not found." });
        }

        order.totalAmount = Number(order.totalAmount);

        if (order.totalAmount !== parseFloat(amount)) {
            return res.status(400).send({ message: "Amount mismatch." });
        }

        const payments = await readJSONFile("bank.json");
        const payment = payments.find(p => p.account_number === account_number && p.account_name === account_name && p.bank_name === bank_name);

        if (!payment) {
            return res.status(404).send({ message: "Account not found." });
        }

        payment.money = Number(payment.money);

        if (payment.money < parseFloat(amount)) {
            return res.status(400).send({ message: "Insufficient balance." });
        }

        payment.money -= parseFloat(amount);
        order.status = "Paid";
        order.totalAmount = 0;

        await writeJSONFile("bank.json", payments);
        await writeJSONFile("order.json", orders);

        res.json({
            message: `Payment for order ${order_id} successful!`,
            orderId: order_id,
            newBalance: payment.money,
            orderStatus: order.status
        });
    } catch (err) {
        res.status(500).send({ message: "Error processing payment." });
    }
});

// User login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const users = await readJSONFile("user.json");
        const user = users.find(user => user.user_email === email);

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password!" });
        }

        const isMatch = await bcrypt.compare(password, user.user_password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password!" });
        }

        res.status(200).json({
            success: true,
            message: "Login successful!",
            id: user.user_id,
            user_email: user.user_email,
            user_fullname: user.user_fullname,
            user_role: user.user_role,

        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error during login." });
    }
});

// User signup
app.post("/signup", async (req, res) => {
    const { email, password, fullname, address, phone, birthdate } = req.body;

    if (!email || !password || !fullname || !address || !phone || !birthdate) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const users = await readJSONFile("user.json");

        const userExists = users.find(user => user.user_email === email);

        if (userExists) {
            return res.status(400).json({ message: "Email already in use!" });
        }

        const newUserId = users.length > 0 ? Math.max(...users.map(user => user.user_id)) + 1 : 1;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            user_id: newUserId,
            user_email: email,
            user_password: hashedPassword,
            user_fullname: fullname,
            user_address: address,
            user_phone: phone,
            user_birthDate: birthdate,
            user_role: "user"
        };

        users.push(newUser);
        await writeJSONFile("user.json", users);

        res.status(201).json({ message: "Signup successful!" });
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ message: "Error during signup." });
    }
});
// Endpoint để lấy thông tin người dùng dựa trên query string
app.get("/account", async (req, res) => {
    const userId = parseInt(req.query.user_id);

    if (!userId) {
        return res.status(400).json({ message: "User ID is required!" });
    }

    try {
        const users = await readJSONFile("user.json");
        const user = users.find(u => u.user_id === userId);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.json({
            user_id: user.user_id,
            user_email: user.user_email,
            user_fullname: user.user_fullname,
            user_address: user.user_address,
            user_phone: user.user_phone,
            user_birthDate: user.user_birthDate,
            user_role: user.user_role,
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving user details!" });
    }
});

app.put('/account', async (req, res) => {
    const userId = parseInt(req.query.user_id);
    const { email, fullname, address, phone, birthday } = req.body;

    if (!email || !fullname || !address || !phone || !birthday) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        const users = await readJSONFile("user.json");
        const userIndex = users.findIndex(u => u.user_id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found!' });
        }

        // Cập nhật thông tin người dùng
        users[userIndex] = {
            ...users[userIndex],
            user_email: email,
            user_fullname: fullname,
            user_address: address,
            user_phone: phone,
            user_birthDate: birthday
        };

        // Ghi lại dữ liệu đã thay đổi vào file
        await fs.writeFile('user.json', JSON.stringify(users, null, 2));

        res.json({ message: 'User info updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating user info!' });
    }
});
app.put('/account/password', async (req, res) => {
    const userId = parseInt(req.query.user_id);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password are required!' });
    }

    try {
        // Đọc danh sách người dùng từ file
        const users = await readJSONFile("user.json");
        const userIndex = users.findIndex(u => u.user_id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found!' });
        }

        // Kiểm tra mật khẩu cũ (so sánh mật khẩu nhập với mật khẩu đã mã hóa trong cơ sở dữ liệu)
        const isPasswordCorrect = await bcrypt.compare(currentPassword, users[userIndex].user_password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Current password is incorrect!' });
        }

        // Mã hóa mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu mới
        users[userIndex] = {
            ...users[userIndex],
            user_password: hashedNewPassword // Cập nhật mật khẩu đã mã hóa
        };

        // Ghi lại dữ liệu đã thay đổi vào file
        await fs.writeFile('user.json', JSON.stringify(users, null, 2));

        res.json({ message: 'Password updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating password!' });
    }
});
app.get("/products", async (req, res) => {
    try {
        // Đọc dữ liệu sản phẩm từ product.json
        const products = await readJSONFile("product.json");

        // Trả về danh sách sản phẩm
        res.json(products);
    } catch (err) {
        res.status(500).send("Error reading products");
    }
});
app.post("/addProduct", async (req, res) => {
    const { productName, productPrice, productType } = req.body;

    if (!productName || !productPrice || !productType) {
        return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin sản phẩm." });
    }

    try {
        // Đọc dữ liệu hiện tại từ product.json
        const products = await readJSONFile("./product.json");

        // Tạo ID mới bằng cách tăng dần từ ID cuối cùng
        const newId = products.length > 0 ? products[products.length - 1].products_id + 1 : 1;

        // Tạo sản phẩm mới
        const newProduct = {
            products_id: newId,
            products_name: productName,
            products_image: "",
            products_price: productPrice,
            products_type: productType,
            quantitySold: 0,
        };

        // Thêm sản phẩm vào mảng
        products.push(newProduct);

        // Ghi lại dữ liệu vào file JSON
        await writeJSONFile("./product.json", products);

        res.status(201).json({ message: "Sản phẩm đã được thêm thành công", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi thêm sản phẩm", error: error.message });
    }
});
// Route xóa sản phẩm
app.delete('/deleteProduct/:id', async (req, res) => {
    const productId = parseInt(req.params.id);  // Lấy id từ tham số URL

    if (!productId) {
        return res.status(400).json({ message: "Vui lòng cung cấp ID sản phẩm." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file product.json
        const products = await readJSONFile("./product.json");

        // Tìm sản phẩm cần xóa
        const productIndex = products.findIndex(product => product.products_id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại." });
        }

        // Xóa sản phẩm khỏi mảng
        products.splice(productIndex, 1);

        // Ghi lại dữ liệu vào file JSON
        await writeJSONFile("./product.json", products);

        res.status(200).json({ message: "Sản phẩm đã được xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa sản phẩm", error: error.message });
    }
});
app.put('/updateProduct/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const { productName, productPrice, productType } = req.body;

    if (!productId || !productName || !productPrice || !productType) {
        return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin sản phẩm và ID hợp lệ." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file product.json
        const products = await readJSONFile("./product.json");

        // Tìm sản phẩm cần sửa
        const productIndex = products.findIndex(product => product.products_id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại." });
        }

        // Cập nhật thông tin sản phẩm
        products[productIndex].products_name = productName;
        products[productIndex].products_price = productPrice;
        products[productIndex].products_type = productType;

        // Ghi lại dữ liệu vào file JSON
        await writeJSONFile("./product.json", products);

        res.status(200).json({ message: "Sản phẩm đã được cập nhật thành công", product: products[productIndex] });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
    }
});
app.get("/products/:id", async (req, res) => {
    const productId = parseInt(req.params.id); // Lấy id từ tham số URL

    if (!productId) {
        return res.status(400).json({ message: "Vui lòng cung cấp ID sản phẩm." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file product.json
        const products = await readJSONFile("./product.json");

        // Tìm sản phẩm theo ID
        const product = products.find(product => product.products_id === productId);

        if (!product) {
            return res.status(404).json({ message: "Sản phẩm không tìm thấy." });
        }

        // Trả về sản phẩm tìm được
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin sản phẩm", error: error.message });
    }
});
// API tải lên hình ảnh cho sản phẩm
app.post("/upload-productImg/:id", upload.single("file"), async (req, res) => {
    try {
        const productId = req.params.id;
        const imagePath = `/uploads/${req.file.filename}`; // Đường dẫn tạm thời cho ảnh

        // Đọc danh sách sản phẩm từ file
        const products = await readJSONFile("product.json");

        // Tìm sản phẩm theo id
        const product = products.find((p) => p.products_id == productId);
        if (!product) {
            return res.status(404).send("Không tìm thấy sản phẩm");
        }

        // Cập nhật đường dẫn hình ảnh cho sản phẩm
        product.products_image = imagePath;

        // Ghi lại dữ liệu vào file JSON
        await writeJSONFile("product.json", products);

        // Trả về kết quả
        res.json({
            message: "Cập nhật hình ảnh thành công!",
            imageUrl: imagePath,
            product,
        });
    } catch (err) {
        res.status(500).send("Lỗi khi tải lên hình ảnh");
    }
});
app.get("/users", async (req, res) => {
    try {
        const users = await readJSONFile("user.json"); // Đọc từ file hoặc từ cơ sở dữ liệu
        res.json(users);
    } catch (err) {
        res.status(500).send("Error reading users");
    }
});
app.post("/add-user", async (req, res) => {
    const { email, password, fullname, address, phone, birthdate, role } = req.body;

    if (!email || !password || !fullname || !address || !phone || !birthdate || !role) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const users = await readJSONFile("user.json");

        const userExists = users.find(user => user.user_email === email);

        if (userExists) {
            return res.status(400).json({ message: "Email already in use!" });
        }

        const newUserId = users.length > 0 ? Math.max(...users.map(user => user.user_id)) + 1 : 1;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            user_id: newUserId,
            user_email: email,
            user_password: hashedPassword,
            user_fullname: fullname,
            user_address: address,
            user_phone: phone,
            user_birthDate: birthdate,
            user_role: role
        };

        users.push(newUser);
        await writeJSONFile("user.json", users);

        res.status(201).json({ message: "User added successfully!" });
    } catch (err) {
        console.error("Error during user addition:", err);
        res.status(500).json({ message: "Error during user addition." });
    }
});
app.delete('/deleteUser/:id', async (req, res) => {
    const userId = parseInt(req.params.id);  // Lấy id từ tham số URL

    if (!userId) {
        return res.status(400).json({ message: "Vui lòng cung cấp ID người dùng." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file user.json
        const users = await readJSONFile("./user.json");

        // Tìm người dùng cần xóa
        const userIndex = users.findIndex(user => user.user_id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Xóa người dùng khỏi mảng
        users.splice(userIndex, 1);

        // Ghi lại dữ liệu vào file JSON
        await writeJSONFile("./user.json", users);

        res.status(200).json({ message: "Người dùng đã được xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa người dùng", error: error.message });
    }
});
app.put('/updateUser/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { userEmail, userFullname, userAddress, userPhone, userDob, userRole } = req.body;

    if (!userId || !userEmail || !userFullname || !userAddress || !userPhone || !userDob || !userRole) {
        return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin người dùng và ID hợp lệ." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file user.json
        const users = await readJSONFile("./user.json");

        // Tìm người dùng cần sửa
        const userIndex = users.findIndex(user => user.user_id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        // Cập nhật thông tin người dùng
        users[userIndex].user_email = userEmail;
        users[userIndex].user_fullname = userFullname;
        users[userIndex].user_address = userAddress;
        users[userIndex].user_phone = userPhone;
        users[userIndex].user_birthDate = userDob;
        users[userIndex].user_role = userRole;

        // Ghi lại dữ liệu vào file JSON
        await writeJSONFile("./user.json", users);

        res.status(200).json({ message: "Người dùng đã được cập nhật thành công", user: users[userIndex] });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật người dùng", error: error.message });
    }
});

// Lấy thông tin người dùng theo ID
app.get("/user/:id", async (req, res) => {
    const userId = parseInt(req.params.id);  // Lấy id từ tham số URL

    if (!userId) {
        return res.status(400).json({ message: "Vui lòng cung cấp ID người dùng." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file user.json
        const users = await readJSONFile("./user.json");

        // Tìm người dùng theo ID
        const user = users.find(user => user.user_id === userId);

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tìm thấy." });
        }

        // Trả về người dùng tìm được
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin người dùng", error: error.message });
    }
});
app.get("/ordersorders", async (req, res) => {
    try {
        const users = await readJSONFile("./order.json"); // Đọc từ file hoặc từ cơ sở dữ liệu
        res.json(users);
    } catch (err) {
        res.status(500).send("Error reading users");
    }
});

// API xóa đơn hàng
app.delete('/deleteOrder/:id', async (req, res) => {
    const orderId = parseInt(req.params.id);  // Lấy ID từ tham số URL

    if (!orderId) {
        return res.status(400).json({ message: "Vui lòng cung cấp ID đơn hàng." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file order.json
        const orders = await readJSONFile("./order.json");

        // Tìm đơn hàng cần xóa
        const orderIndex = orders.findIndex(order => order.order_id === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại." });
        }

        // Xóa đơn hàng khỏi mảng
        orders.splice(orderIndex, 1);

        // Ghi lại dữ liệu vào file JSON
        await writeJSONFile("./order.json", orders);

        res.status(200).json({ message: "Đơn hàng đã được xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa đơn hàng", error: error.message });
    }
});
app.get("/order/:id", async (req, res) => {
    const orderId = parseInt(req.params.id); // Lấy ID từ tham số URL

    if (!orderId) {
        return res.status(400).json({ message: "Vui lòng cung cấp ID đơn hàng." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file orders.json
        const orders = await readJSONFile("./order.json");

        // Tìm đơn hàng theo ID
        const order = orders.find(order => order.order_id === orderId);

        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tìm thấy." });
        }

        // Trả về đơn hàng tìm được
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin đơn hàng", error: error.message });
    }
});

// Cập nhật đơn hàng theo ID
app.put("/updateOrder/:id", async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { address, status } = req.body;

    if (!orderId || !address || !status) {
        return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin đơn hàng và ID hợp lệ." });
    }

    try {
        // Đọc dữ liệu hiện tại từ file orders.json
        const orders = await readJSONFile("./order.json");

        // Tìm đơn hàng cần sửa
        const orderIndex = orders.findIndex(order => order.order_id === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại." });
        }

        // Cập nhật thông tin đơn hàng
        orders[orderIndex].address = address;
        orders[orderIndex].status = status;

        // Ghi lại dữ liệu vào file JSON
        await writeJSONFile("./order.json", orders);

        res.status(200).json({ message: "Đơn hàng đã được cập nhật thành công", order: orders[orderIndex] });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng", error: error.message });
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
