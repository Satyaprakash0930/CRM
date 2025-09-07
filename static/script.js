// DOM Elements
// 💰 Configurable settings
const FORM_FEE = 99; // Change this if fee amount changes
const navSectionHeaders = document.querySelectorAll('.nav-section-header');
const navItems = document.querySelectorAll('.nav-item');
const searchInput = document.querySelector('.search-input');
const tableSearch = document.querySelector('.table-search');
const filterSelect = document.querySelector('.filter-select');
const addModuleBtn = document.querySelector('.add-module-btn');


// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    initializeSearch();
    initializeTableFilters();
    initializeInteractions();
    restoreTableFromStorage();


    // 🟢 Define statCards
    const statCards = document.querySelectorAll(".stat-card");

    // ✅ Add click event to Contacted card (2nd card when in Contacted tab)
    if (statCards[1]) {
        statCards[1].addEventListener("click", function () {
            // Only apply if we are in Contacted tab
            const headerText = document.querySelector(".content-header h1").textContent;
            if (!headerText.includes("Contacted")) return;

            const existingDropdown = document.querySelector(".contacted-dropdown");
            if (existingDropdown) {
                existingDropdown.remove();
                return;
            }

            const counts = JSON.parse(this.dataset.contactedCounts || "{}");

            const dropdown = document.createElement("div");
            dropdown.classList.add("source-dropdown", "contacted-dropdown");

            Object.entries(counts).forEach(([status, count]) => {
                const item = document.createElement("div");
                item.classList.add("dropdown-item");
                item.textContent = `${status} - ${count} applicants`;

                item.addEventListener("click", function (e) {
                    e.stopPropagation();
                    filterTableByContacted(status, count);
                });

                dropdown.appendChild(item);
            });

            this.appendChild(dropdown);
        });
    }

    // ✅ Add click event to Source card (4th card)
    if (statCards[3]) {
        statCards[3].addEventListener("click", function () {
            const existingDropdown = document.querySelector(".source-dropdown");
            if (existingDropdown) {
                existingDropdown.remove(); // toggle off
                return;
            }

            // Get saved source counts
            const sourceCounts = JSON.parse(this.dataset.sourceCounts || "{}");

            // Create dropdown container
            const dropdown = document.createElement("div");
            dropdown.classList.add("source-dropdown");

            // Show All option
            const resetItem = document.createElement("div");
            resetItem.classList.add("dropdown-item");
            resetItem.textContent = "Show All Sources";
            resetItem.style.fontWeight = "600";
            resetItem.style.color = "#3498db";
            resetItem.addEventListener("click", function (e) {
                e.stopPropagation();
                const tableRows = document.querySelectorAll('.leads-table tbody tr');
                tableRows.forEach(row => row.style.display = "");
                showNotification("Showing all sources", "success");
            });
            dropdown.appendChild(resetItem);

            // ✅ Add each source to dropdown
            Object.entries(sourceCounts).forEach(([source, count]) => {
                const item = document.createElement("div");
                item.classList.add("dropdown-item");
                item.textContent = `${source} - ${count} applicants`;

                // On click, filter table
                item.addEventListener("click", function (e) {
                    e.stopPropagation();
                    filterTableBySource(source, count);
                });

                dropdown.appendChild(item);
            });

            // Insert dropdown inside Source card
            this.appendChild(dropdown);
        });
    }

    // Initial update of stats with default or loaded data
    fetch('/api/get-data')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Add "Placed" column based on Contacted
                currentData = data.data.map(r => ({
                    ...r,
                    Placed: (r.Contacted || '').toLowerCase() === 'yes' ? 'Placed' : ''
                }));

                currentColumns = data.columns.includes('Placed')
                    ? data.columns
                    : [...data.columns, 'Placed'];

                updateStatsFromWithData(currentData, currentColumns);
                updateStatsFromData(currentData);
            } else {
                updateStats('Leads', { 'Total Applicants': '0' });
            }
        });
});


function filterTableByContacted(status, count) {
    const tableRows = document.querySelectorAll('.leads-table tbody tr');

    tableRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        let rowContacted = cells[3] ? cells[3].textContent.trim().toLowerCase() : ""; // Assuming Status column holds Contacted info
        if (rowContacted === status.toLowerCase()) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });

    showNotification(`${count} applicants with Contacted = ${status}`, "info");
}


