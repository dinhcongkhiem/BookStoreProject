package com.project.book_store_be.Repository;

import com.project.book_store_be.Enum.DiscountStatus;
import com.project.book_store_be.Model.DisCount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DisCountRepository extends JpaRepository<DisCount,Long> {
    Optional<DisCount> findByStatus(DiscountStatus status);
}
