// Số lượng người dùng trên mỗi trang
const USERS_PER_PAGE = 10;

// Dữ liệu người dùng (giả sử từ API)
let users = [];
let currentPage = 1;

document.getElementById('home-button').addEventListener('click', () => {
    window.location.href = '/html/home.html';
});

document.getElementById('add-user-button').addEventListener('click', () => {
    window.location.href = '/html/addUser.html';
});
// Hàm để hiển thị dữ liệu người dùng
function renderUsers(page) {
    const userTableBody = document.querySelector('#user-table tbody');
    userTableBody.innerHTML = ''; // Xóa nội dung hiện tại trong bảng

    const startIndex = (page - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const currentUsers = users.slice(startIndex, endIndex);

    currentUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.user_id}</td>
            <td>${user.user_fullname}</td>
            <td>${user.user_email}</td>
            <td>${user.user_address}</td>
            <td>${user.user_phone}</td>
            <td>${user.user_birthDate}</td>
            <td>${user.user_role}</td>
            <td>
                <button class="action-btn" onclick="window.location.href='/html/updateUser.html?id=${user.user_id}'">Update</button>
                <button class="action-btn delete-btn" onclick="handleDeleteUser(${user.user_id})">Delete</button>
            </td>
        `;
        userTableBody.appendChild(row);
    });
}

// Hàm xóa người dùng
async function handleDeleteUser(userId) {
    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa người dùng này?');

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/deleteUser/${userId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchUsers(); // Cập nhật lại danh sách người dùng sau khi xóa
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        alert('Lỗi khi xóa người dùng');
    }
}


// Hàm để tạo các nút phân trang
function renderPagination(totalUsers) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

    const createButton = (text, page, disabled = false, active = false) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.disabled = disabled;
        button.classList.toggle('active', active);
        button.onclick = () => {
            currentPage = page;
            renderUsers(currentPage);
            renderPagination(totalUsers);
        };
        return button;
    };

    // Nút "First"
    paginationContainer.appendChild(createButton('First', 1, currentPage === 1));

    // Nút "Previous"
    paginationContainer.appendChild(createButton('Previous', currentPage - 1, currentPage === 1));

    // Hiển thị số trang xung quanh trang hiện tại
    const visiblePages = 3; // Số trang hiển thị xung quanh
    for (let i = Math.max(1, currentPage - visiblePages); i <= Math.min(totalPages, currentPage + visiblePages); i++) {
        paginationContainer.appendChild(createButton(i, i, false, i === currentPage));
    }

    // Nút "Next"
    paginationContainer.appendChild(createButton('Next', currentPage + 1, currentPage === totalPages));

    // Nút "Last"
    paginationContainer.appendChild(createButton('Last', totalPages, currentPage === totalPages));
}

// Hàm fetch người dùng và khởi tạo hiển thị
async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/users');
        users = await response.json();

        renderUsers(currentPage);
        renderPagination(users.length);
    } catch (error) {
        console.error('Lỗi khi tải người dùng:', error);
    }
}

// Gọi hàm fetch người dùng khi tải trang
fetchUsers();
