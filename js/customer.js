/* ========================================================
   QUẢN LÝ LOGIC TRANG KHÁCH HÀNG (CUSTOMER MODULE)
======================================================== */

let currentPage = 1;
const pageSize = 5; 

// ==========================================
// 1. Phân trang engine
// ==========================================
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

    html += `<button onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} style="background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; color: #64748b;">&gt;</button>`;

    paginationContainer.innerHTML = html;
}

function changePage(newPage) {
    const filtered = getFilteredAndSortedCustomers();
    const totalPages = Math.ceil(filtered.length / pageSize);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderCustomers();
    }
}

// ==========================================
// 2. Tìm kiếm và Sắp xếp
// ==========================================
function getFilteredAndSortedCustomers() {
    let customers = Storage.getCustomers ? Storage.getCustomers() : [];

    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        const keyword = searchInput.value.trim().toLowerCase();
        customers = customers.filter(c => 
            (c.name && c.name.toLowerCase().includes(keyword)) || 
            (c.phone && c.phone.toLowerCase().includes(keyword))
        );
    }

    const filterSelects = document.querySelectorAll('.customer-management-container select');
    if (filterSelects && filterSelects.length >= 2) {
        const sortOption = filterSelects[1].value;
        if (sortOption.includes('Gần đây nhất')) {
            customers.reverse();
        } else if (sortOption.includes('Tên A-Z')) {
            customers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        }
    }

    return customers;
}

