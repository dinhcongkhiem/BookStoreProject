package com.project.book_store_be.Services;

import com.project.book_store_be.Model.ImageProduct;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.ImageRepository;
import com.project.book_store_be.Repository.ProductRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
@Builder
public class ImageProductService {
    @Autowired
    private ImageRepository repo;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private AmazonS3Service service;

    public void uploadMultipleImageProduct(List<MultipartFile> images, Product product) {
        try {
            if (images != null && images.size() > 0) {
                for (MultipartFile image : images) {
                    this.uploadFileAsync(image, product.getId()).get();
                }
            }
        } catch (IOException | ExecutionException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    @Async
    public CompletableFuture<String> uploadFileAsync(MultipartFile file, Long productId) throws IOException {
        String fileUrl = uploadFile(file, productId);
        return CompletableFuture.completedFuture(fileUrl);
    }

    public String uploadFile(MultipartFile file, Long productId) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Invalid product ID:" + productId));
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        String fileName = file.getOriginalFilename();
        String fileUrl = service.uploadFile(fileName, file);
        ImageProduct imageProduct = ImageProduct.builder()
                .nameImage(product.getName() + "_" + fileName)
                .urlImage(fileUrl)
                .product(product)
                .build();
        repo.save(imageProduct);
        return fileUrl;
    }

    public void deleteImageProduct(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
        } else {
            throw new IllegalArgumentException("ImageProduct with ID " + id + "not found");
        }
    }

    public List<ImageProduct> listImageProductId(Long productId) {
        return repo.findByProductId(productId);
    }

    public Optional<ImageProduct> getImageProductId(Long productId) {
        return repo.findImageProductById(productId);
    }


}