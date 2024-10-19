package com.project.book_store_be.Services;

import com.project.book_store_be.Repository.OrderDetailRepository;
import com.project.book_store_be.Repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
}
