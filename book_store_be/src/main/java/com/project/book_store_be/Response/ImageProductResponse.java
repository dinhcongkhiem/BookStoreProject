package com.project.book_store_be.Response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ImageProductResponse {
    private Long id;
    private String nameImage;
    private String urlImage;
    private Boolean isThumbnail;
}
