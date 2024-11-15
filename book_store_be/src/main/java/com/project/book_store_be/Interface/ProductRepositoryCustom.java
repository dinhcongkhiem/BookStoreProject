package com.project.book_store_be.Interface;

import java.math.BigDecimal;
import java.util.List;

import com.project.book_store_be.Model.Product;
import jakarta.persistence.Tuple;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

public interface ProductRepositoryCustom {
    Page<Tuple> findProductsWithQtySold(Specification<Product> spec, Pageable pageable, String sort, List<BigDecimal> price);
}
