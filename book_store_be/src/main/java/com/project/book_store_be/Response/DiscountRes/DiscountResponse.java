package com.project.book_store_be.Response.DiscountRes;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class DiscountResponse {
    private Long id;
    private String name;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer discountRate;
    private List<Long> productIds;

}
