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

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(userRequest);

        Map<String, Object> attributes = user.getAttributes();
        User newStudent = User
                .builder()
                .fullName((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .refreshToken(this.generateRefreshToken((String) attributes.get("email")))
                .role(Role.USER)
                .isEnabled(true)
                .build();
        LoginOuth2(newStudent);

        return user;
    }

    public void LoginOuth2(User user){
        boolean sdt = userRepository.findByEmail(user.getEmail()).isPresent();
        if(!sdt) {
            userRepository.save(user);
        }
    }

    public String generateRefreshToken(String email) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String current = sdf.format(new Date(System.currentTimeMillis()));
        return String.valueOf(UUID.nameUUIDFromBytes((email +  current).getBytes()));
    }


}
