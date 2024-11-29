package com.project.book_store_be.Exception;

public class DiscountNameAlreadyExistsException extends RuntimeException {
    public DiscountNameAlreadyExistsException(String message) {
        super(message);
    }

}
