package com.project.book_store_be.Response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String fullName;
    private String comment;
    private int star;
    private int likeCount;
    private LocalDateTime  updateTime;

}