function filterTableBySource(source, count) {
    const tableRows = document.querySelectorAll('.leads-table tbody tr');

    tableRows.forEach(row => {
        const cells = row.querySelectorAll("td");
        let rowSource = cells[4] ? cells[4].textContent.trim() : "";
        if (rowSource === source) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });

    if (typeof count !== 'undefined') {
        showNotification(`${count} applicants from ${source}`, "info");
    } else {
        showNotification(`Filtered by Source: ${source}`, "info");
    }
}



// Navigation functionality
function initializeNavigation() {
    // Handle section toggle
    navSectionHeaders.forEach(header => {
        header.addEventListener('click', function () {
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
        item.addEventListener('click', function (e) {
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
    searchInput.addEventListener('input', function () {
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
        tableSearch.addEventListener('input', function () {
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
        filterSelect.addEventListener('change', function () {
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
        addModuleBtn.addEventListener('click', function () {
            showNotification('Add Module feature coming soon!', 'info');
        });
    }

    // Action buttons
    document.addEventListener('click', function (e) {
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


    // Handle sidebar tab switching
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            // Remove 'active' class from all tabs
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Get the section name (tab label)
            const sectionName = item.querySelector('span').textContent.trim();

            // Update main content
            updateMainContent(sectionName);
        });
    });


    // Sidebar icons
    document.querySelectorAll('.sidebar-icons i').forEach(icon => {
        icon.addEventListener('click', function () {
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
    document.querySelector('.teamspace-info').addEventListener('click', function () {
        showNotification('Teamspace options menu', 'info');
    });
}

// Update main content based on navigation
function updateMainContent(sectionName) {
    const contentHeader = document.querySelector('.content-header h1');
    const tableHeader = document.querySelector('.table-header h2');
    const tableContainer = document.querySelector('.leads-table-container');
    const homeCharts = document.getElementById('homeCharts');

    console.log("🔄 Switching to tab:", sectionName, "| currentData rows:", currentData.length);

    // Update header
    contentHeader.textContent = `${sectionName} Dashboard`;

    if (sectionName === "Home") {
        if (tableContainer) tableContainer.style.display = "none";   // hide table in Home
        if (homeCharts) homeCharts.style.display = "flex";          // show charts in Home
    } else {
        if (tableContainer) tableContainer.style.display = "block"; // show table in all other tabs
        if (tableHeader) tableHeader.textContent = `Recent ${sectionName}`;
        if (homeCharts) homeCharts.style.display = "none";        // hide charts
        
        if (currentData && currentColumns.length) {
         updateTableWithData([...currentData], [...currentColumns]);
        }
    }
    
    if (currentData && currentData.length > 0) {
        updateStatsFromData(currentData, sectionName);
    } else {
        updateStats(sectionName, { 'Total Applicants': '0' });
    }
}



function updateStatsFromData(data, sectionName = "Leads") {
    if (!data.length) return;

    const totalApplicants = data.length;

    // Common counts
    const placedApplicants = data.filter(row =>
        (row.Placed || "").toLowerCase() === "placed"
    ).length;

    const contactedYes = data.filter(row =>
        (row.Contacted || "").toLowerCase() === "yes"
    ).length;

    const contactedNo = data.filter(row =>
        (row.Contacted || "").toLowerCase() === "no"
    ).length;

    const sourceCounts = {};
    data.forEach(row => {
        const source = (row.Source || "Unknown").trim();
        if (!sourceCounts[source]) sourceCounts[source] = 0;
        sourceCounts[source]++;
    });

    const statCards = document.querySelectorAll('.stat-card');

    // ✅ Accounts tab logic
    if (sectionName === "Accounts") {
        if (statCards[0]) {
            statCards[0].style.display = "flex";
            statCards[0].querySelector("h3").textContent = totalApplicants.toLocaleString();
            statCards[0].querySelector("p").textContent = "Total Applicants";
        }

        if (statCards[1]) {
            statCards[1].style.display = "flex";
            const totalRevenue = totalApplicants * FORM_FEE;
            statCards[1].querySelector("h3").textContent = `₹${totalRevenue.toLocaleString()}`;
            statCards[1].querySelector("p").textContent = "Total Revenue";

            // Tooltip (optional)
            statCards[1].setAttribute("data-tooltip", `Revenue = Applicants × ₹${FORM_FEE}`);
        }

        if (statCards[2]) statCards[2].style.display = "none";
        if (statCards[3]) statCards[3].style.display = "none";
        if (statCards[4]) statCards[4].style.display = "none";
        if (statCards[5]) statCards[5].style.display = "none";
        if (statCards[6]) statCards[6].style.display = "none";
        if (statCards[7]) statCards[7].style.display = "none";
    }

    // ✅ Contacted tab logic
    else if (sectionName === "Contacted") {
        if (statCards[0]) {
            statCards[0].style.display = "flex";
            statCards[0].querySelector("h3").textContent = totalApplicants.toLocaleString();
            statCards[0].querySelector("p").textContent = "Total Applicants";
        }

        if (statCards[1]) {
            statCards[1].style.display = "flex";
            statCards[1].querySelector("h3").textContent = contactedYes.toLocaleString();
            statCards[1].querySelector("p").textContent = "Contacted";

            // Save Yes/No counts for dropdown
            statCards[1].dataset.contactedCounts = JSON.stringify({ Yes: contactedYes, No: contactedNo });
        }

        if (statCards[2]) statCards[2].style.display = "none";
        if (statCards[3]) statCards[3].style.display = "none";
        if (statCards[4]) statCards[4].style.display = "none";
        if (statCards[5]) statCards[5].style.display = "none";
        if (statCards[6]) statCards[6].style.display = "none";
        if (statCards[7]) statCards[7].style.display = "none";
    }


    // ✅ Default (All Info / Leads tab)
    // ✅ Default (Home / Leads / All Info tab)
    else {
        if (statCards[0]) {
            statCards[0].style.display = "flex";
            statCards[0].querySelector("h3").textContent = totalApplicants.toLocaleString();
            statCards[0].querySelector("p").textContent = "Total Applicants";
        }
        if (statCards[1]) {
            statCards[1].style.display = "flex";
            statCards[1].querySelector("h3").textContent = placedApplicants.toLocaleString();
            statCards[1].querySelector("p").textContent = "Placed";
        }
        if (statCards[2]) {
            statCards[2].style.display = "flex";
            statCards[2].querySelector("h3").textContent = contactedYes.toLocaleString();
            statCards[2].querySelector("p").textContent = "Contacted";
        }
        if (statCards[3]) {
            statCards[3].style.display = "flex";
            statCards[3].querySelector("h3").textContent = Object.keys(sourceCounts).length.toLocaleString();
            statCards[3].querySelector("p").textContent = "Sources";
            statCards[3].dataset.sourceCounts = JSON.stringify(sourceCounts);
        }

        // New cards
        if (statCards[4]) {
            statCards[4].style.display = "flex";
            statCards[4].querySelector("h3").textContent = contactedNo.toLocaleString();
            statCards[4].querySelector("p").textContent = "Not Contacted Yet";
        }

        if (statCards[5]) {
            statCards[5].style.display = "flex";
            const conversionRate = totalApplicants > 0
                ? ((placedApplicants / totalApplicants) * 100).toFixed(1) + "%"
                : "0%";
            statCards[5].querySelector("h3").textContent = conversionRate;
            statCards[5].querySelector("p").textContent = "Conversion Rate";
        }

        if (statCards[6]) {
            statCards[6].style.display = "flex";
            const totalRevenue = totalApplicants * FORM_FEE;
            statCards[6].querySelector("h3").textContent = `₹${totalRevenue.toLocaleString()}`;
            statCards[6].querySelector("p").textContent = "Total Revenue";
        }


        if (statCards[7]) {
            statCards[7].style.display = "flex";
            const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];
            statCards[7].querySelector("h3").textContent = topSource ? topSource[0] : "N/A";
            statCards[7].querySelector("p").textContent = "Top Source";
        }

    }
    if (sectionName === "Leads" || sectionName === "Home") {
        renderCharts();
    }

}

function renderCharts() {
    const contentHeader = document.querySelector(".content-header h1")?.textContent || "";
    if (!contentHeader.includes("Home")) return;
    if (!currentData || currentData.length === 0) return;

    const totalApplicants = currentData.length;

    // --- Applicants by Location ---
    const locationCounts = {};
    currentData.forEach(row => {
        const loc = (row.Location || "Unknown").trim();
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const locationLabels = Object.keys(locationCounts);
    const locationData = Object.values(locationCounts);

    const ctx = document.getElementById('locationChart');
    if (ctx) {
        const locationCtx = ctx.getContext('2d');
        if (window.locationChartInstance) window.locationChartInstance.destroy();
        window.locationChartInstance = new Chart(locationCtx, {
            type: 'bar',
            data: {
                labels: locationLabels,
                datasets: [{
                    label: `Applicants by Location (Total: ${totalApplicants})`,
                    data: locationData,
                    backgroundColor: "rgba(54, 162, 235, 0.7)"
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            footer: (items) => {
                                // Show percentage of total in tooltip
                                const value = items[0].parsed.y || items[0].parsed;
                                const percent = ((value / totalApplicants) * 100).toFixed(1);
                                return `(${percent}% of total)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Applicants by Preferred Shift ---
    const shiftCounts = {};
    currentData.forEach(row => {
        const shift = (row["Preferred Shift"] || "Unknown").trim();
        shiftCounts[shift] = (shiftCounts[shift] || 0) + 1;
    });

    const shiftLabels = Object.keys(shiftCounts);
    const shiftData = Object.values(shiftCounts);

    const ctxShift = document.getElementById('shiftChart');
    if (ctxShift) {
        const shiftCtx = ctxShift.getContext('2d');
        if (window.shiftChartInstance) window.shiftChartInstance.destroy();
        window.shiftChartInstance = new Chart(shiftCtx, {
            type: 'bar',
            data: {
                labels: shiftLabels,
                datasets: [{
                    label: `Applicants by Preferred Shift (Total: ${totalApplicants})`,
                    data: shiftData,
                    backgroundColor: "rgba(255, 99, 132, 0.7)"
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            footer: (items) => {
                                const value = items[0].parsed.x || items[0].parsed;
                                const percent = ((value / totalApplicants) * 100).toFixed(1);
                                return `(${percent}% of total)`;
                            }
                        }
                    }
                }
            }
        });
    }
}




// Update statistics based on selected section
function updateStats(sectionName, dynamicStats = {}) {
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

    // Use dynamic data if provided, otherwise fall back to static data
    let data = statsData[sectionName] || statsData['Leads'];

    // Override static values with dynamic values if available
    data = data.map(stat => {
        if (dynamicStats[stat.label]) {
            return { ...stat, value: dynamicStats[stat.label] };
        }
        return stat;
    });

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
document.addEventListener('keydown', function (e) {
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
        element.addEventListener('mouseenter', function () {
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

        element.addEventListener('mouseleave', function () {
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

// ---- persistence (keep table after refresh) ----
const STORAGE_KEYS = {
    data: 'crm.table.data.v1',
    cols: 'crm.table.columns.v1'
};

function saveTableToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(currentData || []));
        localStorage.setItem(STORAGE_KEYS.cols, JSON.stringify(currentColumns || []));
    } catch (e) {
        console.warn('Could not save to localStorage', e);
    }
}

function restoreTableFromStorage() {
    try {
        const rawData = localStorage.getItem(STORAGE_KEYS.data);
        const rawCols = localStorage.getItem(STORAGE_KEYS.cols);
        if (!rawData || !rawCols) return;

        currentData = JSON.parse(rawData) || [];
        currentColumns = JSON.parse(rawCols) || [];

        if (currentData.length) {
            updateTableWithData(currentData, currentColumns);

            // auto update stats too
            const section =
                (document.querySelector('.content-header h1')?.textContent.split(' ')[0]) || 'Home';
            updateStatsFromData(currentData, section);
        }
    } catch (e) {
        console.warn('Could not restore from localStorage', e);
    }
}


// Initialize CSV import functionality
document.addEventListener('DOMContentLoaded', function () {
    initializeCSVImport();
});

function initializeCSVImport() {
    const importBtn = document.getElementById('importBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    const sortSelect = document.getElementById('sortSelect');

    if (importBtn && csvFileInput) {
        importBtn.addEventListener('click', function () {
            csvFileInput.click();
        });

        csvFileInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                uploadCSVFile(file);
            }
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
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
                // 1) Add "Placed" column based on Contacted
                currentData = data.data.map(r => ({
                    ...r,
                    Placed: (r.Contacted || '').toLowerCase() === 'yes' ? 'Placed' : ''
                }));

                // 2) Ensure "Placed" column exists in the headers
                currentColumns = data.columns.includes('Placed')
                    ? data.columns
                    : [...data.columns, 'Placed'];

                // 3) Update table + stats
                updateTableWithData(currentData, currentColumns);
                updateStatsFromData(currentData);
                saveTableToStorage();
                showNotification('CSV imported successfully!', 'success');
            } else {
                showNotification('Error importing CSV: ' + data.message, 'error');
            }
        })
        .catch(error => {
            removeLoadingState(importBtn);
            console.error('Error:', error);
            showNotification('An error occurred during CSV import.', 'error');
        });
}


function updateTableWithData(data, columns) {
    const table = document.querySelector('.leads-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    // Update table headers
    const headerRow = thead.querySelector('tr');
    headerRow.innerHTML = '';

    // Sr. No. header (manual, not from CSV)
    const thSrNo = document.createElement('th');
    thSrNo.textContent = "Sr. No.";
    headerRow.appendChild(thSrNo);

    // Add all headers from CSV columns
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });

    // Add Actions column in header
    const thActions = document.createElement('th');
    thActions.textContent = "Actions";
    headerRow.appendChild(thActions);

    // Update table body
    tbody.innerHTML = '';
    data.forEach((row, index) => {
        const tr = document.createElement('tr');

        // Sr. No. cell
        const srNoTd = document.createElement('td');
        srNoTd.textContent = index + 1;
        tr.appendChild(srNoTd);

        // Add all other CSV data cells
        columns.forEach(column => {
            const td = document.createElement('td');
            const value = row[column];

            if (typeof value === 'string' && value.includes('@')) {
                td.innerHTML = `<a href="mailto:${value}">${value}</a>`;
            } else {
                td.textContent = value || '';
            }

            tr.appendChild(td);
        });

        // Actions column
        const tdActions = document.createElement('td');
        tdActions.classList.add('action-buttons');
        tdActions.innerHTML = `
            <button class="btn-icon" data-action="view" data-index="${index}">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon" data-action="edit" data-index="${index}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" data-action="delete" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        tr.appendChild(tdActions);

        tbody.appendChild(tr);
    });

    // Event listeners for action buttons
    tbody.querySelectorAll('.btn-icon').forEach(button => {
        button.addEventListener('click', function () {
            const action = this.getAttribute('data-action');
            const rowIndex = Number(this.getAttribute('data-index'));
            const rowData = data[rowIndex];

            if (action === 'view') {
                showNotification(`Viewing: ${JSON.stringify(rowData)}`, 'info');
            } else if (action === 'edit') {
                showNotification(`Editing: ${rowData.Name || "Record"}`, 'success');
            } else if (action === 'delete') {
                if (confirm(`Are you sure you want to delete ${rowData.Name || "this record"}?`)) {
                    data.splice(rowIndex, 1);
                    updateTableWithData(data, columns);
                    populateDomainFilter();
                    currentData = data;
                    saveTableToStorage();
                    showNotification(`Deleted: ${rowData.Name || "Record"}`, 'success');
                }
            }
        });
    });

    // Update search placeholder
    const tableSearchEl = document.querySelector('.table-search');
    if (tableSearchEl) {
        tableSearchEl.placeholder = 'Search data...';
    }
    populateDomainFilter();
}

function populateDomainFilter() {
    let domainSet = new Set();
    const rows = document.querySelectorAll(".leads-table tbody tr");

    rows.forEach(row => {
        const domainCell = row.querySelector("td:nth-child(7)"); // adjust index if "Preferred Job Domain" column is different
        if (domainCell) {
            let value = domainCell.textContent.trim();
            if (value) domainSet.add(value);
        }
    });

    const filterSelect = document.querySelector(".filter-select");
    filterSelect.innerHTML = "<option value='all'>All Domains</option>";

    domainSet.forEach(domain => {
        const option = document.createElement("option");
        option.value = domain;
        option.textContent = domain;
        filterSelect.appendChild(option);
    });
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
                saveTableToStorage();
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


// Override the existing table search to work with imported data
function initializeTableFilters() {
    // Table search
    const tableSearch = document.querySelector('.table-search');
    if (tableSearch) {
        tableSearch.addEventListener('input', function () {
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
        filterSelect.addEventListener('change', function () {
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

// Populate Preferred Job Domain filter dropdown
function populateDomainFilter() {
    const domainFilter = document.getElementById("domainFilter");
    domainFilter.innerHTML = '<option value="all">All Domains</option>'; // reset first

    if (!currentData || currentData.length === 0) return;

    // Collect unique domains from your table data
    const domains = [...new Set(currentData.map(row => row["Preferred Job Domain"]))];

    domains.forEach(domain => {
        const option = document.createElement("option");
        option.value = domain;
        option.textContent = domain;
        domainFilter.appendChild(option);
    });
}

// Filter table when dropdown changes
document.getElementById("domainFilter").addEventListener("change", function () {
    const selectedDomain = this.value;

    let filteredData = currentData;
    if (selectedDomain !== "all") {
        filteredData = currentData.filter(row => row["Preferred Job Domain"] === selectedDomain);
    }

    updateTableWithData(filteredData, currentColumns);
});