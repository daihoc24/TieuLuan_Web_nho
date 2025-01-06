// Lấy userId từ URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

// Kiểm tra nếu không có userId trong URL
if (!userId) {
    alert("Không tìm thấy ID người dùng trong URL.");
    throw new Error("ID người dùng không được cung cấp.");
}

// Hàm tải thông tin người dùng từ server
async function loadUserDetails() {
    try {
        // Gửi yêu cầu lấy thông tin người dùng
        const response = await fetch(`http://localhost:3000/user/${userId}`);
        if (!response.ok) {
            throw new Error("Không tìm thấy người dùng hoặc lỗi từ server.");
        }

        const user = await response.json();

        // Gán thông tin người dùng vào các trường trong form
        document.getElementById("userName").value = user.user_fullname || "";
        document.getElementById("userEmail").value = user.user_email || "";
        document.getElementById("userAddress").value = user.user_address || "";
        document.getElementById("userPhone").value = user.user_phone || "";
        document.getElementById("userDob").value = user.user_birthDate || "";
        document.getElementById("userRole").value = user.user_role || "";
    } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
        alert("Không thể tải thông tin người dùng. Vui lòng thử lại!");
    }
}

// Hàm xử lý cập nhật người dùng
async function handleUpdateUser() {
    const userFullname = document.getElementById("userName").value;
    const userEmail = document.getElementById("userEmail").value;
    const userAddress = document.getElementById("userAddress").value;
    const userPhone = document.getElementById("userPhone").value;
    const userDob = document.getElementById("userDob").value;
    const userRole = document.getElementById("userRole").value;

    // Kiểm tra dữ liệu đầu vào
    if (!userFullname || !userEmail || !userAddress || !userPhone || !userDob || !userRole) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Tạo đối tượng dữ liệu để gửi lên server
    const updatedUser = {
        userEmail: userEmail.trim(),
        userFullname: userFullname.trim(),
        userAddress: userAddress.trim(),
        userPhone: userPhone.trim(),
        userDob: userDob.trim(),
        userRole: userRole.trim(),
    };

    try {
        // Gửi yêu cầu PUT đến API để cập nhật người dùng
        const response = await fetch(`http://localhost:3000/updateUser/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUser),
        });

        // Xử lý phản hồi từ server
        if (response.ok) {
            const result = await response.json();
            window.location.href = "./userAdmin.html";
            alert("Cập nhật người dùng thành công!");
            console.log("Người dùng đã được cập nhật:", result);
        } else {
            const error = await response.json();
            alert(`Lỗi: ${error.message}`);
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        alert("Không thể cập nhật người dùng. Vui lòng thử lại!");
    }
}
// Gắn sự kiện click vào nút cập nhật
document.getElementById("updateButton").addEventListener("click", handleUpdateUser);

// Tải thông tin người dùng khi trang được load
loadUserDetails();
