package com.project.book_store_be.Controller;

import com.google.zxing.NotFoundException;
import com.project.book_store_be.Exception.MaxFinalPriceOrderException;
import com.project.book_store_be.Request.BarcodeRequest;
import com.project.book_store_be.Services.BarcodeService;
import com.project.book_store_be.Services.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;


@Controller
@RequiredArgsConstructor
@Slf4j
public class StreamBarcodeController {
    private final BarcodeService barcodeService;
    private final OrderServiceImpl orderService;

    @MessageMapping("/barcode")
    @SendTo("/topic/barcode")
    public void processBarcode(@Payload BarcodeRequest request) {
        try {
            String base64Image = request.getBase64Image();
            byte[] decodedBytes = Base64.getDecoder().decode(base64Image);
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(decodedBytes));
            String test = barcodeService.readBarcode(image);

            if (test.length() > 0) {
                orderService.createOrderDetailByBarcode(test, request.getOrderId());
            }
        } catch (NotFoundException | IOException e) {
            System.out.println("Error");
        }
    }
}