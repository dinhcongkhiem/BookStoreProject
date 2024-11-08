package com.project.book_store_be.Repository;

import com.project.book_store_be.Enum.Role;
import com.project.book_store_be.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerifyKey(String verifyKey);
    Optional<User> findByRefreshToken(String refreshToken);
    List<User> findByRole(Role role);

}
