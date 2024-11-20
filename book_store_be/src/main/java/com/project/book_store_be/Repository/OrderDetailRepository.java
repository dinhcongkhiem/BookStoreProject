package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    Optional<OrderDetail> findByOrderIdAndProductId(Long orderId, Long productId);
}
