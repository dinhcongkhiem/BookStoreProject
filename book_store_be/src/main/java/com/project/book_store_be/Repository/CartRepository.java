package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface CartRepository extends JpaRepository<Cart,Long> {
    List<Cart> findAllByIdInAndUser(List<Long> ids, User user);
    Optional<Cart> findByUserAndProduct(User user, Product product);
    Page<Cart> findByUserOrderById(User user, Pageable pageable);
    long countByUser(User user);
}
