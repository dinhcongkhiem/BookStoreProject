package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Repository.CartRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CartService {

    @Autowired
    private CartRepository repo;



}
