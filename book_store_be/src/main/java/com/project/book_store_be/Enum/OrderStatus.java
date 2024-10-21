package com.project.book_store_be.Enum;

public enum OrderStatus {
    AWAITING_PAYMENT("awaiting_payment"),
    COMPLETED("completed"),
    CANCELED("canceled"),
    PROCESSING("processing"),
    SHIPPING("shipping");
    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static OrderStatus fromValue(String value) {
        for (OrderStatus type : OrderStatus.values()) {
            if (type.getValue().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid order status: " + value);
    }
}
