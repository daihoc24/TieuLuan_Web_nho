document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Ngừng hành động mặc định của form (không reload trang)

        // Lấy dữ liệu từ form
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const fullname = document.getElementById("fullname").value;
        const address = document.getElementById("address").value;
        const phone = document.getElementById("phone").value;
        const birthdate = document.getElementById("birthdate").value;

        // Kiểm tra dữ liệu
        if (!email || !password || !fullname || !address || !phone || !birthdate) {
            return showError("Tất cả các trường là bắt buộc!");
        }

        // Gửi dữ liệu đến server
        try {
            const response = await fetch("http://localhost:3000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                    fullname,
                    address,
                    phone,
                    birthdate,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
                window.location.href = "/html/login.html"; // Chuyển hướng đến trang đăng nhập
            } else {
                showError(result.message || "Có lỗi xảy ra khi đăng ký.");
            }
        } catch (error) {
            showError("Có lỗi kết nối với server.");
        }
    });

    // Hiển thị thông báo lỗi
    function showError(message) {
        const errorMessage = document.getElementById("error-message");
        errorMessage.textContent = message;
        errorMessage.style.color = "red";
    }
});
