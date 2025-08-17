// DOM Elements
const navSectionHeaders = document.querySelectorAll('.nav-section-header');
const navItems = document.querySelectorAll('.nav-item');
const searchInput = document.querySelector('.search-input');
const tableSearch = document.querySelector('.table-search');
const filterSelect = document.querySelector('.filter-select');
const addModuleBtn = document.querySelector('.add-module-btn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSearch();
    initializeTableFilters();
    initializeInteractions();
});

// Navigation functionality
function initializeNavigation() {
    // Handle section toggle
    navSectionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            const sectionContent = document.getElementById(`${sectionId}-section`);
            const arrow = this.querySelector('.section-arrow');
            
            // Toggle section visibility
            sectionContent.classList.toggle('collapsed');
            
            // Rotate arrow
            if (sectionContent.classList.contains('collapsed')) {
                arrow.style.transform = 'rotate(-90deg)';
            } else {
                arrow.style.transform = 'rotate(0deg)';
            }
        });
    });

    // Handle nav item selection
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Don't trigger if clicking on options button
            if (e.target.closest('.nav-options')) {
                return;
            }
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Update main content based on selection
            updateMainContent(this.querySelector('span').textContent);
        });
    });
}

// Search functionality
function initializeSearch() {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        navItems.forEach(item => {
            const itemText = item.querySelector('span').textContent.toLowerCase();
            const parentSection = item.closest('.nav-section-content');
            
            if (itemText.includes(searchTerm)) {
                item.style.display = 'flex';
                if (parentSection) {
                    parentSection.classList.remove('collapsed');
                    const header = parentSection.previousElementSibling;
                    const arrow = header.querySelector('.section-arrow');
                    arrow.style.transform = 'rotate(0deg)';
                }
            } else {
                item.style.display = searchTerm ? 'none' : 'flex';
            }
        });
    });
}

// Table filtering functionality
function initializeTableFilters() {
    // Table search
    if (tableSearch) {
        tableSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.leads-table tbody tr');
            
            tableRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // Status filter
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filterValue = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.leads-table tbody tr');
            
            tableRows.forEach(row => {
                if (filterValue === 'all status') {
                    row.style.display = '';
                } else {
                    const statusBadge = row.querySelector('.status-badge');
                    const statusText = statusBadge ? statusBadge.textContent.toLowerCase() : '';
                    row.style.display = statusText.includes(filterValue) ? '' : 'none';
                }
            });
        });
    }
}

// Interactive elements
function initializeInteractions() {
    // Add module button
    if (addModuleBtn) {
        addModuleBtn.addEventListener('click', function() {
            showNotification('Add Module feature coming soon!', 'info');
        });
    }

    // Action buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-icon')) {
            const button = e.target.closest('.btn-icon');
            const icon = button.querySelector('i');
            
            if (icon.classList.contains('fa-eye')) {
                showNotification('View lead details', 'info');
            } else if (icon.classList.contains('fa-edit')) {
                showNotification('Edit lead', 'info');
            } else if (icon.classList.contains('fa-trash')) {
                showNotification('Delete lead', 'warning');
            }
        }
        
        // Header action buttons
        if (e.target.closest('.btn-primary')) {
            showNotification('Add new lead form would open here', 'success');
        } else if (e.target.closest('.btn-secondary')) {
            showNotification('Export functionality would start here', 'info');
        }
    });

    // Sidebar icons
    document.querySelectorAll('.sidebar-icons i').forEach(icon => {
        icon.addEventListener('click', function() {
            const iconClass = this.className;
            let message = 'Feature coming soon!';
            
            if (iconClass.includes('fa-plus-square')) {
                message = 'Quick create menu';
            } else if (iconClass.includes('fa-calendar-alt')) {
                message = 'Calendar view';
            } else if (iconClass.includes('fa-bell')) {
                message = 'Notifications';
            } else if (iconClass.includes('fa-cog')) {
                message = 'Settings';
            } else if (iconClass.includes('fa-th')) {
                message = 'App menu';
            }
            
            showNotification(message, 'info');
        });
    });

    // Teamspace dropdown
    document.querySelector('.teamspace-info').addEventListener('click', function() {
        showNotification('Teamspace options menu', 'info');
    });
}

