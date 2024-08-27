package com.project.book_store_be.Services;

import com.project.book_store_be.Exception.UserAlreadyExistsException;
import com.project.book_store_be.Model.Address;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.UserRepository;
import com.project.book_store_be.Request.ChangePasswordRequest;
import com.project.book_store_be.Request.ForgetPasswordRequest;
import com.project.book_store_be.Request.LoginRequest;
import com.project.book_store_be.Request.RegisterRequest;
import com.project.book_store_be.Response.AuthenticationResponse;
import com.project.book_store_be.Security.JwtService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AddressService addressService;
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @Value("${client.url}")
    private String clientUrl;
    @Value("${information.nameShop}")
    private String nameShop;
    @Value("${information.emailShop}")
    private String emailShop;

    @Value("${information.ccGmailShop}")
    private String ccGmailShop;
    public void register(RegisterRequest request) {
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        if(user.isPresent()) {
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
        this.sendEmail(newUser,"Kích hoạt tài khoản", "verifyAccountTemplate");
    }

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
        }catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }
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
            this.sendEmail(user,"Kích hoạt tài khoản", "verifyAccountTemplate");
            return false;
        }

    }

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

    public void forgetPassword(ForgetPasswordRequest forgetPasswordRequest) {
        User user = userRepository.findByEmail(forgetPasswordRequest.getEmail())
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        this.sendEmail(user,"Reset password","forgetPasswordTemplate");
    }

    public void setNewPassword(ChangePasswordRequest changePasswordRequest, String verifyKey) {
        User user = userRepository.findByVerifyKey(verifyKey)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        if(validVerifyKey(verifyKey)) {
            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            user.setVerifyKey(generateVerifyKey());
            userRepository.save(user);
        }
    }
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


    public String generateVerifyKey() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String expTime = sdf.format(new Date(System.currentTimeMillis() + 1000 * 60 * 60));
        return expTime + UUID.randomUUID();
    }
    public String generateRefreshToken(String email) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String current = sdf.format(new Date(System.currentTimeMillis()));
        return String.valueOf(UUID.nameUUIDFromBytes((email +  current).getBytes()));
    }


    public void sendEmail(User user, String subject, String template){
        try {
            String emailFrom = nameShop + "<"+ emailShop +">";
            Context context = new Context() ;
            context.setVariable("user",user);
            context.setVariable("clientUrl", clientUrl);
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            String htmlContent = templateEngine.process(template, context);

            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            helper.setCc(ccGmailShop);
            mailSender.send(mimeMessage);

        }catch(MessagingException e){
            e.printStackTrace();
        }
    }



}
