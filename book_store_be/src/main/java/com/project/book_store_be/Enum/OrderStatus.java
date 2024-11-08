package com.project.book_store_be.Enum;

public enum OrderStatus {
    AWAITING_PAYMENT,
    COMPLETED,
    CANCELED,
    PROCESSING,
    SHIPPING;

    public boolean canTransitionTo(OrderStatus newStatus) {
        switch (this) {
            case AWAITING_PAYMENT:
                return newStatus == PROCESSING;

            case PROCESSING:
                return newStatus == SHIPPING || newStatus == CANCELED;

            case SHIPPING:
                return newStatus == COMPLETED || newStatus == CANCELED;

            case COMPLETED:
            case CANCELED:
                return false;

            default:
                return false;
        }
    }
}
