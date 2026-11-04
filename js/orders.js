// js/orders.js

// Hàm vẽ danh sách kết hợp tính toán số liệu thống kê và định dạng bảng Table
function renderOrders(filterText = '') {
    const orderList = document.getElementById('orderList');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    
    const orders = Storage.getOrders();

    // 1. Cập nhật khối thống kê tổng quan (Dashboard Stats)
    const totalCount = orders.length;
    const revenueSum = orders.reduce((sum, order) => sum + order.price, 0);
    
    totalOrdersEl.textContent = totalCount;
    totalRevenueEl.textContent = revenueSum.toLocaleString('vi-VN') + ' đ';

    // 2. Lọc danh sách theo từ khóa tìm kiếm (nếu có)
    const filteredOrders = orders.filter(order => 
        order.customerName.toLowerCase().includes(filterText.toLowerCase())
    );

    orderList.innerHTML = '';

    if (filteredOrders.length === 0) {
        orderList.innerHTML = '<p style="text-align: center; color: #64748b; padding: 24px 0; font-size: 0.95rem;">Không tìm thấy đơn hàng phù hợp.</p>';
        return;
    }

    // 3. Xây dựng cấu trúc Bảng (Table) chuẩn doanh nghiệp
    let tableHTML = `
        <table class="custom-table">
            <thead>
                <tr>
                    <th>Khách hàng</th>
                    <th>Mã Đơn Hàng</th>
                    <th>Ngày tạo</th>
                    <th>Giá trị</th>
                    <th style="text-align: right;">Thao tác</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredOrders.forEach(order => {
        tableHTML += `
            <tr>
                <td><strong style="color: #0f172a;">${order.customerName}</strong></td>
                <td><span style="font-family: monospace; color: #64748b;">#${order.id}</span></td>
                <td>${order.date}</td>
                <td><span style="color: #4361ee; font-weight: 600;">${order.price.toLocaleString('vi-VN')} đ</span></td>
                <td style="text-align: right;">
                    <button onclick="deleteOrder(${order.id})" style="background-color: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.2s;">Xóa</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    orderList.innerHTML = tableHTML;
}

// Hàm Xóa đơn hàng theo ID
function deleteOrder(id) {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
        let orders = Storage.getOrders();
        orders = orders.filter(order => order.id !== id);
        Storage.saveOrders(orders);
        // Lấy lại giá trị ô tìm kiếm để giữ nguyên trạng thái filter khi xóa
        const searchVal = document.getElementById('searchInput').value;
        renderOrders(searchVal);
    }
}

// Lắng nghe sự kiện khi trang vừa tải xong và gắn bắt sự kiện gõ phím tìm kiếm
document.addEventListener('DOMContentLoaded', () => {
    renderOrders();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderOrders(e.target.value);
        });
    }
});