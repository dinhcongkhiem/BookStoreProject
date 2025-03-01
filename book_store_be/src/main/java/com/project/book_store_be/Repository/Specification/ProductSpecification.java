package com.project.book_store_be.Repository.Specification;

import com.project.book_store_be.Enum.ProductStatus;
import com.project.book_store_be.Model.*;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RequiredArgsConstructor
public class ProductSpecification {

    public static Specification<Product> getProduct(Long category, List<Long> publisher, String keyword, ProductStatus status) {


        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null) {
                Join<Product, Category> categoryJoin = root.join("categories", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(categoryJoin.get("id"), category));
            }
            if (publisher != null && !publisher.isEmpty()) {
                Join<Product, Publisher> publisherJoin = root.join("publisher", JoinType.INNER);
                predicates.add(publisherJoin.get("id").in(publisher));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (keyword != null && !keyword.isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Join<Product, Category> categoryJoin = root.join("categories", JoinType.LEFT);
                Join<Product, Publisher> publisherJoin = root.join("publisher", JoinType.LEFT);
                Join<Product, Author> authorJoin = root.join("authors", JoinType.LEFT);

                Predicate categoryPredicate = criteriaBuilder.like(criteriaBuilder.lower(categoryJoin.get("name")), likePattern);
                Predicate productPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
                Predicate productIdPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("id").as(String.class)),
                        likePattern);
                Predicate productCodePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("productCode").as(String.class)),
                        likePattern);
                Predicate publisherPredicate = criteriaBuilder.like(criteriaBuilder.lower(publisherJoin.get("name")), likePattern);
                Predicate authorPredicate = criteriaBuilder.like(criteriaBuilder.lower(authorJoin.get("name")), likePattern);
                Predicate keywordPredicate = criteriaBuilder.or(categoryPredicate, productPredicate
                        ,productCodePredicate, productIdPredicate, publisherPredicate, authorPredicate);
                predicates.add(keywordPredicate);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
