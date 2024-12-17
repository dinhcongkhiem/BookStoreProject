package com.project.book_store_be.Exception;

public class ProductCodeAlreadyExistsException extends RuntimeException{
    public ProductCodeAlreadyExistsException(String message) {
        super(message);
    }

}