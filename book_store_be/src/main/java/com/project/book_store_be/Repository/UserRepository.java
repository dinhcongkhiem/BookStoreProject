package com.project.book_store_be.Repository;

import com.project.book_store_be.Enum.Role;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByVerifyKey(String verifyKey);

    Optional<User> findByRefreshToken(String refreshToken);

    List<User> findByRole(Role role);
    List<User> findAllByIdNotIn(List<Long> ids);


    @Query(value = "SELECT * FROM users u WHERE " +
            "(:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
            "(:keyword IS NULL OR LOWER(u.phone_num) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
            "(:keyword IS NULL OR LOWER(u.full_name) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            nativeQuery = true)
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}