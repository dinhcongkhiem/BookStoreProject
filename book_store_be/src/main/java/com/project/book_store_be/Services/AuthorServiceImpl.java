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
        return repo.save(author);
    }

    @Override
    public Author updateAuthor(Long id, Author authorDetails) {
        Author author = repo.findById(id).orElseThrow(() -> new RuntimeException("Author not found"));
        author.setName(authorDetails.getName());
        return repo.save(author);
    }

    @Override
    public void deleteAuthor(Long id) {
        repo.findById(id).orElseThrow(() -> new RuntimeException("Author not found"));
        repo.deleteById(id);
    }

}
