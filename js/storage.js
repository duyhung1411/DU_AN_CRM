const Storage = {
    // Orders
    getOrders: function() {
        const data = localStorage.getItem('orders');
        return data ? JSON.parse(data) : [];
    },
    saveOrders: function(orders) {
        localStorage.setItem('orders', JSON.stringify(orders));
    },

    // Customers
    getCustomers: function() {
        const data = localStorage.getItem('customers');
        return data ? JSON.parse(data) : [
            { id: 'KH1001', name: 'Trần Văn B', phone: '0123456789', email: 'b@example.com', address: 'Hà Nội' },
            { id: 'KH1002', name: 'Nguyễn Thị C', phone: '0987654321', email: 'c@example.com', address: 'HCM' },
            { id: 'KH1003', name: 'Lê Văn D', phone: '0369852147', email: 'd@example.com', address: 'Đà Nẵng' }
        ];
    },
    saveCustomers: function(customers) {
        localStorage.setItem('customers', JSON.stringify(customers));
    },

    // Products (Đã cập nhật icon trực quan)
    getProducts: function() {
        const data = localStorage.getItem('products');
        return data ? JSON.parse(data) : [
            { id: 'SP001', name: 'Laptop Dell Inspiron 15', category: 'Laptop', price: 16990000, importPrice: 15000000, stock: 15, status: 'Còn hàng', icon: '💻' },
            { id: 'SP002', name: 'Chuột không dây Logitech', category: 'Phụ kiện', price: 450000, importPrice: 350000, stock: 50, status: 'Còn hàng', icon: '🔌' },
            { id: 'SP003', name: 'Tai nghe Bluetooth Sony', category: 'Âm thanh', price: 1250000, importPrice: 1000000, stock: 8, status: 'Sắp hết hàng', icon: '🎧' },
            { id: 'SP004', name: 'Máy ảnh Canon EOS R50', category: 'Máy ảnh', price: 14900000, importPrice: 13500000, stock: 0, status: 'Hết hàng', icon: '📷' }
        ];
    },
    saveProducts: function(products) {
        localStorage.setItem('products', JSON.stringify(products));
    }
};