// Update main content based on navigation
function updateMainContent(sectionName) {
    const contentHeader = document.querySelector('.content-header h1');
    const statsGrid = document.querySelector('.stats-grid');
    const tableHeader = document.querySelector('.table-header h2');
    
    // Update header
    contentHeader.textContent = `${sectionName} Dashboard`;
    
    // Update table header
    if (tableHeader) {
        tableHeader.textContent = `Recent ${sectionName}`;
    }
    
    // Update stats based on section
    updateStats(sectionName);
}

// Update statistics based on selected section
function updateStats(sectionName) {
    const statCards = document.querySelectorAll('.stat-card');
    const statsData = {
        'Leads': [
            { value: '245', label: 'Total Applicants' },
            { value: '68', label: 'Placed' },
            { value: '23', label: 'Contacted' },
            { value: '28', label: 'States' }
        ],
        'Contacts': [
            { value: '1,234', label: 'Total Contacts' },
            { value: '89', label: 'Active Contacts' },
            { value: '156', label: 'New This Month' },
            { value: '92%', label: 'Engagement Rate' }
        ],
        'Deals': [
            { value: '87', label: 'Active Deals' },
            { value: '$2.4M', label: 'Pipeline Value' },
            { value: '34', label: 'Closed Won' },
            { value: '67%', label: 'Win Rate' }
        ],
        'Tasks': [
            { value: '42', label: 'Open Tasks' },
            { value: '18', label: 'Due Today' },
            { value: '156', label: 'Completed' },
            { value: '89%', label: 'Completion Rate' }
        ]
    };
    
    const data = statsData[sectionName] || statsData['Leads'];
    
    statCards.forEach((card, index) => {
        if (data[index]) {
            const statInfo = card.querySelector('.stat-info');
            const h3 = statInfo.querySelector('h3');
            const p = statInfo.querySelector('p');
            
            h3.textContent = data[index].value;
            p.textContent = data[index].label;
        }
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        display: flex;
        align-items: center;
        padding: 16px;
        gap: 12px;
    `;
    
    const icon = notification.querySelector('i:first-child');
    icon.style.cssText = `
        color: ${getNotificationColor(type)};
        font-size: 16px;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        color: #64748b;
        margin-left: auto;
        padding: 4px;
        border-radius: 4px;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
    
    // Close button functionality
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

function getNotificationIcon(type) {
    const icons = {
        'info': 'info-circle',
        'success': 'check-circle',
        'warning': 'exclamation-triangle',
        'error': 'times-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'info': '#3498db',
        'success': '#27ae60',
        'warning': '#f39c12',
        'error': '#e74c3c'
    };
    return colors[type] || '#3498db';
}

// Smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for better UX
function addLoadingState(element) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
}

function removeLoadingState(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        if (searchInput === document.activeElement) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    }
});

// Add some animation delays for better visual hierarchy
document.querySelectorAll('.stat-card').forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

// Initialize tooltips for better UX
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #2d3748;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
                transform: translateY(-100%);
                margin-top: -8px;
            `;
            
            this.style.position = 'relative';
            this.appendChild(tooltip);
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}



// CSV Import functionality
let currentData = [];
let currentColumns = [];

// Initialize CSV import functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCSVImport();
});

function initializeCSVImport() {
    const importBtn = document.getElementById('importBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    const sortSelect = document.getElementById('sortSelect');
    
    if (importBtn && csvFileInput) {
        importBtn.addEventListener('click', function() {
            csvFileInput.click();
        });
        
        csvFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                uploadCSVFile(file);
            }
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const selectedColumn = this.value;
            if (selectedColumn && currentData.length > 0) {
                sortDataByColumn(selectedColumn);
            }
        });
    }
}

function uploadCSVFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Show loading state
    const importBtn = document.getElementById('importBtn');
    addLoadingState(importBtn);
    
    fetch('/api/upload-csv', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        removeLoadingState(importBtn);
        
        if (data.success) {
            currentData = data.data;
            currentColumns = data.columns;
            
            // Update table with imported data
            updateTableWithData(data.data, data.columns);
            
            // Show sort dropdown and populate it
            showSortOptions(data.columns);
            
            // Update stats based on imported data
            updateStatsFromData(data.data);
            
            showNotification(`Successfully imported ${data.total_rows} rows from ${file.name}`, 'success');
        } else {
            showNotification(`Error: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        removeLoadingState(importBtn);
        showNotification(`Error uploading file: ${error.message}`, 'error');
    });
}

