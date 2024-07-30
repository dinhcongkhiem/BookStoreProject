package com.project.book_store_be.Exception;

public class DuplicatePseudonymException extends RuntimeException{
    public DuplicatePseudonymException(String message) {
        super(message);
    }
}
