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
    public List<Cart> findAll(){
        return repo.findAll();
    }

    public Cart createCart(Cart cart){
        return repo.save(cart);
    }

    public void delete(Long id) {
        Cart cart = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Cart not found"));
        repo.deleteById(id);
    }

    public Cart updateCart(Long id, Cart updateCart){
        return repo.findById(id).map(cart -> {
            cart.setQuantity(updateCart.getQuantity());
            cart.setTotalPrice(updateCart.getTotalPrice());
            cart.setCreated_date(updateCart.getCreated_date());
            cart.setUpdate_date(new Date());
            cart.setCreated_date(new Date());
            cart.setUser(updateCart.getUser());
            return  repo.save(cart);
        }).orElseThrow(() -> new RuntimeException("Cart not found with id" + id));
    }


}
