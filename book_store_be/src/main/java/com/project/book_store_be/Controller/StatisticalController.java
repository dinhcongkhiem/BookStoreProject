package com.project.book_store_be.Controller;

import com.project.book_store_be.Services.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/statistical")
public class StatisticalController {
    @Autowired
    private RevenueService revenueService;

    @GetMapping()
    public ResponseEntity<Map<String, Object>> getStatisticsAndRevenueProfit(
            @RequestParam String type) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> statistics = revenueService.getOrderStatistics();
        response.put("statistics", statistics);
        List<Map<String, BigDecimal>> data;
        if ("month".equalsIgnoreCase(type)) {
            data = revenueService.calculateMonthlyRevenueAndProfit();
        } else if ("week".equalsIgnoreCase(type)) {
            data = revenueService.calculateDailyRevenueAndProfitForCurrentWeek();
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid type parameter. Use 'month' or 'week'."));
        }

        response.put("data", data);

        return ResponseEntity.ok(response);
    }
}
