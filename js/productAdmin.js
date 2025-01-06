// Số lượng sản phẩm trên mỗi trang
const PRODUCTS_PER_PAGE = 10;

// Dữ liệu sản phẩm (ví dụ từ API)
let products = [];
let currentPage = 1;
let selectedFiles = {};

// Xử lý khi nhấn nút "Home"
document.getElementById('home-button').addEventListener('click', () => {
    window.location.href = '/html/home.html';
});

// Xử lý khi nhấn nút "Thêm sản phẩm"
document.getElementById('add-product-button').addEventListener('click', () => {
    window.location.href = '/html/addProduct.html';
});

// Hàm để hiển thị dữ liệu sản phẩm
function renderProducts(page) {
    const productTableBody = document.querySelector('#product-table tbody');
    productTableBody.innerHTML = '';

    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const currentProducts = products.slice(startIndex, endIndex);

    currentProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.products_id}</td>
            <td><img src="${product.products_image}" alt="${product.products_name}" style="width: 50px; height: 50px;"></td>
            <td>${product.products_name}</td>
            <td>${product.products_type}</td>
            <td>${product.products_price} VND</td>
            <td>${product.quantitySold || 0}</td>
            <td>
                <button class="action-btn" onclick="window.location.href='/html/updateProduct.html?id=${product.products_id}'">Update</button>
                <button class="action-btn delete-btn" onclick="handleDelete(${product.products_id})">Delete</button>
                <div>
                    <input type="file" id="fileInput-${product.products_id}" accept="image/*" style="display: none;" onchange="handleFileChange(event, ${product.products_id})">
                    <button class="action-btn choose-file-btn" style="margin-top: 5px" onclick="document.getElementById('fileInput-${product.products_id}').click()">Choose File</button>
                </div>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

// Hàm xóa sản phẩm
async function handleDelete(productId) {
    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa sản phẩm này?');

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/deleteProduct/${productId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchProducts(); // Cập nhật lại danh sách sản phẩm sau khi xóa
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        alert('Lỗi khi xóa sản phẩm');
    }
}

// Hàm để tạo các nút phân trang
function renderPagination(totalProducts) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

    const createButton = (text, page, disabled = false, active = false) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.disabled = disabled;
        button.classList.toggle('active', active);
        button.onclick = () => {
            currentPage = page;
            renderProducts(currentPage);
            renderPagination(totalProducts);
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

// Hàm fetch sản phẩm và khởi tạo hiển thị
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        products = await response.json();

        renderProducts(currentPage);
        renderPagination(products.length);
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
    }
}

// Hàm xử lý thay đổi file
function handleFileChange(event, productId) {
    const file = event.target.files[0];
    if (file) {
        selectedFiles[productId] = file;
    }
}

async function handleUploadAll() {
    for (const productId in selectedFiles) {
        const file = selectedFiles[productId];
        const formData = new FormData();
        formData.append('file', file);  // Chỉnh sửa tên trường từ 'image' thành 'file'

        try {
            const response = await fetch(`http://localhost:3000/upload-productImg/${productId}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Cập nhật hình ảnh thành công cho sản phẩm ${productId}`);
            } else {
                alert(data.message || 'Lỗi khi tải lên hình ảnh');
            }
        } catch (error) {
            console.error(`Lỗi khi tải lên hình ảnh cho sản phẩm ${productId}:`, error);
            alert('Lỗi khi tải lên hình ảnh');
        }
    }
}


// Gọi hàm fetch sản phẩm khi tải trang
fetchProducts();