// ==========================================
// 3. Render bảng khách hàng
// ==========================================
function renderCustomers() {
    const tableBody = document.getElementById('customerTableBody');
    if (!tableBody) return; 

    const filteredCustomers = getFilteredAndSortedCustomers();
    tableBody.innerHTML = ''; 

    if (filteredCustomers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">Không tìm thấy khách hàng phù hợp.</td></tr>`;
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const paginatedCustomers = getPaginatedData(filteredCustomers, currentPage, pageSize);

    paginatedCustomers.forEach((customer, index) => {
        const realIndex = (currentPage - 1) * pageSize + index + 1;
        const tr = document.createElement('tr');
        tr.style.borderBottom = "1px solid #f1f5f9";
        
        tr.innerHTML = `
            <td style="padding: 14px 16px; color: #64748b;">${realIndex}</td>
            <td style="padding: 14px 16px; font-weight: 600; color: #1e293b;">${customer.name || ''}</td>
            <td style="padding: 14px 16px; color: #334155;">${customer.phone || ''}</td>
            <td style="padding: 14px 16px; color: #334155; text-align: left; line-height: 1.4;">${customer.address || 'Chưa cập nhật'}</td>
            <td style="padding: 14px 16px; text-align: center;">
                <button type="button" onclick="openEditModal('${customer.id || customer.phone}')" style="background: #f0fdf4; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #10b981; margin-right: 6px;" title="Sửa">✏️</button>
                <button type="button" onclick="deleteCustomer('${customer.id || customer.phone}')" style="background: #fef2f2; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #ef4444;" title="Xóa">🗑️</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    renderPagination(filteredCustomers.length, currentPage, pageSize);
}

// ==========================================
// 4. Các hàm Thao tác: Sửa, Xóa & Cập nhật
// ==========================================
window.openEditModal = function(identifier) {
    const customers = Storage.getCustomers ? Storage.getCustomers() : [];
    const customer = customers.find(c => c.id === identifier || c.phone === identifier);

    if (customer) {
        document.getElementById('editCusId').value = identifier;
        document.getElementById('editCusName').value = customer.name || '';
        document.getElementById('editCusPhone').value = customer.phone || '';
        
        // Reset dropdowns and input
        document.getElementById('editStreet').value = customer.address || '';
        document.getElementById('editProvince').value = '';
        document.getElementById('editDistrict').innerHTML = '<option value="">-- Quận / Huyện --</option>';
        document.getElementById('editDistrict').disabled = true;
        document.getElementById('editDistrict').style.background = '#f1f5f9';
        document.getElementById('editWard').innerHTML = '<option value="">-- Phường / Xã --</option>';
        document.getElementById('editWard').disabled = true;
        document.getElementById('editWard').style.background = '#f1f5f9';
        updateEditFullAddress();
        
        const modal = document.getElementById('editCustomerModal');
        if (modal) modal.style.display = 'flex';
    }
};

const saveEditCustomerBtn = document.getElementById('saveEditCustomerBtn');
if (saveEditCustomerBtn) {
    saveEditCustomerBtn.addEventListener('click', function() {
        const identifier = document.getElementById('editCusId').value;
        const newName = document.getElementById('editCusName').value.trim();
        const newPhone = document.getElementById('editCusPhone').value.trim();
        const newAddress = document.getElementById('editFullAddressInput').value.trim();

        if (!newName || !newPhone) {
            alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại!');
            return;
        }

        let customers = Storage.getCustomers ? Storage.getCustomers() : [];
        const index = customers.findIndex(c => c.id === identifier || c.phone === identifier);
        
        if (index !== -1) {
            customers[index].name = newName;
            customers[index].phone = newPhone;
            // Only update address if a new valid address was selected, otherwise keep existing
            if(newAddress && newAddress !== "Chưa xác định") {
               customers[index].address = newAddress;
            }
            
            if (Storage.saveCustomers) {
                Storage.saveCustomers(customers);
            } else {
                localStorage.setItem('crm_customers', JSON.stringify(customers));
            }
            
            alert('✅ Đã lưu cập nhật thông tin khách hàng!');
            document.getElementById('editCustomerModal').style.display = 'none';
            renderCustomers();
        }
    });
}

window.deleteCustomer = function(identifier) {
    if (confirm(`⚠️ Bạn có chắc chắn muốn xóa khách hàng này không?`)) {
        let customers = Storage.getCustomers ? Storage.getCustomers() : [];
        customers = customers.filter(c => c.id !== identifier && c.phone !== identifier);
        
        if (Storage.saveCustomers) {
            Storage.saveCustomers(customers);
        } else {
            localStorage.setItem('crm_customers', JSON.stringify(customers));
        }
        
        renderCustomers();
    }
};

window.addEventListener('click', function(e) {
    const modal = document.getElementById('editCustomerModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// ==========================================
// 5. Logic API Địa Chính
// ==========================================
const editProvinceSelect = document.getElementById('editProvince');
const editDistrictSelect = document.getElementById('editDistrict');
const editWardSelect = document.getElementById('editWard');
const editStreetInput = document.getElementById('editStreet');
const editFullAddressText = document.getElementById('editFullAddressText');
const editFullAddressInput = document.getElementById('editFullAddressInput');
const PROVINCES_API = 'https://provinces.open-api.vn/api';

async function loadEditProvinces() {
    try {
        const res = await fetch(`${PROVINCES_API}/?depth=1`);
        const provinces = await res.json();
        if(editProvinceSelect) {
            editProvinceSelect.innerHTML = '<option value="">-- Tỉnh / Thành phố --</option>' +
            provinces.map(p => `<option value="${p.code}" data-name="${p.name}">${p.name}</option>`).join('');
        }
    } catch (err) {
        console.error('Lỗi nạp Tỉnh/Thành:', err);
    }
}

if(editProvinceSelect) {
    editProvinceSelect.addEventListener('change', async function() {
        const pCode = this.value;
        editDistrictSelect.innerHTML = '<option value="">-- Quận / Huyện --</option>';
        editWardSelect.innerHTML = '<option value="">-- Phường / Xã --</option>';
        editWardSelect.disabled = true;
        editWardSelect.style.background = '#f1f5f9';

        if (!pCode) {
            editDistrictSelect.disabled = true;
            editDistrictSelect.style.background = '#f1f5f9';
            updateEditFullAddress();
            return;
        }

        try {
            const res = await fetch(`${PROVINCES_API}/p/${pCode}?depth=2`);
            const data = await res.json();
            editDistrictSelect.innerHTML = '<option value="">-- Quận / Huyện --</option>' +
                data.districts.map(d => `<option value="${d.code}" data-name="${d.name}">${d.name}</option>`).join('');
            editDistrictSelect.disabled = false;
            editDistrictSelect.style.background = '#ffffff';
        } catch (err) {
            console.error('Lỗi nạp Quận/Huyện:', err);
        }
        updateEditFullAddress();
    });
}

if(editDistrictSelect) {
    editDistrictSelect.addEventListener('change', async function() {
        const dCode = this.value;
        editWardSelect.innerHTML = '<option value="">-- Phường / Xã --</option>';

        if (!dCode) {
            editWardSelect.disabled = true;
            editWardSelect.style.background = '#f1f5f9';
            updateEditFullAddress();
            return;
        }

        try {
            const res = await fetch(`${PROVINCES_API}/d/${dCode}?depth=2`);
            const data = await res.json();
            editWardSelect.innerHTML = '<option value="">-- Phường / Xã --</option>' +
                data.wards.map(w => `<option value="${w.code}" data-name="${w.name}">${w.name}</option>`).join('');
            editWardSelect.disabled = false;
            editWardSelect.style.background = '#ffffff';
        } catch (err) {
            console.error('Lỗi nạp Phường/Xã:', err);
        }
        updateEditFullAddress();
    });
}

function updateEditFullAddress() {
    const pOpt = editProvinceSelect.selectedOptions[0];
    const dOpt = editDistrictSelect.selectedOptions[0];
    const wOpt = editWardSelect.selectedOptions[0];

    const pName = (pOpt && pOpt.value) ? pOpt.getAttribute('data-name') : '';
    const dName = (dOpt && dOpt.value) ? dOpt.getAttribute('data-name') : '';
    const wName = (wOpt && wOpt.value) ? wOpt.getAttribute('data-name') : '';
    const street = editStreetInput.value.trim();

    const parts = [];
    if (street) parts.push(street);
    if (wName) parts.push(wName);
    if (dName) parts.push(dName);
    if (pName) parts.push(pName);

    const fullAddress = parts.join(', ');

    if (fullAddress && (pName || dName || wName)) {
        editFullAddressText.innerText = fullAddress;
        editFullAddressInput.value = fullAddress;
    } else {
        editFullAddressText.innerText = 'Chưa xác định';
        editFullAddressInput.value = '';
    }
}

if(editWardSelect) editWardSelect.addEventListener('change', updateEditFullAddress);
if(editStreetInput) editStreetInput.addEventListener('input', updateEditFullAddress);


// ==========================================
// 6. Khởi tạo & Lắng nghe
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadEditProvinces();
    if (typeof renderCustomers === "function") renderCustomers();

    const searchInput = document.getElementById('searchInput');
    const filterSelects = document.querySelectorAll('.customer-management-container select');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderCustomers();
        });
    }

    if (filterSelects.length >= 2) {
        filterSelects[1].addEventListener('change', () => {
            currentPage = 1;
            renderCustomers();
        });
    }
});