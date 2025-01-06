// Số lượng đơn hàng trên mỗi trang
const ORDERS_PER_PAGE = 10;

// Dữ liệu đơn hàng (ví dụ từ API)
let orders = [];
let currentPage = 1;

// Xử lý khi nhấn nút "Home"
document.getElementById('home-button').addEventListener('click', () => {
    window.location.href = '/html/home.html';
});

// Hàm để hiển thị danh sách đơn hàng
function renderOrders(page) {
    const orderTableBody = document.querySelector('#order-table tbody');
    orderTableBody.innerHTML = '';

    const startIndex = (page - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    const currentOrders = orders.slice(startIndex, endIndex);

    currentOrders.forEach(order => {
        const row = document.createElement('tr');

        // Lấy danh sách tên sản phẩm, số lượng và giá
        const productDetails = order.items.map(item => {
            return `${item.products_name} x ${item.quantity}<br>Giá: ${item.products_price.toLocaleString()} VND`;
        }).join('<br><br>');

        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.status}</td>
            <td>${order.phiShip.toLocaleString()} VND</td>
            <td>${order.totalAmount.toLocaleString()} VND</td>
            <td>${order.thoiGian}</td>
            <td>${order.user_id}</td>
            <td>${order.address}</td>
            <td>${productDetails}</td>
            <td>
                <button class="action-btn" onclick="window.location.href='/html/updateOrder.html?id=${order.order_id}'">Update</button>
                <button class="action-btn delete-btn" onclick="handleDelete(${order.order_id})">Delete</button>

            </td>
        `;
        orderTableBody.appendChild(row);
    });
}

// Hàm xóa đơn hàng
async function handleDelete(orderId) {
    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa đơn hàng này?');

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/deleteOrder/${orderId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchOrders(); // Cập nhật lại danh sách đơn hàng sau khi xóa
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Lỗi khi xóa đơn hàng:', error);
        alert('Lỗi khi xóa đơn hàng');
    }
}

// Hàm để tạo các nút phân trang
function renderPagination(totalOrders) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);

    const createButton = (text, page, disabled = false, active = false) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.disabled = disabled;
        button.classList.toggle('active', active);
        button.onclick = () => {
            currentPage = page;
            renderOrders(currentPage);
            renderPagination(totalOrders);
        };
        return button;
    };

    // Nút "First"
    paginationContainer.appendChild(createButton('First', 1, currentPage === 1));

    // Nút "Previous"
    paginationContainer.appendChild(createButton('Previous', currentPage - 1, currentPage === 1));

    // Hiển thị số trang xung quanh trang hiện tại
    const visiblePages = 3; // Số trang hiển thị xung quanh
    for (let i = Math.max(1, currentPage - visiblePages); i <= Math.min(totalPages, currentPage + visiblePages); i++) {
        paginationContainer.appendChild(createButton(i, i, false, i === currentPage));
    }

    // Nút "Next"
    paginationContainer.appendChild(createButton('Next', currentPage + 1, currentPage === totalPages));

    // Nút "Last"
    paginationContainer.appendChild(createButton('Last', totalPages, currentPage === totalPages));
}

// Hàm fetch đơn hàng và khởi tạo hiển thị
async function fetchOrders() {
    try {
        const response = await fetch('http://localhost:3000/ordersorders');
        orders = await response.json();

        renderOrders(currentPage);
        renderPagination(orders.length);
    } catch (error) {
        console.error('Lỗi khi tải đơn hàng:', error);
    }
}

// Gọi hàm fetch đơn hàng khi tải trang
fetchOrders();
