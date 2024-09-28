package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Services.CartService;
import org.hibernate.sql.Update;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    @Autowired
    private CartService service;


}
