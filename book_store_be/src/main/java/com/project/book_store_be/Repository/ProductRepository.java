package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Model.Product;
import jakarta.persistence.LockModeType;
import jakarta.persistence.Tuple;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;


public interface ProductRepository extends JpaRepository<Product, Long>, CrudRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    @Query("SELECT new map(MIN(p.original_price) as min, MAX(p.original_price) as max) FROM Product p")
    Map<BigDecimal, BigDecimal> findMinAndMaxPrice();

    @Query("SELECT p,   SUM(CASE " +
            "WHEN o.status = 'COMPLETED' THEN 1" +
            "ELSE 0 " +
            "END) AS product_count " +
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

    List<Product> findAllByIdNotIn(List<Long> ids);
    Optional<Product> findByProductCode(Long productCode);

    @Query("""
                SELECT p AS product,\s
                       SUM(CASE\s
                               WHEN o.status = 'COMPLETED' THEN 1\s
                               ELSE 0\s
                           END) AS product_count
                FROM Product p
                LEFT JOIN p.orderDetails od
                LEFT JOIN od.order o
                WHERE p.id = :productId
                GROUP BY p.id
            """)
    Tuple findProductWithQtySold(@Param("productId") Long productId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") Long id);

}






