package com.project.book_store_be.Exception;

public class ProductQuantityNotEnough extends RuntimeException{
    public ProductQuantityNotEnough(String message) {
        super(message);
    }


}
