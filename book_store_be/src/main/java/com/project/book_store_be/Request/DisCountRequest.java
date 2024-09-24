package com.project.book_store_be.Request;

import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Builder
public class DisCountRequest {
    private Integer discountRate;
    private Date startDate;
    private Date endDate;
    private List<Long> productIds;
}
