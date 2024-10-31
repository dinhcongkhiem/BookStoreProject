package com.project.book_store_be.Controller;

import com.project.book_store_be.Response.GHTKStatusResponse;
import com.project.book_store_be.Services.GHTKStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ghtk/status")
public class GHTKStatusController {
    private final GHTKStatusService trackingService;

    @Autowired
    public GHTKStatusController(GHTKStatusService trackingService) {
        this.trackingService = trackingService;
    }

    @GetMapping("/tracking/{trackingOrder}")
    public ResponseEntity<GHTKStatusResponse> getOrderStatus(@PathVariable String trackingOrder) {
        GHTKStatusResponse response = trackingService.getTrackingStatus(trackingOrder);
        if (response != null && response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(500).body(response);
        }
    }
}
