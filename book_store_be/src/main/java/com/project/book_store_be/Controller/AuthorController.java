package com.project.book_store_be.Controller;

import com.project.book_store_be.Exception.AuthorAlreadyExistsException;
import com.project.book_store_be.Exception.AuthorNotFoundException;
import com.project.book_store_be.Interface.AuthorService;
import com.project.book_store_be.Model.Author;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/authors")
public class AuthorController {
    @Autowired
    private AuthorService authorService;

    @GetMapping
    public List<Author> getAllPublisher(@RequestParam(defaultValue = "") String keyword) {
        if (keyword.isEmpty()) {
            return authorService.getAllAuthor();
        } else {
            return authorService.searchPublishersByName(keyword);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthorById(@PathVariable Long id) {
        Optional<Author> author = authorService.getAuthorById(id);
        return author.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateAuthor(@PathVariable Long id, @RequestBody Author authorDetails) {
        try {
            authorService.updateAuthor(id, authorDetails);
            return ResponseEntity.ok("Author updated successfully");
        } catch (AuthorNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (AuthorAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<String> createAuthor(@RequestBody Author author) {
        try {
            authorService.saveAuthor(author);
            return ResponseEntity.ok("Author crated successfully");
        } catch (AuthorAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAuthor(@PathVariable Long id) {
        try {
            authorService.deleteAuthor(id);
            return ResponseEntity.ok("Author delete successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Author not found");
        }
    }

}