function updateTableWithData(data, columns) {
    const table = document.querySelector('.leads-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    // Update table headers
    const headerRow = thead.querySelector('tr');
    headerRow.innerHTML = '';
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    
    // Update table body
    tbody.innerHTML = '';
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        columns.forEach(column => {
            const td = document.createElement('td');
            const value = row[column];
            
            // Handle different data types
            if (typeof value === 'string' && value.includes('@')) {
                // Email
                td.innerHTML = `<a href="mailto:${value}">${value}</a>`;
            } else if (typeof value === 'number') {
                td.textContent = value.toLocaleString();
            } else {
                td.textContent = value || '';
            }
            
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    // Update table search placeholder
    const tableSearch = document.querySelector('.table-search');
    if (tableSearch) {
        tableSearch.placeholder = 'Search data...';
    }
}

function showSortOptions(columns) {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.style.display = 'block';
        sortSelect.innerHTML = '<option value="">Sort by...</option>';
        
        columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            option.textContent = column;
            sortSelect.appendChild(option);
        });
    }
}

function sortDataByColumn(column) {
    if (!currentData.length) return;
    
    const sortSelect = document.getElementById('sortSelect');
    addLoadingState(sortSelect);
    
    fetch('/api/sort-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: currentData,
            sort_column: column,
            sort_order: 'asc'
        })
    })
    .then(response => response.json())
    .then(data => {
        removeLoadingState(sortSelect);
        
        if (data.success) {
            currentData = data.data;
            updateTableWithData(data.data, currentColumns);
            showNotification(`Data sorted by ${column}`, 'success');
        } else {
            showNotification(`Error sorting data: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        removeLoadingState(sortSelect);
        showNotification(`Error sorting data: ${error.message}`, 'error');
    });
}

function updateStatsFromData(data) {
    if (!data.length) return;
    
    const statCards = document.querySelectorAll('.stat-card');
    
    // Calculate basic stats from imported data
    const totalRows = data.length;
    const uniqueValues = new Set();
    const statusCounts = {};
    const sourceCounts = {};
    
    data.forEach(row => {
        // Count unique values in first column (assuming it's names or IDs)
        const firstColumn = Object.keys(row)[0];
        if (firstColumn && row[firstColumn]) {
            uniqueValues.add(row[firstColumn]);
        }
        
        // Count status if exists
        if (row.Status || row.status) {
            const status = row.Status || row.status;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
        
        // Count sources if exists
        if (row.Source || row.source) {
            const source = row.Source || row.source;
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        }
    });
    
    // Update stat cards with calculated values
    if (statCards[0]) {
        const statInfo = statCards[0].querySelector('.stat-info');
        statInfo.querySelector('h3').textContent = totalRows.toLocaleString();
        statInfo.querySelector('p').textContent = 'Total Records';
    }
    
    if (statCards[1]) {
        const statInfo = statCards[1].querySelector('.stat-info');
        const placedCount = statusCounts['Placed'] || statusCounts['placed'] || 0;
        statInfo.querySelector('h3').textContent = placedCount.toLocaleString();
        statInfo.querySelector('p').textContent = 'Placed';
    }
    
    if (statCards[2]) {
        const statInfo = statCards[2].querySelector('.stat-info');
        const contactedCount = statusCounts['Contacted'] || statusCounts['contacted'] || 0;
        statInfo.querySelector('h3').textContent = contactedCount.toLocaleString();
        statInfo.querySelector('p').textContent = 'Contacted';
    }
    
    if (statCards[3]) {
        const statInfo = statCards[3].querySelector('.stat-info');
        const sourceCount = Object.keys(sourceCounts).length;
        statInfo.querySelector('h3').textContent = sourceCount.toLocaleString();
        statInfo.querySelector('p').textContent = 'Sources';
    }
}

// Override the existing table search to work with imported data
function initializeTableFilters() {
    // Table search
    const tableSearch = document.querySelector('.table-search');
    if (tableSearch) {
        tableSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.leads-table tbody tr');
            
            tableRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // Status filter - make it work with imported data
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filterValue = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.leads-table tbody tr');
            
            if (filterValue === 'all status') {
                tableRows.forEach(row => row.style.display = '');
                return;
            }
            
            tableRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(filterValue) ? '' : 'none';
            });
        });
    }
}

