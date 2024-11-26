package com.project.book_store_be.Enum.Interface;

import com.project.book_store_be.Request.ChangePasswordRequest;
import com.project.book_store_be.Request.ForgetPasswordRequest;
import com.project.book_store_be.Request.LoginRequest;
import com.project.book_store_be.Request.RegisterRequest;
import com.project.book_store_be.Response.AuthenticationResponse;
public interface AuthenticationService {
    void register(RegisterRequest request);
    AuthenticationResponse login(LoginRequest request);
    boolean verifyAccount(String verifyKey);
    AuthenticationResponse refreshAccessToken(String refreshToken);
    void forgetPassword(ForgetPasswordRequest forgetPasswordRequest);
    void setNewPassword(ChangePasswordRequest changePasswordRequest, String verifyKey);
    boolean validVerifyKey(String activeKey);
    String generateVerifyKey();
    String generateRefreshToken(String email);
}
