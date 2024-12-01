package com.project.book_store_be.Services;

import com.project.book_store_be.Exception.AuthorAlreadyExistsException;
import com.project.book_store_be.Interface.AuthorService;
import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Repository.AuthorRepository;
import jakarta.persistence.criteria.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorServiceImpl implements AuthorService {

    @Autowired
    private AuthorRepository repo;

    @Override
    public List<Author> searchPublishersByName(String keyword) {
        return repo.findByNameContainingIgnoreCaseOrderByIdAsc(keyword);
    }

    @Override
    public List<Author> getAllAuthor() {

        return repo.findAll(Sort.by(Sort.Direction.ASC, "id"));
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
        if (repo.findByNameIgnoreCase(author.getName()).isPresent()) {
            throw new AuthorAlreadyExistsException("Tác giả " + author.getName() + " đã tồn , vui lòng thử lại!");
        }
        return repo.save(author);
    }

    @Override
    public void updateAuthor(Long id, Author authorDetails) {
        Author author = repo.findById(id).orElseThrow(() -> new RuntimeException("Author not found"));
        if (repo.findByNameIgnoreCase(authorDetails.getName()).isPresent() && !author.getName().equalsIgnoreCase(authorDetails.getName())) {
            throw new AuthorAlreadyExistsException("Tác giả " + authorDetails.getName() + " đã tồn , vui lòng thử lại!");
        }
        author.setName(authorDetails.getName());
        repo.save(author);
    }

    @Override
    public void deleteAuthor(Long id) {
        repo.findById(id).orElseThrow(() -> new RuntimeException("Author not found"));
        repo.deleteById(id);
    }

}
