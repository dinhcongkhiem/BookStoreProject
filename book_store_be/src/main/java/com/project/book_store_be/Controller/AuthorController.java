package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Services.AuthorService;
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
    public List<Author> getAllAuthors(){
        return authorService.getAllAuthor();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Author> getAuthorById(@PathVariable Integer id) {
        Optional<Author> author = authorService.getAuthorById(id);
        return author.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateAuthor(@PathVariable Integer id, @RequestBody Author authorDetails) {
        try {
            Author updateAuthor = authorService.updateAuthor(id, authorDetails);
            return ResponseEntity.ok("Author update successfully");
        } catch (AuthorService.DuplicatePseudonymException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PostMapping
    public ResponseEntity<String> createAuthor(@RequestBody Author author) {
        try{
            Author savedAuthor = authorService.saveAuthor(author);
            return ResponseEntity.ok("Author crated successfully");
        }catch (IllegalArgumentException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }


    @DeleteMapping("/{id}")
    public  ResponseEntity<String> deleteAuthor(@PathVariable Integer id){
        try {
            authorService.deleteAuthor(id);
            return ResponseEntity.ok("Author delete successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Author not found");
        }
    }

}
