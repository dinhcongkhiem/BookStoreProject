package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.CartDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartDetailRepository extends JpaRepository<CartDetail,Long> {
}
