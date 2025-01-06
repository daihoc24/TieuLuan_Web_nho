document.addEventListener('DOMContentLoaded', function () {
    // Lấy user_id từ localStorage
    const user = JSON.parse(localStorage.getItem('user')); // Giả sử 'user' là key trong localStorage chứa user_id
    if (user) {
        const userId = user.id;
        // Gọi API để lấy thông tin tài khoản
        fetch(`http://localhost:3000/account?user_id=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.user_id) {
                    // Gán thông tin vào các phần tử trong trang HTML
                    document.getElementById('fullname').textContent = data.user_fullname;
                    document.getElementById('email').textContent = data.user_email;
                    document.getElementById('address').textContent = data.user_address;
                    document.getElementById('phone').textContent = data.user_phone;
                    document.getElementById('birthdate').textContent = data.user_birthDate;
                } else {
                    alert("Không tìm thấy tài khoản!");
                }
            })
            .catch(error => {
                console.error('Lỗi khi lấy thông tin tài khoản:', error);
                alert("Có lỗi xảy ra khi lấy thông tin tài khoản.");
            });
    } else {
        alert("Không tìm thấy thông tin người dùng trong localStorage!");
    }

    // Lấy các phần tử DOM
    const changeInfoBtn = document.getElementById('changeInfoBtn'); // Nút thay đổi thông tin
    const changeInfoModal = document.getElementById('changeInfoModal'); // Modal
    const closeModal = document.getElementById('closeModal'); // Nút đóng modal
    const changeInfoForm = document.getElementById('changeInfoForm'); // Form trong modal

    // Mở modal và điền thông tin hiện tại vào form
    changeInfoBtn.onclick = function () {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const userId = user.id;
            // Lấy thông tin hiện tại của người dùng từ API
            fetch(`http://localhost:3000/account?user_id=${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.user_id) {
                        // Gán giá trị vào các input trong modal
                        document.getElementById('modalFullname').value = data.user_fullname;
                        document.getElementById('modalEmail').value = data.user_email;
                        document.getElementById('modalAddress').value = data.user_address || '';
                        document.getElementById('modalPhone').value = data.user_phone || '';
                        document.getElementById('modalBirthday').value = data.user_birthDate || '';
                        changeInfoModal.classList.add('show'); // Hiển thị modal
                    } else {
                        alert("Không tìm thấy tài khoản!");
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi lấy thông tin tài khoản:', error);
                    alert("Có lỗi xảy ra khi lấy thông tin tài khoản.");
                });
        } else {
            alert("Không tìm thấy thông tin người dùng trong localStorage!");
        }
    }

    // Đóng modal khi click vào nút đóng
    closeModal.onclick = function () {
        changeInfoModal.classList.remove('show');
    }

    // Đóng modal khi click ra ngoài modal
    window.onclick = function (event) {
        if (event.target === changeInfoModal) {
            changeInfoModal.classList.remove('show');
        }
    }

    // Cập nhật thông tin người dùng khi form được submit
    if (changeInfoForm) {
        changeInfoForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Ngừng gửi form mặc định

            const updatedInfo = {
                email: document.getElementById('modalEmail').value,
                fullname: document.getElementById('modalFullname').value,
                address: document.getElementById('modalAddress').value,
                phone: document.getElementById('modalPhone').value,
                birthday: document.getElementById('modalBirthday').value,
            };

            const userId = user.id; // Lấy userId từ localStorage

            // Gửi yêu cầu cập nhật thông tin
            fetch(`http://localhost:3000/account?user_id=${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedInfo)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert("Cập nhật thông tin thành công!");
                        changeInfoModal.classList.remove('show'); // Đóng modal sau khi cập nhật
                    } else {
                        alert("Cập nhật thông tin thất bại.");
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi cập nhật thông tin:', error);
                    alert("Có lỗi xảy ra khi cập nhật thông tin.");
                });
        });
    }
});
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePasswordModal = document.getElementById('changePasswordModal');
const closePasswordModal = document.getElementById('closePasswordModal');

// Mở modal đổi mật khẩu
changePasswordBtn.onclick = function () {
    changePasswordModal.classList.add('show');
}

// Đóng modal đổi mật khẩu
closePasswordModal.onclick = function () {
    changePasswordModal.classList.remove('show');
}

// Đóng modal khi click ra ngoài modal
window.onclick = function (event) {
    if (event.target === changePasswordModal) {
        changePasswordModal.classList.remove('show');
    }
}

// Lấy phần tử form và các input cho việc thay đổi mật khẩu
const changePasswordForm = document.getElementById('changePasswordForm'); // Form thay đổi mật khẩu
const currentPasswordInput = document.getElementById('currentPassword'); // Mật khẩu hiện tại
const newPasswordInput = document.getElementById('newPassword'); // Mật khẩu mới
const confirmPasswordInput = document.getElementById('confirmPassword'); // Mật khẩu xác nhận

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Ngừng gửi form mặc định

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Kiểm tra nếu mật khẩu mới và mật khẩu xác nhận không khớp
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới và mật khẩu xác nhận không khớp!");
            return;
        }

        // Lấy userId từ localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const userId = user.id;

            // Gửi yêu cầu đổi mật khẩu
            fetch(`http://localhost:3000/account/password?user_id=${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert("Đổi mật khẩu thành công!");
                        changePasswordModal.classList.remove('show'); // Đóng modal sau khi đổi mật khẩu
                    } else {
                        alert("Đổi mật khẩu thất bại.");
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi đổi mật khẩu:', error);
                    alert("Có lỗi xảy ra khi đổi mật khẩu.");
                });
        } else {
            alert("Không tìm thấy thông tin người dùng trong localStorage!");
        }
    });
}
