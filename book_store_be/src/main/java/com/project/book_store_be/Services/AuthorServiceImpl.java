package com.project.book_store_be.Services;

import com.project.book_store_be.Exception.AuthorNotFoundException;
import com.project.book_store_be.Exception.DuplicatePseudonymException;
import com.project.book_store_be.Interface.AuthorService;
import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Model.Category;
import com.project.book_store_be.Repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorServiceImpl implements AuthorService {

    @Autowired
    private AuthorRepository repo;

    @Override
    public List<Author> searchPublishersByName(String keyword) {
        return repo.findByNameContainingIgnoreCase(keyword);
    }

    @Override
    public List<Author> getAllAuthor() {
        return repo.findAll();
    }

    @Override
    public Optional<Author> getAuthorById(Long id) {
        return repo.findById(id);
    }
    @Override
    public List<Author> getAuthors(List<Long> authorsId) {
        return repo.findAllById(authorsId);
    }

    @Override
    public Author saveAuthor(Author author) {

//        Optional<Author> existingAuthorByPseudonym = repo.findByPseudonym(author.getPseudonym());
//        if( existingAuthorByPseudonym.isPresent()){
//            throw new IllegalArgumentException("Author with the same name and pseudonym already exists");
//        }
        return repo.save(author);
    }

    @Override
    public Author updateAuthor(Long id, Author authorDetails) {
//        Author author = repo.findById(id).orElseThrow(() ->  new AuthorNotFoundException("Author not found"));
//
//        Optional<Author> existingAuthorWithPseudonym = repo.findByPseudonym(authorDetails.getPseudonym());
//        if (existingAuthorWithPseudonym.isPresent() && !existingAuthorWithPseudonym.get().getId().equals(id)) {
//            throw new DuplicatePseudonymException("Pseudonym already in use");
//        }
//
//        author.setName(authorDetails.getName());
//        author.setNationality(authorDetails.getNationality());
//        author.setPseudonym(authorDetails.getPseudonym());
        return repo.save(authorDetails);
    }


    @Override
    public void deleteAuthor(Long id) {
        Author author = repo.findById(id).orElseThrow(() -> new RuntimeException("Author not found"));
        repo.deleteById(id);
    }

}
