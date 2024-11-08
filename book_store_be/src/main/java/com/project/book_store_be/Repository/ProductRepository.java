package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Model.Product;
import jakarta.persistence.Tuple;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


public interface ProductRepository extends JpaRepository<Product, Long>, CrudRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    @Query("SELECT new map(MIN(p.price) as min, MAX(p.price) as max) FROM Product p")
    Map<BigDecimal, BigDecimal> findMinAndMaxPrice();

    @Query("SELECT p, COUNT(od.product.id) " +
            "FROM Product p " +
            "JOIN p.authors a " +
            "LEFT JOIN p.orderDetails od " +
            "LEFT JOIN od.order o ON o.id = od.order.id " +
            "WHERE a IN :authors " +
            "AND p.id <> :productId " +
            "AND (o.status = 'COMPLETED' OR o.status IS NULL) " +
            "GROUP BY p.id")
    List<Tuple> findTop10ByAuthorsExceptCurrent(@Param("authors") List<Author> authors,
                                                  @Param("productId") Long productId, Pageable pageable);

    Page<Product> searchByNameContainingIgnoreCaseOrId(String name, Long id, Pageable pageable);

}






