// Lấy giỏ hàng từ localStorage hoặc khởi tạo giỏ hàng rỗng nếu không có
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Lấy hoặc khởi tạo order_id
let orderId = parseInt(localStorage.getItem("orderId")) || 1;

// Hiển thị giỏ hàng
function displayCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    // Xóa danh sách giỏ hàng hiện tại
    cartItemsContainer.innerHTML = "";

    // Tính tổng tiền giỏ hàng
    let totalPrice = 0;

    // Hiển thị từng sản phẩm trong giỏ hàng
    cart.forEach((product) => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("cart-item");

        cartItemElement.innerHTML = `
            <img src="${product.products_image}" alt="${product.products_name}">
            <div class="cart-item-info">
                <p><strong>${product.products_name}</strong></p>
                <p>Số lượng: ${product.quantity}</p>
                <p>Giá: ${(product.products_price * product.quantity).toLocaleString()} VND</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${product.products_id})">Xóa</button>
        `;

        cartItemsContainer.appendChild(cartItemElement);
        totalPrice += product.products_price * product.quantity;
    });

    totalPriceElement.textContent = totalPrice.toLocaleString() + " VND";
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(productId) {
    cart = cart.filter((product) => product.products_id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartCount", cart.length); // Cập nhật số lượng sản phẩm trong giỏ hàng
    displayCart();
}

// Xác nhận đơn hàng
function confirmOrder() {
    const modal = document.getElementById("order-modal");
    const addressInput = document.getElementById("address");
    const shippingFee = 15000;

    const totalAmountElement = document.getElementById("total-amount");
    const cartTotal = cart.reduce((total, item) => total + item.products_price * item.quantity, 0);
    const totalAmount = cartTotal + shippingFee;

    totalAmountElement.textContent = totalAmount.toLocaleString() + " VND";
    modal.classList.remove("hidden");

    document.getElementById("confirm-btn").onclick = () => {
        const address = addressInput.value.trim();
        if (!address) {
            alert("Vui lòng nhập địa chỉ giao hàng!");
            return;
        }

        // Lấy thông tin người dùng từ localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        
        if (!user || !user.id) {
            alert("Vui lòng đăng nhập để xác nhận đơn hàng!");
            return;
        }

        // Tạo đơn hàng với order_id tự động tăng
        const order = {
            order_id: orderId, // Gán order_id tự động tăng
            totalAmount,
            status: "Đang xử lý",
            phiShip: shippingFee,
            thoiGian: "23 phút", // Thời gian ước tính
            user_id: user.id, // Lấy user_id từ localStorage
            address,
            items: cart, // Thêm danh sách các sản phẩm trong giỏ hàng vào đơn hàng
        };

        // Gửi dữ liệu đơn hàng đến server
        fetch("http://localhost:3000/addOrder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
        })
            .then(() => {
                alert("Đơn hàng đã được xác nhận!");

                // Tăng orderId cho lần đặt đơn tiếp theo
                orderId++;
                localStorage.setItem("orderId", orderId); // Lưu orderId mới vào localStorage

                // Xóa giỏ hàng
                cart = [];
                localStorage.setItem("cart", JSON.stringify(cart));
                localStorage.removeItem("cartCount"); // Xóa số lượng sản phẩm trong giỏ

                displayCart(); // Cập nhật lại giỏ hàng hiển thị
                modal.classList.add("hidden"); // Ẩn modal sau khi xác nhận đơn
            })
            .catch(() => alert("Có lỗi xảy ra khi tạo đơn hàng!"));
    };

    document.getElementById("cancel-btn").onclick = () => {
        modal.classList.add("hidden"); // Ẩn modal khi hủy
    };
}

window.onload = () => {
    displayCart();
    document.getElementById("checkout-btn").addEventListener("click", confirmOrder);
};
