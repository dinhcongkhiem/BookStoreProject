package com.project.book_store_be.Response;

import com.project.book_store_be.Enum.NotificationStatus;
import com.project.book_store_be.Enum.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationStatus status;
    private String targetLink;
    private LocalDateTime createdAt;
}
