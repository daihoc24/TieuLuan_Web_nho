// adminGuard.js
function adminGuard() {
    // Lấy thông tin user từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));
  
    if (!user) {
      // Nếu chưa đăng nhập, chuyển hướng về trang chủ
      alert("Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.");
      window.location.href = "./home.html"; // Thay bằng đường dẫn trang chủ của bạn
    } else if (user.role !== "admin") {
      // Nếu không phải admin, chuyển hướng về trang chủ
      alert("Bạn không có quyền truy cập vào trang này.");
      window.location.href = "./home.html"; // Thay bằng đường dẫn trang chủ của bạn
    }
  }
  
  // Gọi hàm adminGuard khi trang được load
  adminGuard();
  