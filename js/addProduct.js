function handleSubmit() {
    const productName = document.getElementById("productName").value;
    const productPrice = parseFloat(document.getElementById("productPrice").value);
    const productType = document.getElementById("productType").value;

    // Kiểm tra các trường
    let valid = true;
    if (!productName) {
        document.getElementById("nameError").innerText = "Vui lòng nhập tên sản phẩm";
        valid = false;
    } else {
        document.getElementById("nameError").innerText = "";
    }

    if (!productPrice || productPrice <= 0) {
        document.getElementById("priceError").innerText = "Giá tiền phải lớn hơn 0";
        valid = false;
    } else {
        document.getElementById("priceError").innerText = "";
    }

    if (!productType) {
        document.getElementById("typeError").innerText = "Vui lòng chọn loại sản phẩm";
        valid = false;
    } else {
        document.getElementById("typeError").innerText = "";
    }

    if (!valid) return;

    // Gửi dữ liệu lên server
    fetch("http://localhost:3000/addProduct", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            productName,
            productPrice,
            productType
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Sản phẩm đã được thêm thành công") {
                window.location.href = "./productAdmin.html";
                alert("Sản phẩm đã được thêm thành công");
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Lỗi khi thêm sản phẩm:", error);
            alert("Lỗi khi thêm sản phẩm");
        });
}
