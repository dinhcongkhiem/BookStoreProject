package com.project.book_store_be.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.book_store_be.Enum.NotificationStatus;
import com.project.book_store_be.Enum.NotificationType;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    private String title;
    private String message;
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    @Enumerated(EnumType.STRING)
    private NotificationStatus status;
    private String targetLink;
    private LocalDateTime createdAt;
}
