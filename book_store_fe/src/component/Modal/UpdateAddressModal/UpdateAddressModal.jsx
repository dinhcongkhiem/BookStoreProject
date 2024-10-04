import React, { memo, useContext, useState } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    FormControl,
    FormHelperText,
    Popper,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
    getProvinceByCode,
    getProvinces,
    getDistrictsByProvinceCode,
    getWardsByDistrictCode,
    getDistrictByCode,
    getWardByCode,
} from 'vn-provinces';
import { AuthenticationContext } from '../../../context/AuthenticationProvider';
const UpdateAddressModal = ({ open, onClose, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState('savedAddress');
    const { authentication } = useContext(AuthenticationContext);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCommune, setSelectedCommune] = useState('');
    const [addressDetail, setAddressDetail] = useState('');

    const [provinces, setProvince] = useState(getProvinces());
    const [districts, setDistricts] = useState();
    const [communes, setCommunes] = useState();

    const [listErr, setListErr] = useState({
        province: false,
        district: false,
        commune: false,
        addressDetail: false,
    });

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleChangeAddress = (type, value) => {
        if (type === 1) {
            setSelectedProvince(getProvinceByCode(value));
            setDistricts(getDistrictsByProvinceCode(value));
            setSelectedDistrict('');
            setSelectedCommune('');
        } else if (type === 2) {
            setSelectedDistrict(getDistrictByCode(value));
            setCommunes(getWardsByDistrictCode(value));
            setSelectedCommune('');
        } else {
            setSelectedCommune(getWardByCode(value));
        }
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            maxWidth="lg"
        >
            <DialogTitle id="confirm-dialog-title" sx={{ textAlign: 'center' }}>
                {'Địa chỉ giao hàng'}
            </DialogTitle>
            <DialogContent dividers>
                <RadioGroup value={selectedOption} onChange={handleOptionChange}>
                    <FormControlLabel
                        value="savedAddress"
                        control={<Radio />}
                        label={`Giao hàng đến: 
                            ${authentication?.user?.address?.addressDetail},
                            ${authentication?.user?.address?.commune.label},
                            ${authentication?.user?.address?.district.label},
                            ${authentication?.user?.address?.province.label}`}
                    />
                    <FormControlLabel value="newAddress" control={<Radio />} label="Giao hàng đến địa chỉ khác" />
                </RadioGroup>

                <div className="d-flex flex-wrap justify-content-center">
                    <FormControl
                        required
                        // error={listErr?.province}
                        size="small"
                        sx={{ my: 1, minWidth: '60%' }}
                    >
                        <Autocomplete
                            disableClearable
                            options={provinces.map((prov) => ({ label: prov.name, code: prov.code }))}
                            value={
                                selectedProvince ? { label: selectedProvince.name, code: selectedProvince.code } : null
                            }
                            isOptionEqualToValue={(option, value) => option.code === value.code}
                            renderInput={(params) => <TextField {...params} label="Tỉnh/Thành Phố" />}
                            size="small"
                            onChange={(e, value) => handleChangeAddress(1, value.code)}
                            sx={{ my: 1, minWidth: '60%' }}
                        />
                        <FormHelperText>{listErr.province ? 'Vui lòng chọn tỉnh/thành phố' : ''}</FormHelperText>
                    </FormControl>
                    <FormControl required error={listErr.district} size="small" sx={{ my: 1, minWidth: '60%' }}>
                        <Autocomplete
                            disableClearable
                            className="m-0"
                            options={districts ? districts.map((prov) => ({ label: prov.name, code: prov.code })) : []}
                            value={
                                selectedDistrict ? { label: selectedDistrict.name, code: selectedDistrict.code } : null
                            }
                            sx={{ my: 1, minWidth: '60%' }}
                            isOptionEqualToValue={(option, value) => option.code === value.code}
                            renderInput={(params) => <TextField {...params} label="Quận/Huyện" />}
                            size="small"
                            onChange={(e, value) => handleChangeAddress(2, value.code)}
                        />
                        <FormHelperText>{listErr.district ? 'Vui lòng chọn quận/huyện' : ''}</FormHelperText>
                    </FormControl>
                    <FormControl required error={listErr.commune} size="small" sx={{ my: 1, minWidth: '60%' }}>
                        <Autocomplete
                            disableClearable
                            className="m-0"
                            options={communes ? communes.map((prov) => ({ label: prov.name, code: prov.code })) : []}
                            value={selectedCommune ? { label: selectedCommune.name, code: selectedCommune.code } : null}
                            sx={{ my: 1, minWidth: '60%' }}
                            renderInput={(params) => <TextField {...params} label="Xã/Phường" />}
                            isOptionEqualToValue={(option, value) => option.code === value.code}
                            size="small"
                            onChange={(e, value) => handleChangeAddress(3, value.code)}
                        />
                        <FormHelperText>{listErr.commune ? 'Vui lòng chọn xã/phường' : ''}</FormHelperText>
                    </FormControl>
                    <TextField
                        label="Địa chỉ cụ thể"
                        variant="outlined"
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                        margin="normal"
                        size="small"
                        sx={{ my: 1, minWidth: '60%' }}
                    />
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Hủy
                </Button>
                <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
                    Xác nhận
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default memo(UpdateAddressModal);
