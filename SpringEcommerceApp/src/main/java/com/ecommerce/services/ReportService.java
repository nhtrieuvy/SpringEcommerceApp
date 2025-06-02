package com.ecommerce.services;

import java.util.Date;
import java.util.Map;

/**
 * Service for generating reports in the admin dashboard
 */
public interface ReportService {
    
    Map<String, Object> generateSalesReport(String periodType, Date fromDate, Date toDate);
    
   
    Map<String, Object> generateProductReport(Date fromDate, Date toDate);
      
    Map<String, Object> generateCustomerReport(Date fromDate, Date toDate);
    
   
    Map<String, Object> generateSellerReport(Date fromDate, Date toDate);
    
   
    Map<String, Object> generateInventoryReport();
    
  
    byte[] exportReportToExcel(String reportType, Date fromDate, Date toDate);
}
