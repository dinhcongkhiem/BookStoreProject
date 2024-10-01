package com.project.book_store_be.Response;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class DiscountResponse {
    private Long id;

    private Date startDate;

    private Date endDate;

    private Integer discountRate;

}
