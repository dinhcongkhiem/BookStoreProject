package com.project.book_store_be.Repository;

import com.project.book_store_be.Interface.ProductRepositoryCustom;
import com.project.book_store_be.Model.Discount;
import com.project.book_store_be.Model.OrderDetail;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.Order;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Repository
@RequiredArgsConstructor
public class ProductRepositoryCustomImpl implements ProductRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<Tuple> findProductsWithQtySold(Specification<Product> spec, Pageable pageable, String sort, List<BigDecimal> price) {
        BigDecimal minPrice;
        BigDecimal maxPrice;
        if (price != null && !price.isEmpty()) {
            minPrice = price.get(0);
            maxPrice = (price.size() == 2) ? price.get(1) : null;
        } else {
            maxPrice = null;
            minPrice = null;
        }
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Tuple> query = cb.createTupleQuery();
        Root<Product> productRoot = query.from(Product.class);
        Join<Product, OrderDetail> orderDetailJoin = productRoot.join("orderDetails", JoinType.LEFT);
        Join<OrderDetail, Order> orderJoin = orderDetailJoin.join("order", JoinType.LEFT);

        Join<Product, Discount> discountJoin = productRoot.join("discounts", JoinType.LEFT);
        Subquery<LocalDateTime> subquery = query.subquery(LocalDateTime.class);
        Root<Product> subqueryRoot = subquery.from(Product.class);
        Join<Product, Discount> subqueryDiscountJoin = subqueryRoot.join("discounts", JoinType.LEFT);
        Expression<LocalDateTime> maxCreateDate = cb.greatest(subqueryDiscountJoin.<LocalDateTime>get("createDate"));
        subquery.select(maxCreateDate);
        subquery.where(cb.equal(subqueryRoot, productRoot));
        Predicate discountPredicate = cb.equal(discountJoin.get("createDate"), subquery);
        Predicate noDiscountPredicate = cb.isNull(discountJoin.get("createDate"));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.or(discountPredicate, noDiscountPredicate));

        Expression<BigDecimal> discountedPrice = cb.selectCase()
                .when(
                        cb.and(
                                cb.isNotNull(discountJoin.get("discountRate")),
                                cb.greaterThanOrEqualTo(cb.currentTimestamp(), discountJoin.get("startDate")),
                                cb.lessThanOrEqualTo(cb.currentTimestamp(), discountJoin.get("endDate"))
                        ),
                        cb.diff(
                                productRoot.get("original_price"),
                                cb.quot(
                                        cb.prod(
                                                productRoot.get("original_price"),
                                                cb.coalesce(discountJoin.get("discountRate"), cb.literal(BigDecimal.ZERO))
                                        ),
                                        cb.literal(BigDecimal.valueOf(100))
                                )
                        )
                )
                .otherwise(productRoot.get("original_price"))
                .as(BigDecimal.class);


        if (minPrice != null && maxPrice != null) {
            predicates.add(cb.between(discountedPrice, minPrice, maxPrice));
        }

//        Expression<Long> count = cb.count(
//                cb.selectCase()
//                        .when(cb.equal(orderJoin.get("status"), "COMPLETED"), orderDetailJoin.get("product").get("id"))
//                        .otherwise(cb.literal(null)));
        Expression<Long> count = cb.sum(
                cb.selectCase()
                        .when(cb.equal(orderJoin.get("status"), "COMPLETED"), orderDetailJoin.get("quantity"))
                        .otherwise(cb.literal(0)).as(Long.class)
        );


        Expression<Long> countInTimeRange = cb.count(
                cb.selectCase()
                        .when(cb.and(
                                cb.equal(orderJoin.get("status"), "COMPLETED"),
                                cb.between(orderJoin.get("orderDate"), LocalDateTime.now().minusWeeks(1), LocalDateTime.now())
                        ), orderDetailJoin.get("quantity"))
                        .otherwise(cb.literal(0)).as(Long.class));

        query.select(cb.tuple(productRoot, count.alias("quantitySold")));

        predicates.add(spec.toPredicate(productRoot, query, cb));
        query.where(cb.and(predicates.toArray(new Predicate[0])));
        query.groupBy(productRoot.get("id"), discountJoin.get("discountRate"), discountJoin.get("startDate"), discountJoin.get("endDate"));

        jakarta.persistence.criteria.Order orderToSort = switch (Objects.requireNonNull(sort)) {
            case "top_seller" -> cb.desc(countInTimeRange);
            case "price_desc" -> cb.desc(discountedPrice);
            case "price_asc" -> cb.asc(discountedPrice);
            default -> {
                if (pageable.getSort().isSorted()) {
                    Sort.Order sortOrder = pageable.getSort().toList().get(0);
                    yield sortOrder.isAscending() ?
                            cb.asc(productRoot.get(sortOrder.getProperty())) :
                            cb.desc(productRoot.get(sortOrder.getProperty()));
                } else {
                    throw new IllegalArgumentException("No valid sorting option provided.");
                }
            }
        };

        query.orderBy(orderToSort);

        TypedQuery<Tuple> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Tuple> results = typedQuery.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Product> countRoot = countQuery.from(Product.class);
        Predicate predicate1 = spec.toPredicate(countRoot, query, cb);
        countQuery.where(cb.and(predicate1));

        countQuery.select(cb.countDistinct(countRoot));
        Long total = entityManager.createQuery(countQuery).getSingleResult();


        return new PageImpl<>(results, pageable, total);
    }


}
