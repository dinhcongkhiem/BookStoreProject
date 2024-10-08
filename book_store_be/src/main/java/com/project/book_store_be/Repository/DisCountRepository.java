package com.project.book_store_be.Repository;

import com.project.book_store_be.Enum.DiscountStatus;
import com.project.book_store_be.Model.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DisCountRepository extends JpaRepository<Discount,Long> {
    Optional<Discount> findByStatus(DiscountStatus status);
}
