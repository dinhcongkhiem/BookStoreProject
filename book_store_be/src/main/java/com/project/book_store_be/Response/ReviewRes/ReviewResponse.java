package com.project.book_store_be.Response.ReviewRes;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String userName;
    private Long customerId;
    private String comment;
    private int star;
    private int likeCount;
    private Date updateTime;

}
