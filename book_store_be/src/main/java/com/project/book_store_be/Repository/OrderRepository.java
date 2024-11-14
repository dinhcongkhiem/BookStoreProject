package com.project.book_store_be.Repository;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Model.User;
import jakarta.persistence.Tuple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;


public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByStatus(OrderStatus status);

    @Query(value = """
              SELECT
                 SUM(CASE WHEN status = 'AWAITING_PAYMENT' THEN 1 ELSE 0 END) AS awaiting_payment_count,
                 SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END) AS processing_count,
                 SUM(CASE WHEN status = 'SHIPPING' THEN 1 ELSE 0 END) AS shipping_count,
                 SUM(CASE WHEN status = 'CANCELED' THEN 1 ELSE 0 END) AS canceled_count,
                 SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_count,
                 COUNT(status) AS all_count
             FROM orders o;
            """, nativeQuery = true)
    Tuple countOrder();
}

