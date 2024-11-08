package com.project.book_store_be.Repository;

import com.project.book_store_be.Enum.NotificationStatus;
import com.project.book_store_be.Model.Notification;
import com.project.book_store_be.Model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUser(User user, Pageable pageable);

    List<Notification> findByStatus(NotificationStatus status);

    Integer countByStatusAndUser(NotificationStatus status, User user);
}
