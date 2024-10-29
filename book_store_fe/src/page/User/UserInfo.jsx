import { useContext, useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';

import { TextField, Button, FormHelperText, FormControl } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {
    getProvinceByCode,
    getProvinces,
    getDistrictsByProvinceCode,
    getWardsByDistrictCode,
    getDistrictByCode,
    getWardByCode,
} from 'vn-provinces';
import style from './User.module.scss';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
import UserService from '../../service/UserService';
import { toast } from 'react-toastify';
import ModalLoading from '../../component/Modal/ModalLoading/ModalLoading';
import * as Yup from 'yup';
import { useFormik } from 'formik';
const cx = classNames.bind(style);

function UserInfo() {
    const { authentication } = useContext(AuthenticationContext);
    const [provinces, setProvince] = useState(getProvinces());
    const [districts, setDistricts] = useState();
    const [communes, setCommunes] = useState();

    const [isLoading, setIsLoading] = useState(false);
    const validationSchema = Yup.object({
        name: Yup.string().required('Vui lòng nhập họ và tên'),
        email: Yup.string().required('Vui lòng nhập email').email('Email không hợp lệ'),
        phoneNum: Yup.string().required('Vui lòng nhập số điện thoại.').length(10, 'Số điện thoại phải có 10 chữ số.'),
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
        addressDetail: Yup.string().required('Vui lòng nhập địa chỉ cụ thể.'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
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
                email: values.email,
                phoneNum: values.phoneNum,
                address: {
                    province: { value: values.selectedProvince.code, label: values.selectedProvince.name },
                    district: { value: values.selectedDistrict.code, label: values.selectedDistrict.name },
                    commune: { value: values.selectedCommune.code, label: values.selectedCommune.name },
                    addressDetail: values.addressDetail,
                },
            };
            setIsLoading(true);
            UserService.updateUser(data)
                .then((response) => {
                    if (response.status === 200) {
                        toast.success('Cập nhật thông tin cá nhân thành công!');
                        authentication.isRemember
                            ? localStorage.setItem('user', JSON.stringify({ ...data, role: 'USER' }))
                            : sessionStorage.setItem('user', JSON.stringify({ ...data, role: 'USER' }));
                    }
                })
                .catch((error) => {
                    toast.error(error.response.data);
                    console.log();
                })
                .finally(() => setIsLoading(false));
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
    const updateData = (user) => {
        const value = {
            name: user?.fullName || '',
            email: user?.email || '',
            phoneNum: user?.phoneNum || '',
            selectedProvince: user?.address?.province
                ? {
                      name: user?.address?.province.label,
                      code: user?.address?.province.value,
                  }
                : '',
            selectedDistrict: user?.address?.district
                ? {
                      name: user?.address?.district.label,
                      code: user?.address?.district.value,
                  }
                : '',
            selectedCommune: user?.address?.commune
                ? {
                      name: user?.address?.commune.label,
                      code: user?.address?.commune.value,
                  }
                : '',
            addressDetail: user?.address?.addressDetail || '',
        };
        formik.setValues(value);
        if (user?.address?.province) {
            setDistricts(getDistrictsByProvinceCode(user.address.province.value));
        }
        if (user?.address?.district) {
            setCommunes(getWardsByDistrictCode(user.address.district.value));
        }
    };
    const fetchUserData = () => {
        let user =
            authentication?.user ||
            JSON.parse(localStorage.getItem('user')) ||
            JSON.parse(sessionStorage.getItem('user'));
        if (user === null) {
            setIsLoading(true);
            UserService.getUserInfo()
                .then((res) => {
                    sessionStorage.setItem('user', JSON.stringify(res.data));
                    updateData(res.data);
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => setIsLoading(false));
        } else {
            updateData(user);
        }
    };
    useEffect(() => {
        fetchUserData();
    }, []);
    return (
        <div className={cx('section')}>
            <h2>Thông tin tài khoản</h2>
            <form className={cx('form-wrapper')} style={{ margin: '0 10rem' }}>
                <TextField
                    name="name"
                    label="Họ và Tên"
                    variant="outlined"
                    fullWidth
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    margin="normal"
                    size="small"
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />
                <div className="d-flex gap-3">
                    <TextField
                        name="email"
                        label="Email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        size="small"
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    <TextField
                        name="phoneNum"
                        label="Số điện thoại"
                        value={formik.values.phoneNum}
                        onChange={formik.handleChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        size="small"
                        error={formik.touched.phoneNum && Boolean(formik.errors.phoneNum)}
                        helperText={formik.touched.phoneNum && formik.errors.phoneNum}
                    />
                </div>

                <div>
                    <div className="d-flex gap-3">
                        <FormControl
                            fullWidth
                            required
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            size="small"
                            sx={{ my: 1, minWidth: 120 }}
                        >
                            <Autocomplete
                                name="province"
                                disablePortal
                                disableClearable
                                className="m-0"
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
                                sx={{ my: 1, minWidth: 120 }}
                                renderInput={(params) => <TextField {...params} label="Tỉnh/Thành Phố" />}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(1, value.code)}
                            />
                            <FormHelperText>
                                {formik.touched.selectedProvince && formik.errors.selectedProvince}
                            </FormHelperText>
                        </FormControl>
                        <FormControl
                            fullWidth
                            required
                            error={formik.touched.selectedDistrict && Boolean(formik.errors.selectedDistrict)}
                            size="small"
                            sx={{ my: 1, minWidth: 120 }}
                        >
                            <Autocomplete
                                disablePortal
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
                                sx={{ my: 1, minWidth: 120 }}
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                renderInput={(params) => <TextField {...params} label="Quận/Huyện" />}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(2, value.code)}
                            />
                            <FormHelperText>
                                {formik.touched.selectedDistrict && formik.errors.selectedDistrict}
                            </FormHelperText>
                        </FormControl>
                        <FormControl
                            fullWidth
                            required
                            error={formik.touched.selectedCommune && Boolean(formik.errors.selectedCommune)}
                            size="small"
                            sx={{ my: 1, minWidth: 120 }}
                        >
                            <Autocomplete
                                disablePortal
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
                                sx={{ my: 1, minWidth: 120 }}
                                renderInput={(params) => <TextField {...params} label="Xã/Phường" />}
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(3, value.code)}
                            />
                            <FormHelperText>
                                {formik.touched.selectedCommune && formik.errors.selectedCommune}
                            </FormHelperText>
                        </FormControl>
                    </div>

                    <TextField
                        label="Địa chỉ cụ thể"
                        variant="outlined"
                        fullWidth
                        value={formik.values.addressDetail}
                        onChange={formik.handleChange}
                        margin="normal"
                        size="small"
                        error={formik.touched.addressDetail && Boolean(formik.errors.addressDetail)}
                        helperText={formik.touched.addressDetail && formik.errors.addressDetail}
                        sx={{ mt: 0.5 }}
                    />
                </div>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={formik.handleSubmit}
                    className={cx('save-button')}
                    sx={{ mt: 2, padding: '1rem', width: '50%', mx: 'auto' }}
                >
                    <span className="fw-semibold">Lưu thay đổi</span>
                </Button>
            </form>
            <ModalLoading isLoading={isLoading} />
        </div>
    );
}
UserInfo.propTypes = {
    setIsLoading: PropTypes.func,
};
export default UserInfo;
