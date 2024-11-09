package com.project.book_store_be.Repository;

import com.project.book_store_be.Interface.ProductRepositoryCustom;
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

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class ProductRepositoryCustomImpl implements ProductRepositoryCustom {

    private final EntityManager entityManager;

    @Override
    public Page<Tuple> findProductsWithQtySold(Specification<Product> spec, Pageable pageable, boolean isTopSeller) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Tuple> query = cb.createTupleQuery();
        Root<Product> productRoot = query.from(Product.class);
        Join<Product, OrderDetail> orderDetailJoin = productRoot.join("orderDetails", JoinType.LEFT);
        Join<OrderDetail, Order> orderJoin = orderDetailJoin.join("order", JoinType.LEFT);

        Expression<Long> count = cb.count(
                cb.selectCase()
                        .when(cb.equal(orderJoin.get("status"), "COMPLETED"), orderDetailJoin.get("product").get("id"))
                        .otherwise(cb.literal(null)));

        Expression<Long> countInTimeRange = cb.count(
                cb.selectCase()
                        .when(cb.and(
                                cb.equal(orderJoin.get("status"), "COMPLETED"),
                                cb.between(orderJoin.get("orderDate"), LocalDateTime.now().minusWeeks(1), LocalDateTime.now())
                        ), orderDetailJoin.get("product").get("id"))
                        .otherwise(cb.literal(null))
        );

        query.select(cb.tuple(productRoot, count.alias("quantitySold")));

        Predicate predicate = spec.toPredicate(productRoot, query, cb);
        query.where(cb.and(predicate));
        query.groupBy(productRoot.get("id"));

        if (isTopSeller) {
            query.orderBy(cb.desc(countInTimeRange));
        } else {
            Sort.Order sort = pageable.getSort().toList().get(0);
            jakarta.persistence.criteria.Order order = sort.isAscending() ? cb.asc(productRoot.get(sort.getProperty())) : cb.desc(productRoot.get(sort.getProperty()));
            query.orderBy(order);
        }

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
