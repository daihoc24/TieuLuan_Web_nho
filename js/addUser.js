// addUser.js

function handleSubmit() {
    const userName = document.getElementById("userName").value;
    const userEmail = document.getElementById("userEmail").value;
    const userPassword = document.getElementById("userPassword").value;
    const userAddress = document.getElementById("userAddress").value;
    const userPhone = document.getElementById("userPhone").value;
    const userDob = document.getElementById("userDob").value;
    const userRole = document.getElementById("userRole").value;

    // Kiểm tra các trường
    let valid = true;

    if (!userName) {
        document.getElementById("nameError").innerText = "Vui lòng nhập tên người dùng";
        valid = false;
    } else {
        document.getElementById("nameError").innerText = "";
    }

    if (!userEmail) {
        document.getElementById("emailError").innerText = "Vui lòng nhập email";
        valid = false;
    } else {
        document.getElementById("emailError").innerText = "";
    }

    if (!userPassword) {
        document.getElementById("passwordError").innerText = "Vui lòng nhập mật khẩu";
        valid = false;
    } else {
        document.getElementById("passwordError").innerText = "";
    }

    if (!userAddress) {
        document.getElementById("addressError").innerText = "Vui lòng nhập địa chỉ";
        valid = false;
    } else {
        document.getElementById("addressError").innerText = "";
    }

    if (!userPhone) {
        document.getElementById("phoneError").innerText = "Vui lòng nhập số điện thoại";
        valid = false;
    } else {
        document.getElementById("phoneError").innerText = "";
    }

    if (!userDob) {
        document.getElementById("dobError").innerText = "Vui lòng nhập ngày sinh";
        valid = false;
    } else {
        document.getElementById("dobError").innerText = "";
    }

    if (!userRole) {
        document.getElementById("roleError").innerText = "Vui lòng chọn loại người dùng";
        valid = false;
    } else {
        document.getElementById("roleError").innerText = "";
    }

    if (!valid) return;

    // Gửi dữ liệu lên server
    fetch("http://localhost:3000/add-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fullname: userName,
            email: userEmail,
            password: userPassword,
            address: userAddress,
            phone: userPhone,
            birthdate: userDob,
            role: userRole
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === "User added successfully!") {
                window.location.href = "./userAdmin.html"; 
                alert("Người dùng đã được thêm thành công!");
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Lỗi khi thêm người dùng:", error);
            alert("Lỗi khi thêm người dùng");
        });
}
