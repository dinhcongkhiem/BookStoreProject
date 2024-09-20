package com.project.book_store_be.Request;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long customerId;
    private String comment;
    private int star;
    private int likeCount;
}
