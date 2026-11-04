/* ========================================================
   QUẢN LÝ LOGIC TRANG SẢN PHẨM (PRODUCT MODULE)
======================================================== */

let currentPage = 1;
const pageSize = 5; 
let editingProductId = null;

// Hàm tự động gán icon trực quan dựa theo danh mục sản phẩm
function getCategoryIcon(category) {
    switch (category) {
        case 'Laptop': return '💻';
        case 'Điện thoại': return '📱';
        case 'Phụ kiện': return '🔌';
        case 'Âm thanh': return '🎧';
        case 'Máy ảnh': return '📷';
        default: return '📦';
    }
}

// 1. Phân trang dữ liệu
function getPaginatedData(data, page, limit) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return data.slice(start, end);
}

function renderPagination(totalItems, page, limit) {
    const totalPages = Math.ceil(totalItems / limit);
    const paginationContainer = document.getElementById('paginationContainer');
    
    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button onclick="changePage(${page - 1})" ${page === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #64748b;">&lt;</button>`;

    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === page;
        html += `<button onclick="changePage(${i})" style="background: ${isActive ? '#3b82f6' : 'white'}; border: 1px solid ${isActive ? '#3b82f6' : '#cbd5e1'}; color: ${isActive ? 'white' : '#334155'}; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: ${isActive ? '600' : 'normal'};">${i}</button>`;
    }

    html += `<button onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #64748b;">&gt;</button>`;

    paginationContainer.innerHTML = html;
}

function changePage(newPage) {
    const filtered = getFilteredAndSortedProducts();
    const totalPages = Math.ceil(filtered.length / pageSize);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderProducts();
    }
}

// 2. Lọc và Tìm kiếm sản phẩm
function getFilteredAndSortedProducts() {
    let products = Storage.getProducts();

    // Lọc theo từ khóa tìm kiếm
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        const keyword = searchInput.value.trim().toLowerCase();
        products = products.filter(p => 
            p.name.toLowerCase().includes(keyword) || 
            p.id.toLowerCase().includes(keyword)
        );
    }

    // Lọc theo Danh mục
    const filterCategory = document.getElementById('filterCategory');
    if (filterCategory && filterCategory.value !== '') {
        products = products.filter(p => p.category === filterCategory.value);
    }

    // Lọc theo Trạng thái
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus && filterStatus.value !== '') {
        products = products.filter(p => p.status === filterStatus.value);
    }

    return products;
}

