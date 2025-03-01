package com.project.book_store_be.Security;

import com.project.book_store_be.Exception.CustomAuthenticationEntryPoint;
import com.project.book_store_be.Repository.HttpCookieOAuth2AuthorizationRequestRepository;
import com.project.book_store_be.Services.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import static com.project.book_store_be.Enum.Role.*;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final LogoutHandler logoutHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieOAuth2AuthorizationRequestRepository;
    private final OAuth2SuccessHandler auth2SuccessHandler;
    private final OAuth2FailureHandler auth2FailureHandler;
    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${client.url}")
    private String clientUrl;

    private static final String[] WHITE_LIST_URL = {
            "/api/v1/auth/**",
            "/api-docs/**",
            "/swagger-ui/**",
            "/api/v1/product/detail",
            "/api/v1/payment/webhook/status",
            "/api/v1/contact",
    };

    private static final String[] WHITE_LIST_GET_METHOD = {
            "/api/v1/product", "/api/v1/product/available",
            "/api/v1/product/price-range", "/api/v1/product/attributes",
            "/api/v1/publisher/**", "/api/v1/category/**", "/api/v1/notifications/**",
            "/api/v1/review/detail/**"
    };

    private static final String[] USER_LIST_URL = {
            "/api/v1/review/**", "/api/v1/cart/**",
    };

    private static final String[] ADMIN_LIST_URL = {
            "/api/v1/admin/**", "/api/v1/publisher/**",
            "/api/v1/category/**", "/api/v1/product/**",
            "/api/v1/product/all"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(this.corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sessionManagement ->
                        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(req -> req
                        .requestMatchers(WHITE_LIST_URL).permitAll()
                        .requestMatchers(HttpMethod.GET, WHITE_LIST_GET_METHOD).permitAll()
                        .requestMatchers(USER_LIST_URL).hasAnyRole(USER.name())
                        .requestMatchers(ADMIN_LIST_URL).hasAnyRole(ADMIN.name())
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling.authenticationEntryPoint(new CustomAuthenticationEntryPoint()))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(logout ->
                        logout.logoutUrl("/api/v1/user/logout")
                                .addLogoutHandler(logoutHandler)
                                .logoutSuccessHandler(((request, response, authentication) -> SecurityContextHolder.clearContext())))
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint()
                        .baseUri("/oauth2/authorize")
                        .authorizationRequestRepository(cookieOAuth2AuthorizationRequestRepository)
                        .and()
                        .userInfoEndpoint().userService(customOAuth2UserService)
                        .and()
                        .successHandler(auth2SuccessHandler)
                        .failureHandler(auth2FailureHandler))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(clientUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
