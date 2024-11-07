package com.project.book_store_be.Controller;

import com.project.book_store_be.Services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("")
    public ResponseEntity<?> getListNotification(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer pageSize

    ) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(page,pageSize));
    }

    @GetMapping("/qty")
    public ResponseEntity<?> getQuantityUnreadNotification() {
        return ResponseEntity.ok(Map.of("qty", notificationService.getTotalUnreadNotification()));
    }

    @PutMapping()
    public ResponseEntity<?> updateStatus() {
        notificationService.markAsRead();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test")
    public void testNotify() {
        notificationService.test();
    }
}
