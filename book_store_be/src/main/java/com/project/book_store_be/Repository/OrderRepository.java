package com.project.book_store_be.Repository;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findByStatusAndDateRange(OrderStatus status, LocalDateTime startDate, LocalDateTime endDate);
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);

}
