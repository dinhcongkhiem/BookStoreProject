package com.project.book_store_be.Services;

import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.Publisher;
import com.project.book_store_be.Repository.DisCountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class DisCountService {
    @Autowired
    private DisCountRepository repo;


    public List<DisCount> getAllDiscounts() {
        return repo.findAll();
    }

    public Page<DisCount> getDiscounts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findAll(pageable);
    }



    private void validateDiscountRate(double discountRate){
        if (discountRate < 0 || discountRate > 30){
            throw new IllegalArgumentException("Discount rate must be between 0% and 30% ");
        }
    }


    private void validateDiscountDates(Date startDate, Date endDate){
        if (startDate.after(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }



    public DisCount createDiscount(DisCount disCount){
        validateDiscountRate(disCount.getDiscountRate());
        validateDiscountDates(disCount.getStartDate(), disCount.getEndDate());
        return repo.save(disCount);
    }

    public Optional<DisCount> findById(Long id) {
        return repo.findById(id);
    }





    public DisCount updateDiscount(DisCount discount) {
        return repo.save(discount);
    }

    public  void delete(Long id){
        DisCount disCount = repo.findById(id).orElseThrow(() -> new RuntimeException("DisCount not found"));
        repo.deleteById(id);
    }


}
