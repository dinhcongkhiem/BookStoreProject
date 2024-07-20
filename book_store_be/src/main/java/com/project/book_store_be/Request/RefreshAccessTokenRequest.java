package com.project.book_store_be.Request;


import lombok.Data;

@Data
public class RefreshAccessTokenRequest {
    private String refreshToken;
}
