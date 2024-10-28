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
const cx = classNames.bind(style);

function UserInfo({ setIsLoading }) {
    const { authentication } = useContext(AuthenticationContext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCommune, setSelectedCommune] = useState('');
    const [addressDetail, setAddressDetail] = useState('');

    const [provinces, setProvince] = useState(getProvinces());
    const [districts, setDistricts] = useState();
    const [communes, setCommunes] = useState();

    const [listErr, setListErr] = useState({
        email: false,
        emailFormat: false,
        password: false,
        fullname: false,
        confirmPassword: {
            required: false,
            match: false,
        },
        province: false,
        district: false,
        commune: false,
        addressDetail: false,
    });

    const handleUpdateInfo = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const data = {
            fullName: username,
            email: email,
            phoneNum: phoneNum,
            address: {
                province: {
                    label: selectedProvince.name,
                    value: selectedProvince.code,
                },
                district: {
                    label: selectedDistrict.name,
                    value: selectedDistrict.code,
                },
                commune: {
                    label: selectedCommune.name,
                    value: selectedCommune.code,
                },
                addressDetail: addressDetail,
            },
        };

        UserService.updateUser(data)
            .then((response) => {
                if (response.status === 200) {
                    toast.success('Cập nhật thông tin cá nhân thành công!');
                    authentication.isRemember
                        ? localStorage.setItem('user', JSON.stringify(data))
                        : sessionStorage.setItem('user', JSON.stringify(data));
                }
            })
            .catch((error) => {
                toast.error('Có lỗi xảy ra vui lòng thử lại');
                console.log(error);
            })
            .finally(() => setIsLoading(false));
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
    const updateData = (user) => {
        setUsername(user?.fullName);
        setEmail(user?.email);
        setPhoneNum(user?.phoneNum);
        if (user.address !== null) {
            setAddressDetail(user?.address?.addressDetail);
            handleChangeAddress(1, user?.address?.province.value);
            handleChangeAddress(2, user?.address?.district.value);
            handleChangeAddress(3, user?.address?.commune.value);
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
            <div className={cx('form-wrapper')} style={{ margin: '0 10rem' }}>
                <TextField
                    label="Họ và Tên"
                    variant="outlined"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    size="small"
                />
                <div className="d-flex gap-3">
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        size="small"
                    />
                    <TextField
                        label="Số điện thoại"
                        value={phoneNum}
                        onChange={(e) => setPhoneNum(e.target.value)}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        size="small"
                    />
                </div>

                <div>
                    <div className="d-flex gap-3">
                        <FormControl
                            fullWidth
                            required
                            error={listErr?.province}
                            size="small"
                            sx={{ my: 1, minWidth: 120 }}
                        >
                            <Autocomplete
                                disablePortal
                                disableClearable
                                className="m-0"
                                options={provinces.map((prov) => ({ label: prov.name, code: prov.code }))}
                                value={
                                    selectedProvince
                                        ? { label: selectedProvince.name, code: selectedProvince.code }
                                        : null
                                }
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                sx={{ my: 1, minWidth: 120 }}
                                renderInput={(params) => <TextField {...params} label="Tỉnh/Thành Phố" />}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(1, value.code)}
                            />
                            <FormHelperText>{listErr.province ? 'Vui lòng chọn tỉnh/thành phố' : ''}</FormHelperText>
                        </FormControl>
                        <FormControl
                            fullWidth
                            required
                            error={listErr.district}
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
                                    selectedDistrict
                                        ? { label: selectedDistrict.name, code: selectedDistrict.code }
                                        : null
                                }
                                sx={{ my: 1, minWidth: 120 }}
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                renderInput={(params) => <TextField {...params} label="Quận/Huyện" />}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(2, value.code)}
                            />
                            <FormHelperText>{listErr.district ? 'Vui lòng chọn quận/huyện' : ''}</FormHelperText>
                        </FormControl>
                        <FormControl
                            fullWidth
                            required
                            error={listErr.commune}
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
                                    selectedCommune ? { label: selectedCommune.name, code: selectedCommune.code } : null
                                }
                                sx={{ my: 1, minWidth: 120 }}
                                renderInput={(params) => <TextField {...params} label="Xã/Phường" />}
                                isOptionEqualToValue={(option, value) => option.code === value.code}
                                size="small"
                                onChange={(e, value) => handleChangeAddress(3, value.code)}
                            />
                            <FormHelperText>{listErr.commune ? 'Vui lòng chọn xã/phường' : ''}</FormHelperText>
                        </FormControl>
                    </div>

                    <TextField
                        label="Địa chỉ cụ thể"
                        variant="outlined"
                        fullWidth
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                        margin="normal"
                        size="small"
                        sx={{ mt: 0.5 }}
                    />
                </div>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateInfo}
                    className={cx('save-button')}
                    sx={{ mt: 2, padding: '1rem', width: '50%', mx: 'auto' }}
                >
                    <span className="fw-semibold">Lưu thay đổi</span>
                </Button>
            </div>
        </div>
    );
}
UserInfo.propTypes = {
    setIsLoading: PropTypes.func,
};
export default UserInfo;
