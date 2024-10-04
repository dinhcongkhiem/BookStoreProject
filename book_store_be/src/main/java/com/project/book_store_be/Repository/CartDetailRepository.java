package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.CartDetail;
import com.project.book_store_be.Model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartDetailRepository extends JpaRepository<CartDetail,Long> {
    Optional<CartDetail> findByCartAndProduct(Cart cart, Product product);
    Page<CartDetail> findByCart(Cart cart, Pageable pageable);


}
