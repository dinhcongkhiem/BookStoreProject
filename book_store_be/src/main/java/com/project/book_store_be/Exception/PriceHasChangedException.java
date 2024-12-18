package com.project.book_store_be.Exception;

public class PriceHasChangedException  extends RuntimeException{
    public PriceHasChangedException(String message) {
        super(message);
    }

}