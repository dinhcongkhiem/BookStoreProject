package com.project.book_store_be.Services;


import com.project.book_store_be.Enum.Role;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;


import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    private final SendMailService sendMailService;

    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(userRequest);
        Map<String, Object> attributes = user.getAttributes();
        String email = (String) attributes.get("email");

        if (!userRepository.findByEmail(email).isPresent()) {
            String defaultPassword = generateRandomPassword();
            User newUser = User.builder()
                    .fullName((String) attributes.get("name"))
                    .email(email)
                    .refreshToken(this.generateRefreshToken(email))
                    .role(Role.USER)
                    .isEnabled(true)
                    .password(defaultPassword)
                    .build();

            userRepository.save(newUser);
            Map<String, Object> emailVariables = new HashMap<>();
            emailVariables.put("newPassword", defaultPassword);
            sendMailService.sendEmail(newUser, "Thông báo mật khẩu", "notificationPasswordTemplate.html", emailVariables);
        }
        return user;
    }
    private String generateRandomPassword() {
        String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        int PASSWORD_LENGTH = 6;
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);

        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            password.append(CHARACTERS.charAt(index));
        }
        return password.toString();
    }

    public String generateRefreshToken(String email) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String current = sdf.format(new Date(System.currentTimeMillis()));
        return String.valueOf(UUID.nameUUIDFromBytes((email +  current).getBytes()));
    }


}