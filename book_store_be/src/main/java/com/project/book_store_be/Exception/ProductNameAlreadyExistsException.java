package com.project.book_store_be.Exception;

public class ProductNameAlreadyExistsException extends RuntimeException{
    public ProductNameAlreadyExistsException(String message) {
        super(message);
    }

}