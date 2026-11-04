/* ========================================================
   PHẦN 1: CÁC HÀM TIỆN ÍCH DÙNG CHUNG (UTILITY FUNCTIONS)
======================================================== */
function formatCurrency(number) {
    if (!number) return "0 đ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function generateId(prefix) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNum}`;
}

function getStatusBadge(status) {
    let bgColor = "", textColor = "";
    switch (status) {
        case 'Còn hàng': case 'Hoạt động': case 'Đã thanh toán': case 'Đã giao':
            bgColor = "#d1fae5"; textColor = "#065f46"; break;
        case 'Sắp hết hàng': case 'Chờ xử lý': case 'pending': case 'Chờ xác nhận':
            bgColor = "#fef3c7"; textColor = "#b45309"; break;
        case 'Hết hàng': case 'Đã hủy': case 'Tạm khóa':
            bgColor = "#fee2e2"; textColor = "#991b1b"; break;
        default:
            bgColor = "#e2e8f0"; textColor = "#475569";
    }
    return `<span style="background: ${bgColor}; color: ${textColor}; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">${status}</span>`;
}


/* ========================================================
   PHẦN 2: CẤU HÌNH PHÂN TRANG TỔNG QUÁT (PAGINATION ENGINE)
======================================================== */
let currentPage = 1;
const pageSize = 5; 

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

    // Nút lùi (<)
    html += `<button onclick="changePage(${page - 1})" ${page === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #64748b;">&lt;</button>`;

    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
        html += `<button onclick="changePage(1)" style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer;">1</button>`;
        if (startPage > 2) html += `<span style="padding: 0 4px; color: #64748b;">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === page;
        html += `<button onclick="changePage(${i})" style="background: ${isActive ? '#3b82f6' : 'white'}; border: 1px solid ${isActive ? '#3b82f6' : '#cbd5e1'}; color: ${isActive ? 'white' : '#334155'}; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: ${isActive ? '600' : 'normal'};">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span style="padding: 0 4px; color: #64748b;">...</span>`;
        html += `<button onclick="changePage(${totalPages})" style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer;">${totalPages}</button>`;
    }

    // Nút tiến (>)
    html += `<button onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #64748b;">&gt;</button>`;

    paginationContainer.innerHTML = html;
}

function changePage(newPage) {
    const filteredOrders = getFilteredAndSortedOrders();
    const totalPages = Math.ceil(filteredOrders.length / pageSize);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderOrders();
    }
}


/* ========================================================
   PHẦN 3: TỐI ƯU TÌM KIẾM VÀ LỌC (SEARCH, FILTER & SORT)
======================================================== */
function getFilteredAndSortedOrders() {
    let orders = Storage.getOrders();

    // 1. Lọc chuẩn xác bằng id="searchInput"
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        const keyword = searchInput.value.trim().toLowerCase();
        orders = orders.filter(o => 
            o.id.toLowerCase().includes(keyword) || 
            o.customerName.toLowerCase().includes(keyword)
        );
    }

    // 2. Lọc theo trạng thái và sắp xếp từ các thẻ select
    const filterSelects = document.querySelectorAll('.order-management-container select');
    if (filterSelects && filterSelects.length >= 1) {
        const statusFilter = filterSelects[0].value;
        if (statusFilter && statusFilter !== 'Tất cả') {
            orders = orders.filter(o => o.status === statusFilter || (statusFilter === 'Đang xử lý' && o.status === 'pending'));
        }
    }

    if (filterSelects && filterSelects.length >= 2) {
        const sortOption = filterSelects[1].value;
        if (sortOption === 'Mới nhất') {
            orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortOption === 'Giá trị cao nhất') {
            orders.sort((a, b) => b.price - a.price);
        }
    }

    return orders;
}


/* ========================================================
   PHẦN 4: XỬ LÝ LOGIC TRANG ĐƠN HÀNG (CRUD + RENDER)
======================================================== */
const orderForm = document.getElementById('orderForm');
let editingOrderId = null; 

