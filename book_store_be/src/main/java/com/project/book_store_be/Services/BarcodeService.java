package com.project.book_store_be.Services;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.Paragraph;
import org.springframework.stereotype.Service;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class BarcodeService {
    public String readBarcode( BufferedImage bufferedImage) throws IOException, NotFoundException {
        LuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

        Result result = new MultiFormatReader().decode(bitmap);
        return result.getText();
    }

    public byte[] generateBarcode(String text, int width, int height) throws Exception {
        BitMatrix bitMatrix = new MultiFormatWriter().encode(text, BarcodeFormat.CODE_128, width, height);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "png", outputStream);
        return outputStream.toByteArray();
    }

    public byte[] generateBarcodePdf(List<String> texts, int width, int height) throws Exception {
        ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(pdfOutputStream);
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument);

        for (String text : texts) {
            byte[] barcodeImageBytes = generateBarcode(text, width, height);
            Image barcodeImage = new Image(ImageDataFactory.create(barcodeImageBytes));
            document.add(barcodeImage);
            document.add(new Paragraph("Barcode: " + text).setMarginBottom(20)); // Optional caption
        }

        document.close();
        return pdfOutputStream.toByteArray();
    }






    public void generateBarcodeToFile(String text, int width, int height,String filePath) throws Exception{
        BitMatrix bitMatrix = new  MultiFormatWriter().encode(text, BarcodeFormat.CODE_128,width,height);
        Path path = FileSystems.getDefault().getPath(filePath);
        MatrixToImageWriter.writeToPath(bitMatrix,"png",path);
    }
}
