// js/api.js
async function fetchExchangeRate() {
    const rateText = document.getElementById('rateText');
    rateText.textContent = '⏳ Đang tải tỷ giá...';
    
    try {
        // Gọi API công khai lấy tỷ giá ngoại tệ từ USD sang VND
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data && data.rates && data.rates.VND) {
            const vndRate = data.rates.VND;
            // Hiển thị kết quả format đẹp mắt
            rateText.textContent = `1 USD = ${vndRate.toLocaleString('vi-VN')} VND`;
        } else {
            rateText.textContent = '⚠️ Không lấy được tỷ giá';
        }
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        rateText.textContent = '❌ Lỗi kết nối mạng';
    }
}

// Tự động gọi khi trang web vừa tải xong
document.addEventListener('DOMContentLoaded', () => {
    fetchExchangeRate();
    
    // Gắn sự kiện cho nút "Cập nhật ngay"
    const refreshBtn = document.getElementById('refreshRate');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchExchangeRate);
    }
});