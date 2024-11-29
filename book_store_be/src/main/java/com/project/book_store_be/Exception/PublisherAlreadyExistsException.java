package com.project.book_store_be.Exception;

public class PublisherAlreadyExistsException extends RuntimeException{
    public PublisherAlreadyExistsException(String message) {
        super(message);
    }
}
