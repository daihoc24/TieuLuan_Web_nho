document.getElementById("paymentForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Ngừng gửi form mặc định

    // Lấy thông tin thanh toán từ form
    const accountNumber = document.getElementById("account_number").value;
    const accountName = document.getElementById("account_name").value;
    const bankName = document.getElementById("bank_name").value;
    const content = document.getElementById("content").value;
    const amount = parseFloat(document.getElementById("amount").value); // Số tiền thanh toán

    // Lấy order_id từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id'); // Lấy giá trị của 'id' từ URL

    // Kiểm tra xem order_id có tồn tại không
    if (!orderId) {
        const messageElement = document.getElementById("message");
        messageElement.textContent = "Lỗi: Không có order_id trong URL.";
        messageElement.className = "error";
        return; // Dừng xử lý nếu không có order_id
    }

    try {
        // Lấy thông tin đơn hàng từ server để lấy totalAmount
        const orderResponse = await fetch(`http://localhost:3000/orderDetail/${orderId}`);
        if (!orderResponse.ok) {
            throw new Error("Không tìm thấy thông tin đơn hàng");
        }

        const orderData = await orderResponse.json();

        // Kiểm tra số tiền thanh toán với totalAmount của đơn hàng
        const totalAmount = orderData.totalAmount;

        if (amount !== totalAmount) {
            const messageElement = document.getElementById("message");
            messageElement.textContent = `Số tiền thanh toán không đúng. Tổng số tiền của đơn hàng là ${totalAmount} VND.`;
            messageElement.className = "error";
            return; // Dừng xử lý nếu số tiền không khớp
        }

        const paymentInfo = {
            account_number: accountNumber,
            account_name: accountName,
            bank_name: bankName,
            content: content,
            amount: amount,
            order_id: parseInt(orderId) // Chuyển orderId sang kiểu số nguyên
        };

        // Gửi yêu cầu POST đến server để xác minh thanh toán
        const response = await fetch(`http://localhost:3000/verifyPayment?id=${orderId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentInfo)
        });

        // Lấy dữ liệu phản hồi từ server
        const data = await response.json();

        // Hiển thị thông báo
        const messageElement = document.getElementById("message");

        if (response.ok) {
            messageElement.textContent = data.message;
            messageElement.className = "success";
            alert(`Thanh toán thành công! ${data.message}`);  // Thêm alert cho thanh toán thành công
            window.location.replace("html/orderHistory.html");
        } else {
            messageElement.textContent = data.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
            messageElement.className = "error";
            alert(`Lỗi: ${data.message}`);  // Thêm alert cho lỗi
        }
    } catch (error) {
        const messageElement = document.getElementById("message");
        messageElement.textContent = `Lỗi: ${error.message}`;
        messageElement.className = "error";
        alert(`Lỗi: ${error.message}`);  // Thêm alert cho lỗi
    }
});
