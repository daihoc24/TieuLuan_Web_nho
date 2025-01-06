// Hàm để lấy `orderId` từ tham số truy vấn URL
function getOrderIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Hàm để gọi API lấy chi tiết đơn hàng
async function fetchOrderDetail(orderId) {
    try {
        // Gọi API để lấy thông tin chi tiết đơn hàng
        const response = await fetch(`http://localhost:3000/orderDetail/${orderId}`);

        // Kiểm tra nếu API trả về lỗi
        if (!response.ok) {
            throw new Error("Không tìm thấy đơn hàng");
        }

        // Lấy dữ liệu đơn hàng từ phản hồi
        const order = await response.json();

        // Hiển thị chi tiết đơn hàng
        displayOrderDetails(order);
    } catch (error) {
        // Hiển thị lỗi
        displayError(error.message);
    }
}

// Hàm để hiển thị thông tin chi tiết đơn hàng
// Hàm để hiển thị thông tin chi tiết đơn hàng
function displayOrderDetails(order) {
    const orderInfoContainer = document.getElementById("orderInfo");

    // Kiểm tra xem `items` có phải là mảng không
    const orderItems = Array.isArray(order.items) ? order.items : [];

    // Hiển thị thông tin đơn hàng
    const orderHtml = `
        <div class="order-info">
            <p><strong>Mã đơn hàng:</strong> ${order.order_id}</p>
            <p><strong>Trạng thái:</strong> ${order.status}</p>
            <p><strong>Tổng tiền:</strong> ${order.totalAmount} VND</p>
            <p><strong>Phí vận chuyển:</strong> ${order.phiShip} VND</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${order.address}</p>
            <h3>Sản phẩm trong đơn hàng:</h3>
            <div>
                ${orderItems.map(item => `
                    <div class="order-item">
                        <span>${item.products_name}</span>
                        <span>${item.quantity} x ${item.products_price} VND</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    orderInfoContainer.innerHTML = orderHtml;
}


// Hàm để hiển thị lỗi khi không tìm thấy đơn hàng
function displayError(message) {
    const orderInfoContainer = document.getElementById("orderInfo");
    orderInfoContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

// Lấy orderId từ URL
const orderId = getOrderIdFromURL();

// Nếu có orderId, gọi API để lấy chi tiết đơn hàng
if (orderId) {
    fetchOrderDetail(orderId);
} else {
    displayError("Không tìm thấy mã đơn hàng.");
}
