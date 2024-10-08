package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.math.BigDecimal;
import java.util.Map;


public interface ProductRepository extends JpaRepository<Product,Long> , CrudRepository<Product,Long>, JpaSpecificationExecutor<Product> {
    @Query("SELECT new map(MIN(p.price) as min, MAX(p.price) as max) FROM Product p")
    Map<BigDecimal, BigDecimal> findMinAndMaxPrice();

}






