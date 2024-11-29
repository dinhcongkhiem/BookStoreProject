package com.project.book_store_be.Exception;

public class AuthorAlreadyExistsException extends RuntimeException{
    public AuthorAlreadyExistsException(String message) {
        super(message);
    }

}