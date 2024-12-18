package com.project.book_store_be.Services;

import com.project.book_store_be.Exception.PublisherAlreadyExistsException;
import com.project.book_store_be.Model.Publisher;
import com.project.book_store_be.Repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PublisherService {
    @Autowired
    private PublisherRepository repo;

    public List<Publisher> getAllPublisher() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public List<Publisher> searchPublishersByName(String keyword) {
        return repo.findByNameContainingIgnoreCaseOrderByIdAsc(keyword);
    }

    public Optional<Publisher> getPublisherById(Long id) {
        return repo.findById(id);
    }

    public Publisher savePublisher(Publisher publisher) {
        if(repo.findByNameIgnoreCase(publisher.getName()).isPresent()){
            throw new PublisherAlreadyExistsException("Nhà phát hành " +  publisher.getName() + " đã tồn tại, vui lòng thử lại");
        }
        return repo.save(publisher);
    }

    public Publisher updatePublisher(Long id, Publisher publisherDetails) {
        Publisher publisher = repo.findById(id).orElseThrow(() -> new RuntimeException("Publisher not found"));
        if(repo.findByNameIgnoreCase(publisherDetails.getName()).isPresent() && !publisher.getName().equalsIgnoreCase(publisherDetails.getName())){
            throw new PublisherAlreadyExistsException("Nhà phát hành " +  publisherDetails.getName() + " đã tồn tại, vui lòng thử lại");
        }
        publisher.setName(publisherDetails.getName());
        return repo.save(publisher);
    }

    public void deletePublisher(Long id) {
        repo.findById(id).orElseThrow(() -> new RuntimeException("Author not found"));
        repo.deleteById(id);
    }
}