// 3. Render bảng sản phẩm chuẩn Figma với icon trực quan theo danh mục
function renderProducts() {
    const tableBody = document.getElementById('productTableBody');
    if (!tableBody) return; 

    const filteredProducts = getFilteredAndSortedProducts();
    tableBody.innerHTML = ''; 

    // Cập nhật lại số lượng động ở widget danh mục bên phải
    updateDashboardStats();
    updateCategoryCounts();

    if (filteredProducts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px; color: #64748b;">Không tìm thấy sản phẩm phù hợp.</td></tr>`;
        const paginationEl = document.getElementById('paginationContainer');
        if (paginationEl) paginationEl.innerHTML = '';
        return;
    }


    const paginatedProducts = getPaginatedData(filteredProducts, currentPage, pageSize);

    paginatedProducts.forEach((product, index) => {
        const realIndex = (currentPage - 1) * pageSize + index + 1;
        const formattedPrice = Number(product.price).toLocaleString('vi-VN') + ' ₫';
        
        let statusBadgeStyle = 'background: #dcfce7; color: #166534;'; 
        if (product.status === 'Sắp hết hàng') {
            statusBadgeStyle = 'background: #fef9c3; color: #854d0e;';
        } else if (product.status === 'Hết hàng') {
            statusBadgeStyle = 'background: #fee2e2; color: #991b1b;';
        }

        // Lấy icon trực quan theo danh mục
        const categoryIcon = getCategoryIcon(product.category);

        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #f1f5f9";
        
        tr.innerHTML = `
            <td style="padding: 12px 16px; color: #64748b;">${realIndex}</td>
            <td style="padding: 12px 16px;"><div style="width: 36px; height: 36px; background: #f1f5f9; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">${categoryIcon}</div></td>
            <td style="padding: 12px 16px; font-weight: 600; color: #1e293b;">${product.name}</td>
            <td style="padding: 12px 16px; color: #64748b;">${product.id}</td>
            <td style="padding: 12px 16px; color: #334155;">${product.category}</td>
            <td style="padding: 12px 16px; color: #10b981; font-weight: 600;">${formattedPrice}</td>
            <td style="padding: 12px 16px; color: #334155;">${product.stock}</td>
            <td style="padding: 12px 16px;"><span style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; ${statusBadgeStyle}">${product.status || 'Còn hàng'}</span></td>
            <td style="padding: 12px 16px; text-align: center;">
                <button onclick="editProduct('${product.id}')" style="background: #f0fdf4; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #10b981; margin-right: 6px;" title="Sửa">✏️</button>
                <button onclick="deleteProduct('${product.id}')" style="background: #fef2f2; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #ef4444;" title="Xóa">🗑️</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    renderPagination(filteredProducts.length, currentPage, pageSize);
}

// 4. Xử lý Đóng/Mở Modal
const productModal = document.getElementById('productModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalX = document.getElementById('closeModalX');

function openModal() {
    if (productModal) productModal.style.display = 'flex';
}

function closeModal() {
    if (productModal) productModal.style.display = 'none';
    const productForm = document.getElementById('productForm');
    if (productForm) productForm.reset();
    editingProductId = null;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.innerText = 'Thêm sản phẩm mới';
}

if (openModalBtn) openModalBtn.addEventListener('click', openModal);
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (closeModalX) closeModalX.addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
    if (event.target === productModal) closeModal();
});

function editProduct(id) {
    const products = Storage.getProducts();
    const product = products.find(p => p.id === id);

    if (product) {
        document.getElementById('prodId').value = product.id;
        document.getElementById('prodName').value = product.name;
        document.getElementById('prodCategory').value = product.category;
        document.getElementById('prodPrice').value = product.price;
        document.getElementById('prodImportPrice').value = product.importPrice || '';
        document.getElementById('prodStock').value = product.stock;
        document.getElementById('prodStatus').value = product.status || 'Còn hàng';
        
        editingProductId = id;
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.innerText = 'Cập nhật sản phẩm';
        openModal();
    }
}

function deleteProduct(id) {
    if (confirm(`⚠️ Bạn có chắc chắn muốn xóa sản phẩm này không?`)) {
        let products = Storage.getProducts();
        products = products.filter(p => p.id !== id);
        Storage.saveProducts(products);
        renderProducts();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderProducts === "function") renderProducts();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderProducts();
        });
    }

    // Lắng nghe sự kiện thay đổi bộ lọc danh mục
    const filterCategory = document.getElementById('filterCategory');
    if (filterCategory) {
        filterCategory.addEventListener('change', () => {
            currentPage = 1;
            renderProducts();
        });
    }

    // Lắng nghe sự kiện thay đổi bộ lọc trạng thái
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            currentPage = 1;
            renderProducts();
        });
    }

    // Bắt sự kiện submit form sản phẩm
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const id = document.getElementById('prodId').value.trim();
            const name = document.getElementById('prodName').value.trim();
            const category = document.getElementById('prodCategory').value;
            const price = parseFloat(document.getElementById('prodPrice').value);
            const importPrice = parseFloat(document.getElementById('prodImportPrice').value) || 0;
            const stock = parseInt(document.getElementById('prodStock').value) || 0;
            const status = document.getElementById('prodStatus').value;

            let products = Storage.getProducts();
            const isEditing = editingProductId !== null;

            if (isEditing) {
                const index = products.findIndex(p => p.id === editingProductId);
                if (index !== -1) {
                    products[index] = { id, name, category, price, importPrice, stock, status };
                }
            } else {
                if (products.some(p => p.id === id)) {
                    alert(`⚠️ Mã sản phẩm "${id}" đã tồn tại! Vui lòng nhập mã khác.`);
                    return;
                }
                products.push({ id, name, category, price, importPrice, stock, status });
            }

            Storage.saveProducts(products);
            
            const modal = document.getElementById('productModal');
            if (modal) modal.style.display = 'none';
            
            productForm.reset();
            editingProductId = null;
            renderProducts();

            setTimeout(() => {
                alert(isEditing ? '✅ Đã cập nhật sản phẩm thành công!' : '🎉 Đã thêm sản phẩm mới thành công!');
            }, 100);
        });
    }
});

// Hàm đếm và cập nhật số lượng sản phẩm cho từng danh mục ở cột phải
function updateCategoryCounts() {
    const products = Storage.getProducts();

    const counts = {
        Laptop: 0,
        'Điện thoại': 0,
        'Phụ kiện': 0,
        'Âm thanh': 0,
        'Máy ảnh': 0
    };

    products.forEach(p => {
        if (counts.hasOwnProperty(p.category)) {
            counts[p.category]++;
        }
    });

    // Đổ số lượng ra giao diện cột phải
    if (document.getElementById('countLaptop')) document.getElementById('countLaptop').innerText = counts['Laptop'];
    if (document.getElementById('countPhone')) document.getElementById('countPhone').innerText = counts['Điện thoại'];
    if (document.getElementById('countAccessory')) document.getElementById('countAccessory').innerText = counts['Phụ kiện'];
    if (document.getElementById('countAudio')) document.getElementById('countAudio').innerText = counts['Âm thanh'];
    if (document.getElementById('countCamera')) document.getElementById('countCamera').innerText = counts['Máy ảnh'];
}

// Hàm bấm vào tên danh mục ở cột phải thì tự động lọc bảng bên trái
function filterByCategory(categoryName) {
    const filterCategorySelect = document.getElementById('filterCategory');
    if (filterCategorySelect) {
        filterCategorySelect.value = categoryName;
        currentPage = 1;
        renderProducts();
    }
}

function updateDashboardStats() {
    const products = Storage.getProducts();

    // 1. Tổng số sản phẩm
    const totalProducts = products.length;

    // 2. Sản phẩm đang bán (Còn hàng)
    const sellingProducts = products.filter(p => p.status === 'Còn hàng').length;

    // 3. Sản phẩm sắp hết hàng
    const lowStockProducts = products.filter(p => p.status === 'Sắp hết hàng').length;

    // 4. Sản phẩm hết hàng (Thay thế cho tổng danh mục cũ)
    const outStockProducts = products.filter(p => p.status === 'Hết hàng').length;

    // Đổ dữ liệu ra giao diện 4 thẻ
    if (document.getElementById('statTotalProducts')) {
        document.getElementById('statTotalProducts').innerText = totalProducts;
    }
    if (document.getElementById('statSellingProducts')) {
        document.getElementById('statSellingProducts').innerText = sellingProducts;
    }
    if (document.getElementById('statLowStockProducts')) {
        document.getElementById('statLowStockProducts').innerText = lowStockProducts;
    }
    if (document.getElementById('statOutStockProducts')) {
        document.getElementById('statOutStockProducts').innerText = outStockProducts;
    }
}