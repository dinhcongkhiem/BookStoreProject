package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.Role;
import com.project.book_store_be.Exception.UserAlreadyExistsException;
import com.project.book_store_be.Interface.AuthenticationService;
import com.project.book_store_be.Model.Address;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.UserRepository;
import com.project.book_store_be.Request.ChangePasswordRequest;
import com.project.book_store_be.Request.ForgetPasswordRequest;
import com.project.book_store_be.Request.LoginRequest;
import com.project.book_store_be.Request.RegisterRequest;
import com.project.book_store_be.Response.AuthenticationResponse;
import com.project.book_store_be.Security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AddressServiceImpl addressService;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final SendMailService sendMailService;

    @Value("${client.url}")
    private String clientUrl;

    @Override
    public void register(RegisterRequest request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        if (user.isPresent()) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }
        Address address = addressService.createAddress(request.getAddress());
        User newUser = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .address(address)
                .phoneNum(request.getPhoneNum())
                .verifyKey(this.generateVerifyKey())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .refreshToken(this.generateRefreshToken(request.getEmail()))
                .build();


        userRepository.save(newUser);
        sendMailService.sendEmail(newUser, "Kích hoạt tài khoản",
                "verifyAccountTemplate", Map.of("clientUrl", clientUrl));
    }

    @Override
    public AuthenticationResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
            ));
            User user = this.userRepository.findByEmail(request.getEmail()).orElseThrow();
            return AuthenticationResponse
                    .builder()
                    .accessToken(jwtService.generateToken(user))
                    .refreshToken(user.getRefreshToken())
                    .user(userService.getUserInfor(user))
                    .build();
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    @Override
    public boolean verifyAccount(String verifyKey) {
        User user = userRepository.findByVerifyKey(verifyKey).orElseThrow();
        if (validVerifyKey(verifyKey)) {
            user.setEnabled(true);
            user.setVerifyKey(this.generateVerifyKey());
            userRepository.save(user);
            return true;
        } else {
            user.setVerifyKey(this.generateVerifyKey());
            userRepository.save(user);

            sendMailService.sendEmail(user, "Kích hoạt tài khoản",
                    "verifyAccountTemplate", Map.of("clientUrl", clientUrl));
            return false;
        }

    }

    @Override
    public AuthenticationResponse refreshAccessToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken).orElseThrow();
        String newRefreshToken = generateRefreshToken(user.getEmail());
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);
        return AuthenticationResponse
                .builder()
                .accessToken(jwtService.generateToken(user))
                .refreshToken(user.getRefreshToken())
                .user(userService.getUserInfor(user))
                .build();
    }

    @Override
    public void forgetPassword(ForgetPasswordRequest forgetPasswordRequest) {
        User user = userRepository.findByEmail(forgetPasswordRequest.getEmail())
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        if(user.getVerifyKey() == null) {
            user.setVerifyKey(generateVerifyKey());
            userRepository.save(user);
        }
        sendMailService.sendEmail(user, "Reset password",
                "forgetPasswordTemplate", Map.of("clientUrl", clientUrl));
    }

    @Override
    public void setNewPassword(ChangePasswordRequest changePasswordRequest, String verifyKey) {
        User user = userRepository.findByVerifyKey(verifyKey)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        if (validVerifyKey(verifyKey)) {
            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            user.setVerifyKey(generateVerifyKey());
            userRepository.save(user);
        }
    }

    @Override
    public boolean validVerifyKey(String activeKey) {
        try {

            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
            Date CurrentTime = new Date();
            String activeTime = activeKey.substring(0, 14);
            return CurrentTime.before(sdf.parse(activeTime));
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String generateVerifyKey() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String expTime = sdf.format(new Date(System.currentTimeMillis() + 1000 * 60 * 60));
        return expTime + UUID.randomUUID();
    }
    @Override
    public String generateRefreshToken(String email) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String current = sdf.format(new Date(System.currentTimeMillis()));
        return String.valueOf(UUID.nameUUIDFromBytes((email + current).getBytes()));
    }

    @Override
    public void registerByAdmin(RegisterRequest request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        if (user.isPresent()) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }
        String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        int PASSWORD_LENGTH = 6;
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);

        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            password.append(CHARACTERS.charAt(index));
        }
        Address address = addressService.createAddress(request.getAddress());
        User newUser = User.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .address(address)
                .phoneNum(request.getPhoneNum())
                .verifyKey(this.generateVerifyKey())
                .password(passwordEncoder.encode(password.toString()))
                .role(Role.USER)
                .refreshToken(this.generateRefreshToken(request.getEmail()))
                .isEnabled(true)
                .build();
        userRepository.save(newUser);
//       send mail to user ( cảm ơn .... đã đăng kí password mặc định của bạn là bookbazaar)
    }
}
