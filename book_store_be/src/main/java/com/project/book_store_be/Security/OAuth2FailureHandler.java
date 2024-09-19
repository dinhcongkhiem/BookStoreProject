package com.project.book_store_be.Security;

import com.project.book_store_be.Exception.BadRequestException;
import com.project.book_store_be.util.CookieUtils;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {
    @Value("${client.url}")
    private String client_url;
    String defaultTargetUrl = client_url + "/oauth2/redirect?err=true";
    private final OAuth2SuccessHandler auth2SuccessHandler;
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request,response,exception);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) {
        log.error("Error Oauth2Login " + exception.getMessage());
        Optional<String> redirectUri = CookieUtils.getCookie(request, "redirect_uri")
                .map(Cookie::getValue);
        if (redirectUri.isPresent() && !auth2SuccessHandler.isAuthorizedRedirectUri(redirectUri.get())) {
            throw new BadRequestException("Sorry! We've got an Unauthorized Redirect URI and can't proceed with the authentication");
        }
        String targetUrl = redirectUri.orElse(defaultTargetUrl);
        return UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("err", true)
                .build().toUriString();
    }

}
