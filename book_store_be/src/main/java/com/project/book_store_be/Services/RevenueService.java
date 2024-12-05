package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RevenueService {

    @Autowired
    private OrderRepository orderRepository;

    public List<Map<String, BigDecimal>> calculateMonthlyRevenueAndProfit() {
        List<Map<String, BigDecimal>> result = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            YearMonth yearMonth = YearMonth.of(LocalDate.now().getYear(), month);
            BigDecimal monthlyRevenue = BigDecimal.ZERO;
            BigDecimal monthlyProfit = BigDecimal.ZERO;
            List<Order> monthlyOrders = orderRepository.findByStatusAndDateRange(
                    OrderStatus.COMPLETED,
                    yearMonth.atDay(1).atStartOfDay(),
                    yearMonth.atEndOfMonth().atTime(23, 59, 59)
            );
            for (Order order : monthlyOrders) {
                monthlyRevenue = monthlyRevenue.add(order.getTotalPrice());
                BigDecimal totalCost = order.getOrderDetails().stream()
                        .map(detail -> detail.getProduct().getCost().multiply(new BigDecimal(detail.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                monthlyProfit = monthlyProfit.add(order.getTotalPrice().subtract(totalCost));
            }
            Map<String, BigDecimal> revenueProfitMap = new HashMap<>();
            revenueProfitMap.put("revenue", monthlyRevenue);
            revenueProfitMap.put("profit", monthlyProfit);

            result.add(revenueProfitMap);
        }
        return result;
    }

    public List<Map<String, BigDecimal>> calculateDailyRevenueAndProfitForCurrentWeek() {
        List<Map<String, BigDecimal>> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));



            List<Order> weeklyOrders = orderRepository.findByStatusAndDateRange(
                    OrderStatus.COMPLETED,
                    startOfWeek.atStartOfDay(),
                    endOfWeek.atTime(23, 59, 59)
            );

        Map<LocalDate, List<Order>> ordersGroupedByDate = weeklyOrders.stream()
                .collect(Collectors.groupingBy(order -> order.getOrderDate().toLocalDate()));
        for (LocalDate date = startOfWeek; !date.isAfter(endOfWeek); date = date.plusDays(1)) {
            BigDecimal dailyRevenue = BigDecimal.ZERO;
            BigDecimal dailyProfit = BigDecimal.ZERO;
            List<Order> dailyOrders = ordersGroupedByDate.getOrDefault(date, Collections.emptyList());
            for (Order order : dailyOrders) {
                dailyRevenue = dailyRevenue.add(order.getTotalPrice());
                BigDecimal totalCost = order.getOrderDetails().stream()
                        .map(detail -> detail.getProduct().getCost().multiply(new BigDecimal(detail.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                dailyProfit = dailyProfit.add(order.getTotalPrice().subtract(totalCost));
            }

            Map<String, BigDecimal> dailyData = new HashMap<>();
            dailyData.put("revenue", dailyRevenue);
            dailyData.put("profit", dailyProfit);
            result.add(dailyData);
        }

        return result;

}

    public Map<String, Object> getOrderStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
//        List<Order> todaysOrders = orderRepository.DateRange(startOfDay, endOfDay );
        List<Order> todaysOrdersRevene = orderRepository.findByStatusAndDateRange(OrderStatus.COMPLETED,startOfDay, endOfDay );
        int ordersPerDay = todaysOrdersRevene.size();
        BigDecimal todayRevenue = todaysOrdersRevene.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Order> allOrders = orderRepository.findByStatus(OrderStatus.COMPLETED);
        int totalOrders = allOrders.size();
        BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        statistics.put("ordersPerDay", ordersPerDay);
        statistics.put("totalOrders", totalOrders);
        statistics.put("todayRevenue", todayRevenue);
        statistics.put("totalRevenue", totalRevenue);
        return statistics;
    }



}
