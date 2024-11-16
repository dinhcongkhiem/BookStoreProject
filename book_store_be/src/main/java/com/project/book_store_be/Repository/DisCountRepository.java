package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Discount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DisCountRepository extends JpaRepository<Discount, Long> {

    @Query("SELECT d FROM Discount d " +
            "WHERE (:keyword IS NULL OR UPPER(d.name) LIKE CONCAT('%', UPPER(:keyword), '%')) " +
            "AND ((:status IS NULL) " +
            "     OR (:status = 0 AND d.startDate > CURRENT_DATE) " +
            "     OR (:status = 1 AND d.startDate <= CURRENT_DATE AND d.endDate >= CURRENT_DATE) " +
            "     OR (:status = -1 AND d.endDate < CURRENT_DATE))")
    Page<Discount> getDiscount(Pageable pageable, String keyword, Integer status);

    @Modifying
    @Query(value = "DELETE FROM product_discount WHERE discount_id = :discountId", nativeQuery = true)
    void deleteProductDiscountLinks(@Param("discountId") Long discountId);

}
