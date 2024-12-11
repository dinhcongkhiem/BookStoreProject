package com.project.book_store_be.Repository.Specification;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.OrderType;
import com.project.book_store_be.Enum.ProductStatus;
import com.project.book_store_be.Model.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {
    public static Specification<Order> getOrders(User user, OrderStatus status, LocalDateTime start, LocalDateTime end, OrderType orderType, String keyword) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (user != null) {
                predicates.add(criteriaBuilder.equal(root.get("user"), user));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }
            if (orderType != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), orderType));
            }
            if (start != null && end != null) {
                LocalDateTime startDate = start.withHour(0).withMinute(0).withSecond(0);
                LocalDateTime endDate = end.withHour(23).withMinute(59).withSecond(59);
                predicates.add(criteriaBuilder.between(root.get("orderDate"), startDate, endDate));
            }
            if (keyword != null && !keyword.isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Join<Order, OrderDetail> orderDetailJoin = root.join("orderDetails", JoinType.INNER);
                Join<OrderDetail, Product> productJoin = orderDetailJoin.join("product", JoinType.INNER);

                Predicate buyerName = criteriaBuilder.like(criteriaBuilder.lower(root.get("buyerName")), likePattern);
                Predicate phoneNum = criteriaBuilder.like(criteriaBuilder.lower(root.get("phoneNum")), likePattern);
                Predicate orderCode = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("id").as(String.class)),
                        likePattern);
                Predicate ProductName = criteriaBuilder.like(
                        criteriaBuilder.lower(productJoin.get("name")), likePattern);
                Predicate keywordPredicate = criteriaBuilder.or(buyerName, orderCode, ProductName,phoneNum);
                predicates.add(keywordPredicate);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
