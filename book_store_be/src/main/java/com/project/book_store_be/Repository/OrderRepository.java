package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
