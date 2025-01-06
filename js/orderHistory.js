document.addEventListener("DOMContentLoaded", function () {
    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Nếu không có user_id trong localStorage, chuyển hướng người dùng đến trang login
    if (!user || !user.id) {
        window.location.href = "/html/login.html";
        return;
    }

    const userId = user.id; 
    console.log(userId);
    

    // Hàm lấy danh sách đơn hàng
    const fetchOrders = async () => {
        try {
            // Gửi yêu cầu tới API của bạn với user_id trong query string hoặc body
            const response = await fetch(`http://localhost:3000/getOrders?user_id=${userId}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                
                // Sắp xếp đơn hàng theo thời gian tạo, mới nhất lên đầu
                data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                // Hiển thị đơn hàng
                displayOrders(data);
            } else {
                throw new Error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    const formatPrice = (price) => {
        return price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
        });
    };

    const displayOrders = (orders) => {
        const tableBody = document.querySelector("#orderTable tbody");

        if (orders.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='6'>Không có đơn hàng nào.</td></tr>";
            return;
        }

        orders.forEach((order, index) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td> <!-- Hiển thị số thứ tự đơn hàng -->
                <td>${order.status}</td>
                <td>${formatPrice(order.phiShip)}</td>
                <td>${order.thoiGian}</td>
                <td>${formatPrice(order.totalAmount)}</td>
                <td class="table-actions">
                    <button class="button" onclick="handleViewDetails(${order.order_id})">Xem chi tiết</button>
                    <button class="button" onclick="handleBankPayment(${order.order_id})">Thanh toán</button>
                </td>
            `;

            tableBody.appendChild(row);
        });
    };

    // Gọi hàm fetchOrders để lấy dữ liệu
    fetchOrders();
});

const handleViewDetails = (orderId) => {
    // Chuyển đến trang chi tiết đơn hàng với tham số truy vấn
    window.location.href = `/html/orderDetail.html?id=${orderId}`;
};

const handleBankPayment = (orderId) => {
    // Chuyển đến trang thanh toán với tham số truy vấn
    window.location.href = `/html/payment.html?id=${orderId}`;
};
