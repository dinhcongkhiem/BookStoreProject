package com.project.book_store_be.Exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        log.error("Invalid input format from controller - HttpMessageNotReadableException");

        return new ResponseEntity<>("Invalid input format", HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<String> handleHttpMessageNotReadable(MissingServletRequestParameterException ex) {
        log.error("Invalid input format from controller - MissingServletRequestParameterException");
        return new ResponseEntity<>("Invalid input format - missing params", HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<String> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        log.error("Http request method not supported - ttpRequestMethodNotSupported");
        return new ResponseEntity<>("Http request method not supported, try again", HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(HttpRequestMethodNotSupportedException ex) {
        log.error("Invalid input format from controller - IllegalArgumentException");
        return new ResponseEntity<>("Invalid input format", HttpStatus.BAD_REQUEST);
    }
}
