package com.project.book_store_be.Enum;

public enum OrderStatus {
    PENDING,
    AWAITING_PAYMENT,
    COMPLETED,
    CANCELED,
    PROCESSING,
    SHIPPING;

    public boolean canTransitionTo(OrderStatus newStatus) {
        return switch (this) {
            case PENDING -> newStatus == CANCELED || newStatus == COMPLETED;
            case AWAITING_PAYMENT -> newStatus == PROCESSING || newStatus == CANCELED;
            case PROCESSING -> newStatus == SHIPPING || newStatus == CANCELED;
            case SHIPPING -> newStatus == COMPLETED || newStatus == CANCELED;
            default -> false;
        };
    }
}
