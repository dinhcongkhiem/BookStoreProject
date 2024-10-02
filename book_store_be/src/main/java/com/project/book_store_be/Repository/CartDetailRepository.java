package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.CartDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartDetailRepository extends JpaRepository<CartDetail,Long> {
    List<CartDetail> findByCartId(Long cartId);
    Page<CartDetail> findByCartId(Long cartId, Pageable pageable);
}
