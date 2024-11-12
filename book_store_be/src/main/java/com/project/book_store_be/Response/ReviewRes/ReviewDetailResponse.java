package com.project.book_store_be.Response.ReviewRes;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class ReviewDetailResponse {
    private List<ReviewResponse> data;
    private MetaData metaData;

    @Data
    @Builder
    public static class MetaData {
        private float average;
        private int totalCount;
        private int countStar1;
        private int countStar2;
        private int countStar3;
        private int countStar4;
        private int countStar5;
    }
}
