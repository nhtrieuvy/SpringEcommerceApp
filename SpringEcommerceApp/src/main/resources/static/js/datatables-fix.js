/**
 * Initialize DataTables for report tables with improved error handling
 */
function initializeDataTables() {
    console.log('Initializing DataTables');
    
    // Ensure jQuery is available through various possible names
    const jq = window.jQuery || window.$ || $;
    
    // Check if jQuery and DataTables are available
    if (typeof jq === 'undefined') {
        console.error('jQuery is not available, skipping DataTables initialization');
        return;
    }
    
    if (typeof jq.fn.DataTable === 'undefined') {
        console.error('DataTables is not available, skipping DataTables initialization');
        return;
    }
    
    // Destroy any existing DataTables first
    jq('.data-table').each(function() {
        if (jq.fn.DataTable.isDataTable(this)) {
            jq(this).DataTable().destroy();
        }
    });
    
    // Initialize all tables with data-table class
    try {
        jq('.data-table').each(function() {
            const table = jq(this);
            
            // Count columns in thead
            const columnCount = table.find('thead tr:first th').length;
            console.log('Table has ' + columnCount + ' columns in header');
            
            // Fix inconsistent column counts in tbody rows
            table.find('tbody tr').each(function() {
                const row = jq(this);
                // Skip rows with colspan attributes
                if (row.find('[colspan]').length > 0) {
                    return;
                }
                
                const cellCount = row.find('td').length;
                if (cellCount !== columnCount) {
                    console.warn('Row has ' + cellCount + ' cells but header has ' + columnCount + ' columns');
                    
                    // Add missing cells if needed
                    if (cellCount < columnCount) {
                        for (let i = cellCount; i < columnCount; i++) {
                            row.append('<td></td>');
                        }
                    }
                }
            });
            
            // Initialize DataTable with options
            table.DataTable({
                language: {
                    search: "Tìm kiếm:",
                    lengthMenu: "Hiển thị _MENU_ dòng",
                    info: "Hiển thị _START_ đến _END_ của _TOTAL_ dòng",
                    infoEmpty: "Hiển thị 0 đến 0 của 0 dòng",
                    infoFiltered: "(lọc từ _MAX_ dòng)",
                    paginate: {
                        first: "Đầu",
                        last: "Cuối",
                        next: "Tiếp",
                        previous: "Trước"
                    }
                },
                pageLength: 10,
                responsive: true
            });
        });
        
        console.log('DataTables initialized successfully');
    } catch (e) {
        console.error('Error initializing DataTables:', e);
    }
}
