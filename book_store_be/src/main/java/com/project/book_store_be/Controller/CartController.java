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

    @GetMapping
    public List<Cart> getListCart(){
        return service.findAll();
    }

    @PostMapping
    public Cart createCart(@RequestBody Cart cart){
        return service.createCart(cart);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cart> updateCart(@PathVariable Long id, @RequestBody Cart cart){
        try {
            Cart updateCart = service.updateCart(id, cart);
            return ResponseEntity.ok(updateCart);
        }catch (RuntimeException e){
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCart(@PathVariable Long id) {
        try {
            service.delete(id);
            return new ResponseEntity<>("Cart deleted successfully", HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>("Cart not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while deleting the cart", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
