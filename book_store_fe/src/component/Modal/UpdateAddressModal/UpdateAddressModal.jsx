import React, { memo, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
    getProvinceByCode,
    getProvinces,
    getDistrictsByProvinceCode,
    getWardsByDistrictCode,
    getDistrictByCode,
    getWardByCode,
} from 'vn-provinces';
import * as Yup from 'yup';
import { useFormik } from 'formik';
const UpdateAddressModal = ({ open, onClose, setValue }) => {
    const [provinces] = useState(getProvinces());
    const [districts, setDistricts] = useState();
    const [communes, setCommunes] = useState();

    const validationSchema = Yup.object({
        name: Yup.string().trim().required('Vui lòng nhập tên người nhận hàng.').max(100, 'Tên quá dài.'),
        phoneNum: Yup.string().trim()
            .required('Vui lòng nhập số điện thoại.')
            .matches(/^0\d*$/, 'Định dạng không hợp lệ!')
            .length(10, 'Số điện thoại phải có 10 chữ số.'),
        selectedProvince: Yup.object()
            .nullable()
            .required('Vui lòng chọn tỉnh.')
            .test('is-valid', 'Vui lòng chọn tỉnh.', (value) => value && value.code),
        selectedDistrict: Yup.object()
            .nullable()
            .required('Vui lòng chọn huyện.')
            .test('is-valid', 'Vui lòng chọn huyện.', (value) => value && value.code),
        selectedCommune: Yup.object()
            .nullable()
            .required('Vui lòng chọn xã.')
            .test('is-valid', 'Vui lòng chọn xã.', (value) => value && value.code),
        addressDetail: Yup.string().trim().required('Vui lòng nhập địa chỉ cụ thể.').max(100, 'Tên quá dài.'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            phoneNum: '',
            selectedProvince: '',
            selectedDistrict: '',
            selectedCommune: '',
            addressDetail: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const data = {
                fullName: values.name,
                phoneNum: values.phoneNum,
                address: {
                    province: { value: values.selectedProvince.code, label: values.selectedProvince.name },
                    district: { value: values.selectedDistrict.code, label: values.selectedDistrict.name },
                    commune: { value: values.selectedCommune.code, label: values.selectedCommune.name },
                    addressDetail: values.addressDetail,
                },
            };
            setValue(data);
            onClose(true);
        },
        validateOnBlur: false,
        validateOnChange: false,
    });

    const handleChangeAddress = (type, value) => {
        if (type === 1) {
            formik.setValues((prev) => ({
                ...prev,
                selectedProvince: getProvinceByCode(value),
                selectedDistrict: '',
                selectedCommune: '',
            }));
            setDistricts(getDistrictsByProvinceCode(value));
        } else if (type === 2) {
            setCommunes(getWardsByDistrictCode(value));
            formik.setValues((prev) => ({
                ...prev,
                selectedDistrict: getDistrictByCode(value),
                selectedCommune: '',
            }));
        } else {
            formik.setValues((prev) => ({
                ...prev,
                selectedCommune: getWardByCode(value),
            }));
        }
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            maxWidth="sm"
            PaperProps={{
                style: { maxHeight: 'none' },
            }}
        >
            <form>
                <DialogTitle id="confirm-dialog-title" sx={{ textAlign: 'center' }}>
                    {'Địa chỉ giao hàng'}
                </DialogTitle>
                <DialogContent dividers>
                    <div className="d-flex flex-wrap gap-3 ">
                        <div style={{ width: '100%' }} className="d-flex align-items-center mb-3">
                            <label
                                htmlFor="province"
                                style={{
                                    width: '32%',
                                    marginBottom: formik.touched.name && Boolean(formik.errors.name) ? '2rem' : '0',
                                }}
                            >
                                Họ và tên người nhận
                            </label>
                            <TextField
                                label=""
                                variant="outlined"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                margin="normal"
                                size="small"
                                sx={{ flex: 1, margin: 0 }}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </div>
                        <div style={{ width: '100%' }} className="d-flex align-items-center mb-3">
                            <label
                                htmlFor="province"
                                style={{
                                    width: '32%',
                                    marginBottom:
                                        formik.touched.phoneNum && Boolean(formik.errors.phoneNum) ? '2rem' : '0',
                                }}
                            >
                                Số điện thoại
                            </label>
                            <TextField
                                label=""
                                variant="outlined"
                                name="phoneNum"
                                value={formik.values.phoneNum}
                                onChange={formik.handleChange}
                                margin="normal"
                                size="small"
                                sx={{ flex: 1, margin: 0 }}
                                error={formik.touched.phoneNum && Boolean(formik.errors.phoneNum)}
                                helperText={formik.touched.phoneNum && formik.errors.phoneNum}
                            />
                        </div>
                        <div style={{ width: '100%' }} className="d-flex align-items-center mb-3">
                            <label
                                htmlFor="province"
                                style={{
                                    width: '32%',
                                    marginBottom:
                                        formik.touched.selectedProvince && Boolean(formik.errors.selectedProvince)
                                            ? '2rem'
                                            : '0',
                                }}
                            >
                                Tỉnh thành
                            </label>
                            <Autocomplete
                                name="province"
                                disableClearable
                                options={provinces.map((prov) => ({ label: prov.name, code: prov.code }))}
                                value={
                                    formik.values.selectedProvince
                                        ? {
                                              label: formik.values.selectedProvince.name,
                                              code: formik.values.selectedProvince.code,
                                          }
                                        : null
                                }
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        error={
                                            formik.touched.selectedProvince && Boolean(formik.errors.selectedProvince)
                                        }
                                        helperText={formik.touched.selectedProvince && formik.errors.selectedProvince}
                                    />
                                )}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(1, value.code)}
                                sx={{ m: 0, flex: 1 }}
                            />
                        </div>
                        <div style={{ width: '100%' }} className="d-flex align-items-center mb-3">
                            <label
                                htmlFor="province"
                                style={{
                                    width: '32%',
                                    marginBottom:
                                        formik.touched.selectedDistrict && Boolean(formik.errors.selectedDistrict)
                                            ? '2rem'
                                            : '0',
                                }}
                            >
                                Quận/Huyện
                            </label>
                            <Autocomplete
                                disableClearable
                                className="m-0"
                                options={
                                    districts ? districts.map((prov) => ({ label: prov.name, code: prov.code })) : []
                                }
                                value={
                                    formik.values.selectedDistrict
                                        ? {
                                              label: formik.values.selectedDistrict.name,
                                              code: formik.values.selectedDistrict.code,
                                          }
                                        : null
                                }
                                sx={{ m: 0, flex: 1 }}
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        error={
                                            formik.touched.selectedDistrict && Boolean(formik.errors.selectedDistrict)
                                        }
                                        helperText={formik.touched.selectedDistrict && formik.errors.selectedDistrict}
                                    />
                                )}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(2, value.code)}
                            />
                        </div>

                        <div style={{ width: '100%' }} className="d-flex align-items-center mb-3">
                            <label
                                htmlFor="province"
                                style={{
                                    width: '32%',
                                    marginBottom:
                                        formik.touched.selectedCommune && Boolean(formik.errors.selectedCommune)
                                            ? '2rem'
                                            : '0',
                                }}
                            >
                                Xã/Phường
                            </label>
                            <Autocomplete
                                disableClearable
                                className="m-0"
                                options={
                                    communes ? communes.map((prov) => ({ label: prov.name, code: prov.code })) : []
                                }
                                value={
                                    formik.values.selectedCommune
                                        ? {
                                              label: formik.values.selectedCommune.name,
                                              code: formik.values.selectedCommune.code,
                                          }
                                        : null
                                }
                                sx={{ m: 0, flex: 1 }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        error={formik.touched.selectedCommune && Boolean(formik.errors.selectedCommune)}
                                        helperText={formik.touched.selectedCommune && formik.errors.selectedCommune}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(3, value.code)}
                            />
                        </div>
                        <div style={{ width: '100%' }} className="d-flex align-items-center mb-3">
                            <label
                                htmlFor="province"
                                style={{
                                    width: '32%',
                                    marginBottom:
                                        formik.touched.addressDetail && Boolean(formik.errors.addressDetail)
                                            ? '2rem'
                                            : '0',
                                }}
                            >
                                Địa chỉ cụ thể
                            </label>
                            <TextField
                                label=""
                                variant="outlined"
                                name="addressDetail"
                                value={formik.values.addressDetail}
                                onChange={formik.handleChange}
                                margin="normal"
                                size="small"
                                sx={{ flex: 1, margin: 0 }}
                                error={formik.touched.addressDetail && Boolean(formik.errors.addressDetail)}
                                helperText={formik.touched.addressDetail && formik.errors.addressDetail}
                            />
                        </div>
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => onClose(false)} color="primary">
                        Hủy
                    </Button>
                    <Button type="submit" color="primary" variant="contained" onClick={formik.handleSubmit}>
                        Xác nhận
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default memo(UpdateAddressModal);
