const pageSize = 24; // Số sản phẩm mỗi trang
let currentPage = 1;
let selectedType = "";
let searchTerm = "";
let products = [];

// Hàm định dạng giá tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Lấy dữ liệu từ file product.json
const fetchProducts = async () => {
  try {
    const response = await fetch("../product.json"); // Đảm bảo đường dẫn đúng
    const data = await response.json();
    products = data; // Gán dữ liệu vào biến global
    renderProducts();
    setupPagination();
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

// Hàm hiển thị sản phẩm
const renderProducts = () => {
  const productListContainer = document.getElementById("product-list");

  // Lọc sản phẩm theo loại và tìm kiếm
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.products_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || product.products_type === selectedType;

    return matchesSearch && matchesType;
  });

  // Lấy sản phẩm của trang hiện tại
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Render sản phẩm
  productListContainer.innerHTML = "";
  currentProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("card");
    productCard.innerHTML = `
      <img src="${product.products_image}" alt="${product.products_name}" />
      <div class="card-body">
        <h5>${product.products_name}</h5>
        <h5 class="price">${formatPrice(product.products_price)}</h5>
        <div class="d-flex justify-content-center align-items-center mt-5 ">
                <a href="detail.html?products_id=${product.products_id}" class="product-link">
                  <button class="detail">Xem chi tiết</button>
                </a>
          </div>
      </div>
      

    `;
    productListContainer.appendChild(productCard);
  });
};

// Cập nhật trang
const setupPagination = () => {
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.products_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || product.products_type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;

  // Xử lý nút Prev
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
      setupPagination();
    }
  };

  // Xử lý nút Next
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts();
      setupPagination();
    }
  };
};

// Lọc sản phẩm theo loại
const handleTypeChange = (event) => {
  selectedType = event.target.value;
  currentPage = 1; // Quay về trang đầu
  renderProducts();
  setupPagination();
};

// Tìm kiếm sản phẩm
const handleSearchChange = (event) => {
  searchTerm = event.target.value;
  currentPage = 1; // Quay về trang đầu
  renderProducts();
  setupPagination();
};

// Lắng nghe sự kiện thay đổi loại sản phẩm
document.getElementById("type-filter").addEventListener("change", handleTypeChange);

// Lắng nghe sự kiện thay đổi tìm kiếm
document.getElementById("search").addEventListener("input", handleSearchChange);

// Fetch dữ liệu khi trang được tải
window.onload = fetchProducts;
