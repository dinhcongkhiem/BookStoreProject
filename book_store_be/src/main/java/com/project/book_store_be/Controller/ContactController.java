package com.project.book_store_be.Controller;

import com.project.book_store_be.Request.ContactRequest;
import com.project.book_store_be.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/contact")
public class ContactController {

    private final UserService userService;

    @PostMapping()
    public String contactAdmin(@RequestBody ContactRequest contactRequest) {
        userService.sendContactEmailToAdmin(contactRequest);
        return "Email sent to admin successfully.";
    }
}
