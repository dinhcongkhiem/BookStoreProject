package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Product;
import org.hibernate.type.descriptor.converter.spi.JpaAttributeConverter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;


public interface ProductRepository extends JpaRepository<Product,Long> , CrudRepository<Product,Long>, JpaSpecificationExecutor<Product> {
    @Query("SELECT p FROM Product p " +
            "JOIN p.category c " +
            "JOIN p.author a " +
            "JOIN p.publisher pub " +
            "WHERE (:productName IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :productName, '%'))) " +
            "AND (:categoryName IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :categoryName, '%'))) " +
            "AND (:authorName IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :authorName, '%'))) " +
            "AND (:publisherName IS NULL OR LOWER(pub.name) LIKE LOWER(CONCAT('%', :publisherName, '%')))")
    List<Product> searchProducts(@Param("productName") String productName,
                                 @Param("categoryName") String categoryName,
                                 @Param("authorName") String authorName,
                                 @Param("publisherName") String publisherName);
}






