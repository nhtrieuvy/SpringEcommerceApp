package com.ecommerce.pojo;

public enum PaymentMethod {
    CASH_ON_DELIVERY("Cash on Delivery"),
    PAYPAL("PayPal"),
    // STRIPE("Stripe"),
    ZALO_PAY("ZaloPay"),
    MOMO("MoMo");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    // Optional: a static method to get enum from string, useful for request parsing
    public static PaymentMethod fromString(String text) {
        for (PaymentMethod b : PaymentMethod.values()) {
            if (b.name().equalsIgnoreCase(text) || b.displayName.equalsIgnoreCase(text)) {
                return b;
            }
        }
        throw new IllegalArgumentException("No constant with text " + text + " found");
    }
}
