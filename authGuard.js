// authGuard.js
function authGuard() {
    // Lấy thông tin user từ localStorage
    const user = localStorage.getItem("user");
  
    if (!user) {
      // Nếu chưa đăng nhập, chuyển hướng về trang chủ
      alert("Bạn chưa đăng nhập! Vui lòng đăng nhập để tiếp tục.");
      window.location.href = "./home.html"; // Thay bằng đường dẫn trang chủ của bạn
    }
  }
  
  // Gọi hàm authGuard khi trang được load
  authGuard();
  