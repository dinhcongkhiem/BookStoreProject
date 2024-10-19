package com.project.book_store_be.Services;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.zip.CRC32;


@Service
public class AmazonS3Service {


    @Value("${s3.accessKey}")
    private String accessKey;
    @Value("${s3.secretKey}")
    private String secretKey;
    @Value("${s3.bucketName}")
    private String bucketName;
    private S3Client s3Client;
    @PostConstruct
    public void init() {
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        this.s3Client = S3Client.builder()
                .region(Region.AP_SOUTHEAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
    }
    public File convertToJpg(MultipartFile file) throws IOException {
        InputStream inputStream = file.getInputStream();
        BufferedImage bufferedImage = ImageIO.read(inputStream);
        if (bufferedImage == null) {
            throw new IOException("Could not read image from the provided file.");
        }
        BufferedImage jpgImage = new BufferedImage(bufferedImage.getWidth(), bufferedImage.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = jpgImage.createGraphics();
        g2d.drawImage(bufferedImage, 0, 0, null);
        g2d.dispose();
        File outputFile = File.createTempFile(hashFileName(Objects.requireNonNull(file.getOriginalFilename())), ".jpg");
        ImageIO.write(jpgImage, "jpg", outputFile);

        return outputFile;
    }
    public String uploadFile(MultipartFile file) throws IOException {
        File convertedFile = convertToJpg(file);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .acl(ObjectCannedACL.PUBLIC_READ)
                .key(convertedFile.getName())
                .build();

       s3Client.putObject(putObjectRequest, RequestBody.fromFile(convertedFile));

        convertedFile.delete();
        return "https://" + bucketName + ".s3." + Region.AP_SOUTHEAST_1.id() + ".amazonaws.com/" + convertedFile.getName();
    }
    private String hashFileName(String input) {
        CRC32 crc32 = new CRC32();
        crc32.update(input.getBytes(StandardCharsets.UTF_8));
        return Long.toHexString(crc32.getValue());
    }
}

