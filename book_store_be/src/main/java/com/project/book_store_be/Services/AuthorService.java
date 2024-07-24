package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorService {

    @Autowired
    private AuthorRepository repo;

    public List<Author> getAllAuthor(){
        return repo.findAll();
    }

    public Optional<Author> getAuthorById(Integer id){
        return repo.findById(id);
    }

    public Author saveAuthor(Author author){

        Optional<Author> existingAuthorByPseudonym = repo.findByPseudonym(author.getPseudonym());
        if( existingAuthorByPseudonym.isPresent()){
            throw new IllegalArgumentException("Author with the same name and pseudonym already exists");
        }
        return repo.save(author);
    }

    public Author updateAuthor(Integer id, Author authorDetails) {
        Author author = repo.findById(id).orElseThrow(() -> new AuthorNotFoundException("Author not found"));

        Optional<Author> existingAuthorWithPseudonym = repo.findByPseudonym(authorDetails.getPseudonym());
        if (existingAuthorWithPseudonym.isPresent() && !existingAuthorWithPseudonym.get().getId().equals(id)) {
            throw new DuplicatePseudonymException("Pseudonym already in use");
        }

        author.setName(authorDetails.getName());
        author.setNationality(authorDetails.getNationality());
        author.setPseudonym(authorDetails.getPseudonym());
        author.setPublishedBooks(authorDetails.getPublishedBooks());
        return repo.save(author);
    }

    public static class AuthorNotFoundException extends RuntimeException {
        public AuthorNotFoundException(String message) {
            super(message);
        }
    }

    public static class DuplicatePseudonymException extends RuntimeException {
        public DuplicatePseudonymException(String message) {
            super(message);
        }
    }


    public void  deleteAuthor(Integer id){
        Author author = repo.findById(id).orElseThrow(() -> new RuntimeException("Author not found"));
        repo.deleteById(id);
    }




}
