package com.project.book_store_be.Request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class DisCountRequest {
    private String name;
    private Integer value;
    @DateTimeFormat(pattern = "dd/MM/yyyy")
    private LocalDateTime startDate;
    @DateTimeFormat(pattern = "dd/MM/yyyy")
    private LocalDateTime endDate;
    private List<Long> productIds;
    private Boolean isAll;
}
