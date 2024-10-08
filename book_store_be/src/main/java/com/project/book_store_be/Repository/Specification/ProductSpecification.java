package com.project.book_store_be.Repository.Specification;

import com.project.book_store_be.Enum.ProductStatus;
import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Model.Category;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.Publisher;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {
    public static Specification<Product> getProduct(Long category, List<BigDecimal> price, List<Long> publisher, String keyword, ProductStatus status) {
        BigDecimal minPrice;
        BigDecimal maxPrice;
        if(price != null && !price.isEmpty()) {
            minPrice = price.get(0);
            if(price.size() == 2) {
                maxPrice = price.get(1);
            } else {
                maxPrice = null;
            }
        } else {
            maxPrice = null;
            minPrice = null;
        }

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null) {
                Join<Product, Category> categoryJoin = root.join("categories", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(categoryJoin.get("id"), category));
            }
            if (minPrice != null && maxPrice != null) {
                predicates.add(criteriaBuilder.between(root.get("price"), minPrice, maxPrice));
            }
            if (publisher != null && !publisher.isEmpty()) {
                Join<Product, Publisher> publisherJoin = root.join("publisher", JoinType.INNER);
                predicates.add(publisherJoin.get("id").in(publisher));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"),status));
            }
            if (keyword != null && !keyword.isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";

                Join<Product, Category> categoryJoin = root.join("categories", JoinType.LEFT);
                Join<Product, Publisher> publisherJoin = root.join("publisher", JoinType.LEFT);
                Join<Product, Author> authorJoin = root.join("authors", JoinType.LEFT);

                Predicate categoryPredicate = criteriaBuilder.like(criteriaBuilder.lower(categoryJoin.get("name")), likePattern);
                Predicate productPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate publisherPredicate = criteriaBuilder.like(criteriaBuilder.lower(publisherJoin.get("name")), likePattern);
                Predicate authorPredicate = criteriaBuilder.like(criteriaBuilder.lower(authorJoin.get("name")), likePattern);

                Predicate keywordPredicate = criteriaBuilder.or(categoryPredicate, productPredicate, publisherPredicate, authorPredicate);
                predicates.add(keywordPredicate);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
