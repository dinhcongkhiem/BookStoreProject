package com.project.book_store_be.Controller;

import com.project.book_store_be.Services.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistical")
public class StatisticalController {
    @Autowired
    private RevenueService revenueService;

    @GetMapping("/monthly-revenue-profit")
    public List<Map<String, BigDecimal>> getMonthlyRevenueAndProfit() {
        return revenueService.calculateMonthlyRevenueAndProfit();
    }

    @GetMapping("/current-week")
    public List<Map<String, Object>> getDailyRevenueAndProfitForCurrentWeek() {
        return revenueService.calculateDailyRevenueAndProfitForCurrentWeek();
    }

    @GetMapping("/statistics")
    public Map<String, Object> getOrderStatistics() {
        return revenueService.getOrderStatistics();
    }
}
