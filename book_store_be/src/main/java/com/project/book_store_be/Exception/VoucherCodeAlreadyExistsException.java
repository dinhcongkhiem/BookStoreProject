package com.project.book_store_be.Exception;

public class VoucherCodeAlreadyExistsException  extends RuntimeException{
    public VoucherCodeAlreadyExistsException(String message) {
        super(message);
    }

}