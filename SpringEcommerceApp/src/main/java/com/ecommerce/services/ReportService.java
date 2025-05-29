package com.ecommerce.services;

import java.util.Date;
import java.util.Map;

/**
 * Service for generating reports in the admin dashboard
 */
public interface ReportService {
    /**
     * Generate sales report data
     * @param periodType Type of period (daily, weekly, monthly, yearly)
     * @param fromDate Start date
     * @param toDate End date
     * @return Map containing report data
     */
    Map<String, Object> generateSalesReport(String periodType, Date fromDate, Date toDate);
    
    /**
     * Generate product report data
     * @param fromDate Start date
     * @param toDate End date
     * @return Map containing report data
     */
    Map<String, Object> generateProductReport(Date fromDate, Date toDate);
      /**
     * Generate customer report data
     * @param fromDate Start date
     * @param toDate End date
     * @return Map containing report data
     */
    Map<String, Object> generateCustomerReport(Date fromDate, Date toDate);
    
    /**
     * Generate seller report data
     * @param fromDate Start date
     * @param toDate End date
     * @return Map containing report data
     */
    Map<String, Object> generateSellerReport(Date fromDate, Date toDate);
    
    /**
     * Generate inventory report data
     * @return Map containing report data
     */
    Map<String, Object> generateInventoryReport();
    
    /**
     * Export report to Excel
     * @param reportType Type of report (sales, product, customer, inventory)
     * @param fromDate Start date
     * @param toDate End date
     * @return Excel file as byte array
     */
    byte[] exportReportToExcel(String reportType, Date fromDate, Date toDate);
}
