// Lấy productId từ URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Kiểm tra nếu không có productId trong URL
if (!productId) {
    alert("Không tìm thấy ID sản phẩm trong URL.");
    throw new Error("ID sản phẩm không được cung cấp.");
}

// Hàm tải thông tin sản phẩm từ server
async function loadProductDetails() {
    try {
        // Gửi yêu cầu lấy thông tin sản phẩm
        const response = await fetch(`http://localhost:3000/products/${productId}`);
        if (!response.ok) {
            throw new Error("Không tìm thấy sản phẩm hoặc lỗi từ server.");
        }

        const product = await response.json();

        // Gán thông tin sản phẩm vào các trường trong form
        document.getElementById("productName").value = product.products_name || "";
        document.getElementById("productPrice").value = product.products_price || "";
        document.getElementById("productType").value = product.products_type || "";
    } catch (error) {
        console.error("Lỗi khi tải thông tin sản phẩm:", error);
        alert("Không thể tải thông tin sản phẩm. Vui lòng thử lại!");
    }
}

// Hàm xử lý cập nhật sản phẩm
async function handleUpdateProduct() {
    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productType = document.getElementById("productType").value;

    // Kiểm tra dữ liệu đầu vào
    if (!productName || !productPrice || !productType) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Tạo đối tượng dữ liệu để gửi lên server
    const updatedProduct = {
        productName: productName.trim(),
        productPrice: parseFloat(productPrice),
        productType: productType.trim(),
    };

    try {
        // Gửi yêu cầu PUT đến API để cập nhật sản phẩm
        const response = await fetch(`http://localhost:3000/updateProduct/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProduct),
        });

        // Xử lý phản hồi từ server
        if (response.ok) {
            const result = await response.json();
            window.location.href = "./productAdmin.html";
            alert("Cập nhật sản phẩm thành công!");
            console.log("Sản phẩm đã cập nhật:", result);
        } else {
            const error = await response.json();
            alert(`Lỗi: ${error.message}`);
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        alert("Không thể cập nhật sản phẩm. Vui lòng thử lại!");
    }
}

// Gắn sự kiện click vào nút cập nhật
document.getElementById("updateButton").addEventListener("click", handleUpdateProduct);

// Tải thông tin sản phẩm khi trang được load
loadProductDetails();
