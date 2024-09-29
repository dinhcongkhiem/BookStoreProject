package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.CartDetail;
import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Repository.CartDetailRepository;
import com.project.book_store_be.Repository.CartRepository;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository repo;

    @Autowired
    private CartDetailRepository cartDetailRepository;


    public Cart createCart(Cart cart){
        return repo.save(cart);
    }


    public CartDetail createCartDetail(CartDetail cartDetail) {
        return cartDetailRepository.save(cartDetail);
    }

    public List<CartDetail> getAllCartDetails() {
        return cartDetailRepository.findAll();
    }

    public CartDetail updateCartDetail(Long id, CartDetail updatedCartDetail) {
        Optional<CartDetail> existingCartDetail = cartDetailRepository.findById(id);
        if (existingCartDetail.isPresent()) {
            CartDetail cartDetail = existingCartDetail.get();
            cartDetail.setQuantity(updatedCartDetail.getQuantity());
            cartDetail.setProduct(updatedCartDetail.getProduct());
            cartDetail.setCart(updatedCartDetail.getCart());
            return cartDetailRepository.save(cartDetail);
        }
        return null;
    }

    public void delete(Long id) {
        CartDetail cartDetail = cartDetailRepository.findById(id).orElseThrow(() -> new NoSuchElementException("CartDetail not found"));
        repo.deleteById(id);
    }





}
