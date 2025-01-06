document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Nếu đăng nhập thành công, lưu id và email vào localStorage
            const user = {
                id: data.id,
                email: data.user_email,
                fullname: data.user_fullname,
                role: data.user_role
            };
            localStorage.setItem("user", JSON.stringify(user));

            // Thông báo thành công
            alert("Đăng nhập thành công!");

            // Chuyển hướng đến trang chủ hoặc trang khác
            window.location.href = "/html/home.html";  // Thay đổi URL theo yêu cầu của bạn
        } else {
            // Nếu đăng nhập thất bại, hiển thị thông báo lỗi
            document.getElementById("error-message").textContent = data.message;
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("error-message").textContent = "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!";
    }
});
