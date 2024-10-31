package com.project.book_store_be.Controller;


import com.project.book_store_be.Response.GHTKRequest;
import com.project.book_store_be.Response.GHTKResponse;
import com.project.book_store_be.Services.GhtkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ghtk")
public class GHTKController {

    @Autowired
    private GhtkService ghtkService;

    @PostMapping
    public GHTKResponse createOrder(@RequestBody GHTKRequest ghtkRequest) {
        return ghtkService.createOrder(ghtkRequest);
    }
}
