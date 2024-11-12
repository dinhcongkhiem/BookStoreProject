package com.project.book_store_be.Repository.Specification;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.ProductStatus;
import com.project.book_store_be.Model.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {
    public static Specification<Order> getOrders(User user,OrderStatus status, String keyword) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if(user != null) {
                predicates.add(criteriaBuilder.equal(root.get("user"),user));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (keyword != null && !keyword.isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Join<Order, OrderDetail> orderDetailJoin = root.join("orderDetails", JoinType.INNER);
                Join<OrderDetail, Product> productJoin = orderDetailJoin.join("product", JoinType.INNER);

                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(productJoin.get("name")), likePattern));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
