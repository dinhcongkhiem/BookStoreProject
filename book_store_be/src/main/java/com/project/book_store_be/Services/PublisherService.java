package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Publisher;
import com.project.book_store_be.Repository.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PublisherService {
    @Autowired
    private PublisherRepository repo;

    public List<Publisher> getAllPublisher(){
        return repo.findAll();
    }

    public Optional<Publisher> getPublisherById(Integer id){
        return repo.findById(id);
    }

    public Publisher savePublisher(Publisher publisher){
        return repo.save(publisher);
    }

    public Publisher updatePublisher(Integer id, Publisher publisherDetails){
        Publisher publisher = repo.findById(id).orElseThrow(() ->new RuntimeException("Publisher not found"));
        publisher.setName(publisherDetails.getName());
        publisher.setAddress(publisher.getAddress());
        publisher.setNational(publisher.getNational());
        publisher.setEmail(publisher.getEmail());
        publisher.setNational(publisher.getNational());
        return repo.save(publisher);
    }

    public  void deletePublisher(Integer id){
        Publisher publisher = repo.findById(id).orElseThrow(() -> new RuntimeException("Author not found"));
        repo.deleteById(id);
    }
}
