function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.toggle('active');
  }
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });

  initSearchAndFilter();
  initTableSorting();
  initAutoRefresh();
});

function initSearchAndFilter() {
  const searchInputs = document.querySelectorAll('.search-input');
  searchInputs.forEach(input => {
    const tableId = input.dataset.table;
    if (tableId) {
      input.addEventListener('input', (e) => filterTable(e.target.value, tableId));
    }
  });

  const filterSelects = document.querySelectorAll('.filter-select');
  filterSelects.forEach(select => {
    const tableId = select.dataset.table;
    if (tableId) {
      select.addEventListener('change', () => applyFilters(tableId));
    }
  });
}

function filterTable(searchTerm, tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table.querySelectorAll('tbody tr');
  const term = searchTerm.toLowerCase().trim();

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(term) ? '' : 'none';
  });

  updateRowCount(tableId);
}

function applyFilters(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table.querySelectorAll('tbody tr');
  const filters = {};
  
  document.querySelectorAll(`[data-table="${tableId}"].filter-select`).forEach(select => {
    if (select.value) {
      filters[select.dataset.filter] = select.value;
    }
  });

  rows.forEach(row => {
    let show = true;
    
    Object.keys(filters).forEach(filterKey => {
      const cell = row.querySelector(`[data-filter="${filterKey}"]`);
      if (cell && !cell.textContent.toLowerCase().includes(filters[filterKey].toLowerCase())) {
        show = false;
      }
    });

    row.style.display = show ? '' : 'none';
  });

  updateRowCount(tableId);
}

function updateRowCount(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const visibleRows = Array.from(table.querySelectorAll('tbody tr')).filter(
    row => row.style.display !== 'none'
  ).length;
  
  const countElement = document.querySelector(`[data-count="${tableId}"]`);
  if (countElement) {
    countElement.textContent = `${visibleRows} items`;
  }
}

function initTableSorting() {
  const sortableHeaders = document.querySelectorAll('[data-sort]');
  sortableHeaders.forEach(header => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      const tableId = header.dataset.table;
      const column = header.dataset.sort;
      sortTable(tableId, column);
    });
  });
}

function sortTable(tableId, column) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const columnIndex = Array.from(table.querySelectorAll('thead th')).findIndex(
    th => th.dataset.sort === column
  );

  if (columnIndex === -1) return;

  const isNumeric = !isNaN(parseFloat(rows[0]?.cells[columnIndex]?.textContent.trim()));

  rows.sort((a, b) => {
    const aVal = a.cells[columnIndex]?.textContent.trim() || '';
    const bVal = b.cells[columnIndex]?.textContent.trim() || '';

    if (isNumeric) {
      return parseFloat(aVal) - parseFloat(bVal);
    }
    return aVal.localeCompare(bVal);
  });

  rows.forEach(row => tbody.appendChild(row));
}

function exportToCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tr'));
  const csv = [];

  rows.forEach(row => {
    const cols = Array.from(row.querySelectorAll('th, td'));
    const data = cols.map(col => {
      let text = col.textContent.trim();
      text = text.replace(/"/g, '""');
      return `"${text}"`;
    });
    csv.push(data.join(','));
  });

  const csvContent = csv.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToExcel(tableId, filename) {
  exportToCSV(tableId, filename.replace('.csv', '.csv'));
}

function initAutoRefresh() {
  const dashboards = document.querySelectorAll('[data-auto-refresh]');
  dashboards.forEach(dashboard => {
    const interval = parseInt(dashboard.dataset.autoRefresh) || 30000;
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        location.reload();
      }
    }, interval);
  });
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

