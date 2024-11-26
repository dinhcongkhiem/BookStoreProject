package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.Interface.AddressService;
import com.project.book_store_be.Model.Address;
import com.project.book_store_be.Repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {
    private final AddressRepository addressRepository;

    @Override
    public Address createAddress (Address address) {
        Optional<Address> sameAddress = addressRepository.findTheSameAddress(
                address.getProvince().getValue(),
                address.getProvince().getLabel(),
                address.getDistrict().getValue(),
                address.getDistrict().getLabel(),
                address.getCommune().getValue(),
                address.getCommune().getLabel(),
                address.getAddressDetail());
        if(sameAddress.isEmpty()) {
            addressRepository.save(address);
        }
        return sameAddress.orElseGet(() -> addressRepository.save(address));
    }

}
