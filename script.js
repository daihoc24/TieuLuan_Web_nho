document.addEventListener('DOMContentLoaded', function () {
  // Nhúng header từ tệp components/header.html
  fetch('../Header/header.html')
    .then(response => response.text())
    .then(data => {
      // Chèn nội dung vào phần tử có id="header"
      document.getElementById('header').innerHTML = data;

      const userIcon = document.querySelector('.user-icon');
      const accountOptions = document.getElementById('account_option');

      // Kiểm tra xem phần tử có tồn tại không
      if (userIcon) {
        // Thêm sự kiện click vào biểu tượng người dùng để ẩn/hiện danh sách
        userIcon.addEventListener('click', function () {
          if (accountOptions.style.display === 'none' || accountOptions.style.display === '') {
            // Hiển thị danh sách tài khoản
            accountOptions.style.display = 'block';
          } else {
            // Ẩn danh sách tài khoản
            accountOptions.style.display = 'none';
          }
        });
      }
      const user = localStorage.getItem('user');
      if (user) {
        // Nếu đã đăng nhập, ẩn "Đăng nhập" và hiện "Đăng xuất"
        document.getElementById('login').style.display = 'none';
        document.getElementById('logout').style.display = 'block';

        // Thêm sự kiện đăng xuất
        document.getElementById('logout').addEventListener('click', function () {
          // Xóa user khỏi localStorage
          localStorage.removeItem('user');

          // Cập nhật giao diện lại
          document.getElementById('login').style.display = 'block';
          document.getElementById('logout').style.display = 'none';

          // Tùy chọn: chuyển hướng về trang đăng nhập hoặc trang chủ
          window.location.href = "/html/home.html";  // Hoặc trang chủ
        });
      } else {
        // Nếu chưa đăng nhập, ẩn "Đăng xuất" và hiện "Đăng nhập"
        document.getElementById('login').style.display = 'block';
        document.getElementById('logout').style.display = 'none';
      }
    })


    .catch(error => console.error('Lỗi khi tải header:', error));

  // Nhúng footer từ tệp components/footer.html
  fetch('../Footer/footer.html')
    .then(response => response.text())
    .then(data => {
      // Chèn nội dung vào phần tử có id="footer"
      document.getElementById('footer').innerHTML = data;
    })
    .catch(error => console.error('Lỗi khi tải footer:', error));
});
