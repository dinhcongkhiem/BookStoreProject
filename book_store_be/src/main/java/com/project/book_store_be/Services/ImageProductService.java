package com.project.book_store_be.Services;

import com.project.book_store_be.Model.ImageProduct;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.ImageRepository;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Response.ImageProductResponse;
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

    public String uploadImage(MultipartFile images) {
        try {
            return service.uploadFile(images);
        }catch (IOException e) {
            System.out.println("Err when upload file img - ImgProductService - 38");
            return null;
        }
    }
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
        String fileUrl = InsertProductImage(file, productId);
        return CompletableFuture.completedFuture(fileUrl);
    }
    public String InsertProductImage(MultipartFile file, Long productId) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Invalid product ID:" + productId));
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        String fileName = String.valueOf(100 + (int)(Math.random() * 900));
        String fileUrl = service.uploadFile(file);
        ImageProduct imageProduct = ImageProduct.builder()
                .nameImage(product.getName() + "_" + fileName)
                .urlImage(fileUrl)
                .product(product)
                .build();
        repo.save(imageProduct);
        return fileUrl;
    }
    public List<ImageProductResponse> getImagesProductId(Long productId) {
        return repo.findByProductIdOrderByIsThumbnailDesc(productId).stream().map(this::convertToResponse).toList();
    }

    public ImageProduct getThumbnailProduct(Long productId) {
        return repo.findThumbnailByProductId(productId).orElse(null);
    }

    private ImageProductResponse convertToResponse(ImageProduct imageProduct) {
        return ImageProductResponse.builder()
                .id(imageProduct.getId())
                .urlImage(imageProduct.getUrlImage())
                .nameImage(imageProduct.getNameImage())
                .isThumbnail(imageProduct.getIsThumbnail())
                .build();
    }



}
