package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.NotificationStatus;
import com.project.book_store_be.Enum.NotificationType;
import com.project.book_store_be.Model.Notification;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.NotificationRepository;
import com.project.book_store_be.Response.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final UserService userService;

    public Page<Notification> getNotificationsForUser(Integer page, Integer pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        User user = userService.getCurrentUser();
        return notificationRepository.findByUser(user, pageable);
    }

    public Integer getTotalUnreadNotification() {
        User user = userService.getCurrentUser();
        return notificationRepository.countByStatusAndUser(NotificationStatus.UNREAD, user);
    }

    public void markAsRead() {
        List<Notification> notifications = notificationRepository.findByStatus(NotificationStatus.UNREAD);
        notifications.forEach(n -> {
            n.setStatus(NotificationStatus.READ);
        });
        notificationRepository.saveAll(notifications);
    }

    public void test() {
        messagingTemplate.convertAndSend("/stream/barcode", true);
    }

    public void sendNotification(User user, String title, String message, NotificationType type, String targetLink) {
        Notification notification = this.createNotification(user, title, message, type, targetLink);
        messagingTemplate.convertAndSendToUser(user.getEmail(), "/notifications", this.convertToRes(notification));
    }

    public void sendAdminNotification(String title, String message, NotificationType type, String targetLink) {
        List<User> adminUsers = userService.getAdminUser();
        adminUsers.forEach(a -> {
            this.createNotification(a, title, message, type, targetLink);
        });
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setUser(adminUsers.get(0));
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());
        messagingTemplate.convertAndSend("/admin/notifications", this.convertToRes(notification));
    }


    public Notification createNotification(User user, String title, String message, NotificationType type, String targetLink) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setUser(user);
        notification.setTargetLink(targetLink);
        notification.setMessage(message);
        notification.setType(type);
        notification.setStatus(NotificationStatus.UNREAD);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
        return notification;
    }


    private NotificationResponse convertToRes(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .userId(notification.getUser().getId())
                .status(notification.getStatus())
                .type(notification.getType())
                .createdAt(notification.getCreatedAt())
                .build();
    }


}
