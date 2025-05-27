# Database Schema and Sample Data Fix Guide

## Issues Identified and Fixed:

### 1. Missing Database Schema Columns
- **Problem**: The User entity defines `google_id`, `facebook_id`, `auth_provider`, `is_active`, and `last_login` columns, but your database doesn't have these columns.
- **Cause**: The `hibernate.hbm2ddl.auto=update` property was not being applied in the Hibernate configuration.

### 2. Payment Methods Table Mismatch
- **Problem**: Sample data script was trying to insert into a non-existent `payment_methods` table.
- **Cause**: The application uses PaymentMethod enum values stored directly in the payments table, not a separate lookup table.

## Files Modified:

### 1. `HibernateConfigs.java` - FIXED
- Added the missing `hibernate.hbm2ddl.auto` property to ensure database schema auto-updates.

### 2. Created New Files:
- `schema_update.sql` - Manual database schema update script
- `sample_data_fixed.sql` - Corrected sample data without payment_methods table references

## How to Apply These Fixes:

### Option 1: Automatic Schema Update (Recommended)
1. Restart your Spring Boot application
2. Hibernate will automatically add the missing columns due to the fixed configuration
3. Use the new `sample_data_fixed.sql` script

### Option 2: Manual Schema Update
1. Run the `schema_update.sql` script first to add missing columns
2. Then run the `sample_data_fixed.sql` script

## Files to Use:
- ✅ Use: `sample_data_fixed.sql` (corrected version)
- ❌ Avoid: `sample_data.sql` (original with issues)

## Payment Method Enum Values:
The application supports these payment methods:
- CASH_ON_DELIVERY
- PAYPAL  
- STRIPE
- ZALO_PAY
- MOMO

## Next Steps:
1. Test the database connection
2. Apply the schema updates
3. Load the corrected sample data
4. Verify everything works properly
