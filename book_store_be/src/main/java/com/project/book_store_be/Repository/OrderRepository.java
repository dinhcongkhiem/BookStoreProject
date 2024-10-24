package com.project.book_store_be.Repository;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    List<Order> findByStatus(OrderStatus status);
}
