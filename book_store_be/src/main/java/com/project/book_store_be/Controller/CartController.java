package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.CartDetail;
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
    public ResponseEntity<List<CartDetail>> getAllCartDetails() {
        List<CartDetail> cartDetails = service.getAllCartDetails();
        return ResponseEntity.ok(cartDetails);
    }


    @PostMapping("/create")
    public Cart createCart(@RequestBody Cart cart){
        return  service.createCart(cart);
    }

    @PostMapping
    public CartDetail createCartDetail(@RequestBody CartDetail cartDetail){
        return service.createCartDetail(cartDetail);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartDetail> updateCartDetail(@PathVariable Long id, @RequestBody CartDetail cartDetail){
        try {
            CartDetail updateCartDetail = service.updateCartDetail(id, cartDetail);
            return ResponseEntity.ok(updateCartDetail);
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