if (orderForm) {
    orderForm.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const cusName = document.getElementById('cusName').value;
        const orderValue = document.getElementById('orderValue').value;
        
        let currentOrders = Storage.getOrders();

        if (editingOrderId) {
            const orderIndex = currentOrders.findIndex(o => o.id === editingOrderId);
            if (orderIndex !== -1) {
                currentOrders[orderIndex].customerName = cusName;
                currentOrders[orderIndex].price = parseInt(orderValue);
            }
            alert(`✅ Đã cập nhật thành công đơn hàng: ${editingOrderId}`);
            
            editingOrderId = null; 
            orderForm.querySelector('button[type="submit"]').innerHTML = '+ Lưu đơn hàng';
            orderForm.querySelector('button[type="submit"]').style.backgroundColor = '#3b82f6';
        } else {
            const newOrder = {
                id: generateId('DH'), 
                customerName: cusName,
                price: parseInt(orderValue),
                status: 'pending',
                date: new Date().toISOString()
            };
            currentOrders.push(newOrder);
            alert(`🎉 Đã thêm thành công đơn hàng của: ${cusName}`);
        }

        Storage.saveOrders(currentOrders);
        orderForm.reset();
        renderOrders();
    });
}

function renderOrders() {
    const tableBody = document.getElementById('orderTableBody');
    if (!tableBody) return; 

    const filteredOrders = getFilteredAndSortedOrders();
    tableBody.innerHTML = ''; 

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">Không tìm thấy đơn hàng phù hợp.</td></tr>`;
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const paginatedOrders = getPaginatedData(filteredOrders, currentPage, pageSize);

    paginatedOrders.forEach((order, index) => {
        const realIndex = (currentPage - 1) * pageSize + index + 1;
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #f1f5f9";
        
        tr.innerHTML = `
            <td style="padding: 12px; color: #64748b;">${realIndex}</td>
            <td style="padding: 12px; font-weight: 600; color: #1e293b;">${order.id}</td>
            <td style="padding: 12px; font-weight: 500;">${order.customerName}</td>
            <td style="padding: 12px; font-weight: 600; color: #ef4444;">${formatCurrency(order.price)}</td>
            <td style="padding: 12px; color: #64748b;">${formatDate(order.date)}</td>
            <td style="padding: 12px;">${getStatusBadge(order.status)}</td>
            <td style="padding: 12px; text-align: center;">
                <button onclick="editOrder('${order.id}')" style="background: #f0fdf4; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; color: #10b981; margin-right: 4px;" title="Sửa">✏️</button>
                <button onclick="deleteOrder('${order.id}')" style="background: #fef2f2; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; color: #ef4444;" title="Xóa">🗑️</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    renderPagination(filteredOrders.length, currentPage, pageSize);
}

function editOrder(id) {
    const currentOrders = Storage.getOrders();
    const orderToEdit = currentOrders.find(o => o.id === id);
    
    if (orderToEdit) {
        document.getElementById('cusName').value = orderToEdit.customerName;
        document.getElementById('orderValue').value = orderToEdit.price;
        editingOrderId = id;
        
        const submitBtn = orderForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '💾 Cập nhật đơn hàng';
        submitBtn.style.backgroundColor = '#10b981';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function deleteOrder(id) {
    if (confirm(`⚠️ Bạn có chắc chắn muốn xóa đơn hàng ${id} không?`)) {
        let currentOrders = Storage.getOrders();
        currentOrders = currentOrders.filter(order => order.id !== id);
        Storage.saveOrders(currentOrders);
        renderOrders();
    }
}

// Lắng nghe sự kiện tìm kiếm bằng id="searchInput"
document.addEventListener('DOMContentLoaded', () => {
    if(typeof renderOrders === "function") renderOrders();

    const searchInput = document.getElementById('searchInput');
    const filterSelects = document.querySelectorAll('.order-management-container select');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1; 
            renderOrders();
        });
    }

    if (filterSelects.length >= 2) {
        filterSelects[0].addEventListener('change', () => {
            currentPage = 1;
            renderOrders();
        }); 
        filterSelects[1].addEventListener('change', () => {
            currentPage = 1;
            renderOrders();
        }); 
    }
});