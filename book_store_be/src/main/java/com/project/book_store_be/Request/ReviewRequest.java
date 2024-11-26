package com.project.book_store_be.Request;

import lombok.Data;

@Data
public class ReviewRequest {
    private String comment;
    private Float star;
    private int likeCount;
}
