package com.project.book_store_be.Interface;

import com.project.book_store_be.Model.Author;

import java.util.List;
import java.util.Optional;

public interface AuthorService {
    List<Author> searchPublishersByName(String keyword) ;
    List<Author> getAllAuthor();
    Optional<Author> getAuthorById(Long id);
    List<Author> getAuthors(List<Long> authorsId) ;
    Author saveAuthor(Author author);
    Author updateAuthor(Long id, Author authorDetails);
    void  deleteAuthor(Long id);
}
