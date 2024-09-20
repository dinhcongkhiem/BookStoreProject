package com.project.book_store_be.Services;

import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Repository.DisCountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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



    private void validateDiscountRate(double discountRate){
        if (discountRate <= 0 || discountRate >= 30){
            throw new IllegalArgumentException("Discount rate must be between 0% and 30% ");
        }
    }


    private void validateDiscountDates(LocalDate startDate, LocalDate endDate){
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }



    public DisCount createDiscount(DisCount disCount){
        validateDiscountRate(disCount.getDiscountRate());
        validateDiscountDates(disCount.getStartDate(), disCount.getEndDate());
        return repo.save(disCount);
    }





    public DisCount updateDiscount(Long id, DisCount discount) {
        Optional<DisCount> existingDiscount = repo.findById(id);
        if (existingDiscount.isPresent()) {
            DisCount updatedDiscount = existingDiscount.get();
            updatedDiscount.setStartDate(discount.getStartDate());
            updatedDiscount.setEndDate(discount.getEndDate());
            validateDiscountRate(discount.getDiscountRate());
            updatedDiscount.setDiscountRate(discount.getDiscountRate());

            return repo.save(updatedDiscount);
        }
        return null;
    }

    public void deleteDiscount(Long id) {
        repo.deleteById(id);
    }
}
