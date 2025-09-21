// Main JavaScript for Room Repair System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Image preview functionality
    initImagePreview();
    
    // Form validation
    initFormValidation();
    
    // Chart initialization
    initCharts();
    
    // Search and filter functionality
    initSearchFilters();
    
    // File upload with drag and drop
    initFileUpload();
});

// Image Preview Function
function initImagePreview() {
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    
    imageInputs.forEach(function(input) {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewId = input.id + 'Preview';
                    const previewImg = document.getElementById(previewId);
                    const previewContainer = document.getElementById(previewId.replace('Img', ''));
                    
                    if (previewImg && previewContainer) {
                        previewImg.src = e.target.result;
                        previewContainer.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form[method="POST"]');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(function(field) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    
                    // Remove invalid class after user starts typing
                    field.addEventListener('input', function() {
                        this.classList.remove('is-invalid');
                    });
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            // Email validation
            const emailFields = form.querySelectorAll('input[type="email"]');
            emailFields.forEach(function(field) {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    field.classList.add('is-invalid');
                }
            });
            
            // Phone validation
            const phoneFields = form.querySelectorAll('input[type="tel"]');
            phoneFields.forEach(function(field) {
                if (field.value && !isValidPhone(field.value)) {
                    isValid = false;
                    field.classList.add('is-invalid');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showAlert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง', 'danger');
            }
        });
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 9;
}

// Chart Initialization
function initCharts() {
    // Monthly repair statistics chart
    const monthlyCtx = document.getElementById('monthlyChart');
    if (monthlyCtx) {
        fetch('/api/repair-stats')
            .then(response => response.json())
            .then(data => {
                new Chart(monthlyCtx, {
                    type: 'bar',
                    data: {
                        labels: data.monthly.map(item => formatMonth(item.month)),
                        datasets: [{
                            label: 'จำนวนการแจ้งซ่อม',
                            data: data.monthly.map(item => item.count),
                            backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                            borderRadius: 5
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error loading chart data:', error);
            });
    }

    // Repair type pie chart
    const repairTypeCtx = document.getElementById('repairTypeChart');
    if (repairTypeCtx) {
        fetch('/api/repair-types')
            .then(response => response.json())
            .then(data => {
                new Chart(repairTypeCtx, {
                    type: 'doughnut',
                    data: {
                        labels: data.types.map(item => getRepairTypeLabel(item.type)),
                        datasets: [{
                            data: data.types.map(item => item.count),
                            backgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                                '#4BC0C0',
                                '#9966FF',
                                '#FF9F40'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    padding: 20,
                                    usePointStyle: true
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error loading chart data:', error);
            });
    }
}

// Format month for display
function formatMonth(monthString) {
    const [year, month] = monthString.split('-');
    const monthNames = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}

// Get repair type label in Thai
function getRepairTypeLabel(type) {
    const typeLabels = {
        'plumbing': 'ประปา',
        'electrical': 'ไฟฟ้า',
        'furniture': 'เฟอร์นิเจอร์',
        'air_conditioning': 'เครื่องปรับอากาศ',
        'internet': 'อินเทอร์เน็ต',
        'other': 'อื่นๆ'
    };
    return typeLabels[type] || type;
}

// Search and Filter Functionality
function initSearchFilters() {
    const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"]');
    
    searchInputs.forEach(function(input) {
        let timeout;
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                // Auto-submit form after 500ms of no typing
                const form = input.closest('form');
                if (form) {
                    form.submit();
                }
            }, 500);
        });
    });
}

// File Upload with Drag and Drop
function initFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(function(input) {
        const container = input.closest('.image-upload-area') || input.parentElement;
        
        if (container) {
            // Drag and drop functionality
            container.addEventListener('dragover', function(e) {
                e.preventDefault();
                container.classList.add('dragover');
            });
            
            container.addEventListener('dragleave', function(e) {
                e.preventDefault();
                container.classList.remove('dragover');
            });
            
            container.addEventListener('drop', function(e) {
                e.preventDefault();
                container.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    input.dispatchEvent(new Event('change'));
                }
            });
        }
    });
}

// Show Alert Function
function showAlert(message, type = 'info') {
    const alertContainer = document.querySelector('.container');
    if (!alertContainer) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.insertBefore(alertDiv, alertContainer.firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(function() {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}

// Confirm Delete Function
function confirmDelete(message = 'คุณแน่ใจหรือไม่ที่จะลบรายการนี้?') {
    return confirm(message);
}

// Format Date Function
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('th-TH', options);
}

// Format Currency Function
function formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
    }).format(amount);
}

// Loading State Management
function showLoading(element) {
    if (element) {
        element.disabled = true;
        const originalText = element.innerHTML;
        element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>กำลังโหลด...';
        element.dataset.originalText = originalText;
    }
}

function hideLoading(element) {
    if (element && element.dataset.originalText) {
        element.disabled = false;
        element.innerHTML = element.dataset.originalText;
        delete element.dataset.originalText;
    }
}

// AJAX Form Submission
function submitFormAjax(form, successCallback, errorCallback) {
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    
    showLoading(submitButton);
    
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading(submitButton);
        if (data.success) {
            if (successCallback) successCallback(data);
        } else {
            if (errorCallback) errorCallback(data);
        }
    })
    .catch(error => {
        hideLoading(submitButton);
        console.error('Error:', error);
        if (errorCallback) errorCallback(error);
    });
}

// Table Row Click Handler
function initTableRowClick() {
    const tableRows = document.querySelectorAll('table tbody tr[data-href]');
    
    tableRows.forEach(function(row) {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function() {
            const href = this.dataset.href;
            if (href) {
                window.location.href = href;
            }
        });
    });
}

// Initialize table row clicks
initTableRowClick();

// Export functions for global use
window.RoomRepairSystem = {
    showAlert: showAlert,
    confirmDelete: confirmDelete,
    formatDate: formatDate,
    formatCurrency: formatCurrency,
    showLoading: showLoading,
    hideLoading: hideLoading,
    submitFormAjax: submitFormAjax
};
