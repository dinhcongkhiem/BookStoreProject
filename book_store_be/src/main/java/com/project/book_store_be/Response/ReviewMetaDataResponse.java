package com.project.book_store_be.Response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class ReviewMetaDataResponse {
    private int totalCount;
    private Map<Integer, List<ReviewResponse>> reviewsByStar;
}
