package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    public Product updateProduct(Long id, Product productDetails) {
        Product pr = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        pr.setTitle(productDetails.getTitle());

        pr.setPublisher(productDetails.getPublisher());

        pr.setPublication_date(productDetails.getPublication_date());

        pr.setNumber_of_pages(productDetails.getNumber_of_pages());

        pr.setPrice(productDetails.getPrice());

        pr.setCategory(productDetails.getCategory());

        pr.setAuthor(productDetails.getAuthor());



        return productRepository.save(pr);
    }
}
