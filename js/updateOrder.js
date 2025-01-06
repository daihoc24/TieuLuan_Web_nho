// Lấy orderId từ URL
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get("id");

// Kiểm tra nếu không có orderId trong URL
if (!orderId) {
    alert("Không tìm thấy ID đơn hàng trong URL.");
    throw new Error("ID đơn hàng không được cung cấp.");
}

// Hàm tải thông tin đơn hàng từ server
async function loadOrderDetails() {
    try {
        // Gửi yêu cầu lấy thông tin đơn hàng
        const response = await fetch(`http://localhost:3000/order/${orderId}`);
        if (!response.ok) {
            throw new Error("Không tìm thấy đơn hàng hoặc lỗi từ server.");
        }

        const order = await response.json();
        console.log(order);
        
        // Gán thông tin đơn hàng vào các trường trong form
        document.getElementById("orderAddress").value = order.address || "";
        document.getElementById("orderStatus").value = order.status || "";
    } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error);
        alert("Không thể tải thông tin đơn hàng. Vui lòng thử lại!");
    }
}

// Hàm xử lý cập nhật đơn hàng
async function handleUpdateOrder() {
    const orderAddress = document.getElementById("orderAddress").value;
    const orderStatus = document.getElementById("orderStatus").value;

    // Kiểm tra dữ liệu đầu vào
    if (!orderAddress || !orderStatus) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Tạo đối tượng dữ liệu để gửi lên server
    const updatedOrder = {
        address: orderAddress.trim(),
        status: orderStatus.trim(),
    };

    try {
        // Gửi yêu cầu PUT đến API để cập nhật đơn hàng
        const response = await fetch(`http://localhost:3000/updateOrder/${orderId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedOrder),
        });

        // Xử lý phản hồi từ server
        if (response.ok) {
            const result = await response.json();
            window.location.href = "./orderAdmin.html"; // Chuyển hướng về trang quản lý đơn hàng
            alert("Cập nhật đơn hàng thành công!");
            console.log("Đơn hàng đã được cập nhật:", result);
        } else {
            const error = await response.json();
            alert(`Lỗi: ${error.message}`);
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật đơn hàng:", error);
        alert("Không thể cập nhật đơn hàng. Vui lòng thử lại!");
    }
}

// Gắn sự kiện click vào nút cập nhật
document.getElementById("updateButton").addEventListener("click", handleUpdateOrder);

// Tải thông tin đơn hàng khi trang được load
loadOrderDetails();
