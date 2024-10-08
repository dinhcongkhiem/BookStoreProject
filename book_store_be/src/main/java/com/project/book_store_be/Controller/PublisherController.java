package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Publisher;
import com.project.book_store_be.Services.PublisherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/publisher")
public class PublisherController {
    @Autowired
    private PublisherService publisherService;

    @GetMapping
    public ResponseEntity<List<Publisher>> getAllPublisher(@RequestParam(defaultValue = "") String keyword) {
        List<Publisher> publishers;
        if (keyword.isEmpty()) {
            publishers = publisherService.getAllPublisher();
        } else {
            publishers = publisherService.searchPublishersByName(keyword);
        }
        if (publishers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(publishers);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Publisher> getPublisherById(@PathVariable Long id){
        Optional<Publisher> publisher = publisherService.getPublisherById(id);
        return publisher.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @PostMapping
    public Publisher createPublisher(@RequestBody Publisher publisher){
        return publisherService.savePublisher(publisher);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePublisher(@PathVariable Long id){
        try {
            publisherService.deletePublisher(id);
            return ResponseEntity.ok("Publisher delete successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("publisher not found");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Publisher> updatePublisher(@PathVariable Long id, @RequestBody Publisher publisherDetails){
        try {
            Publisher updatePublisher = publisherService.updatePublisher(id, publisherDetails);
            return ResponseEntity.ok(updatePublisher);
        }catch (RuntimeException e){
            return ResponseEntity.notFound().build();
        }
    }
}
