package com.project.book_store_be.Response;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthenticationResponse {
    private String accessToken;
    private String refreshToken;
    private UserResponse user;

}
