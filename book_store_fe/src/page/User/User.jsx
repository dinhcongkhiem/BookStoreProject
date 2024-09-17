import style from './User.module.scss';
import classNames from 'classnames/bind';
import React, { useContext, useEffect, useState } from 'react';
import {
    getProvinceByCode, getProvinces, getDistrictsByProvinceCode,
    getWardsByDistrictCode, getDistrictByCode, getWardByCode
} from 'vn-provinces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faKey } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
import { TextField, Button } from '@mui/material'; 
const cx = classNames.bind(style);

function User() {
    const [username, setUsername] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    const [activeTab, setActiveTab] = useState('accountInfo');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCommune, setSelectedCommune] = useState('');

    const [provinces, setProvince] = useState(getProvinces());
    const [districts, setDistricts] = useState();
    const [communes, setCommunes] = useState();

    const { authentication } = useContext(AuthenticationContext);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleUpdateInfo = (e) => {
        e.preventDefault();
        console.log(selectedProvince);
        console.log(selectedDistrict);
        console.log(selectedCommune);

        const data = {
            province: {
                label: selectedProvince.name,
                value: selectedProvince.code
            },
            district: {
                label: selectedDistrict.name,
                value: selectedDistrict.code
            },
            commune: {
                label: selectedCommune.name,
                value: selectedCommune.code
            },
            addressDetail: addressDetail
        };
        console.log(data);
    };

    const handleChangeAddress = (type, event) => {
        if (type === 1) {
            setSelectedProvince(getProvinceByCode(event.target.value));
            setDistricts(getDistrictsByProvinceCode(event.target.value));
            setSelectedDistrict('');
            setSelectedCommune('');
        } else if (type === 2) {
            setSelectedDistrict(getDistrictByCode(event.target.value));
            setCommunes(getWardsByDistrictCode(event.target.value));
            setSelectedCommune('');
        } else {
            setSelectedCommune(getWardByCode(event.target.value));
        }
    };

    useEffect(() => {
        let user = authentication.user || localStorage.getItem('user') || sessionStorage.getItem('user');
        setUsername(user.fullName);
        setAddressDetail(user.email);
    }, []);

    return (
        <div>
            <div className={cx('user-container')}>
                {/* Menu điều hướng bên trái */}
                <div className={cx('sidebar')}>
                    <ul>
                        <li
                            className={cx({ active: activeTab === 'accountInfo' })}
                            onClick={() => handleTabChange('accountInfo')}
                        >
                            <FontAwesomeIcon icon={faUser} style={{ marginRight: '10px' }} />
                            Thông tin tài khoản
                        </li>
                        <li
                            className={cx({ active: activeTab === 'changePassword' })}
                            onClick={() => handleTabChange('changePassword')}
                        >
                            <FontAwesomeIcon icon={faKey} style={{ marginRight: '10px' }} />
                            Đổi mật khẩu
                        </li>
                    </ul>
                </div>

                {/* Nội dung bên phải */}
                <div className={cx('content')}>
                    {activeTab === 'accountInfo' && (
                        <div className={cx('section')}>
                            <h2>Thông tin tài khoản</h2>
                            <form>
                                {/* Thay đổi input với TextField */}
                                <TextField
                                    label="Họ và Tên"
                                    variant="outlined"
                                    fullWidth
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    margin="normal"
                                />
                                <TextField
                                    label="Số điện thoại"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                />
                                {/* Phần địa chỉ */}
                                <label>Địa chỉ</label>
                                <div className={cx('address-row')}>
                                    <div>
                                        <TextField
                                            select
                                            label="Chọn tỉnh"
                                            value={selectedProvince.code}
                                            onChange={(e) => handleChangeAddress(1, e)}
                                            fullWidth
                                            SelectProps={{
                                                native: true,
                                            }}
                                            variant="outlined"
                                            margin="normal"
                                        >
                                            <option value="">Chọn tỉnh</option>
                                            {provinces.map((province) => (
                                                <option key={province.code} value={province.code}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </TextField>
                                    </div>
                                    <div>
                                        <TextField
                                            select
                                            label="Chọn huyện"
                                            value={selectedDistrict.code}
                                            onChange={(e) => handleChangeAddress(2, e)}
                                            fullWidth
                                            SelectProps={{
                                                native: true,
                                            }}
                                            variant="outlined"
                                            margin="normal"
                                        >
                                            <option value="">Chọn huyện</option>
                                            {districts?.map((district) => (
                                                <option key={district.code} value={district.code}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </TextField>
                                    </div>
                                    <div>
                                        <TextField
                                            select
                                            label="Chọn xã"
                                            value={selectedCommune.code}
                                            onChange={(e) => handleChangeAddress(3, e)}
                                            fullWidth
                                            SelectProps={{
                                                native: true,
                                            }}
                                            variant="outlined"
                                            margin="normal"
                                        >
                                            <option value="">Chọn xã</option>
                                            {communes?.map((commune, index) => (
                                                <option key={index} value={commune.code}>
                                                    {commune.name}
                                                </option>
                                            ))}
                                        </TextField>
                                    </div>
                                </div>
                                <TextField
                                    label="Địa chỉ cụ thể"
                                    variant="outlined"
                                    fullWidth
                                    value={addressDetail}
                                    onChange={(e) => setAddressDetail(e.target.value)}
                                    margin="normal"
                                />
                                {/* Thay button với Button của Material UI */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={handleUpdateInfo}
                                    className={cx('save-button')}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                >
                                    Lưu thay đổi
                                </Button>
                            </form>
                        </div>
                    )}
                    {activeTab === 'changePassword' && (
                        <div className={cx('section')}>
                            <h2>Đổi mật khẩu</h2>
                            <form>
                                <TextField
                                    label="Mật khẩu hiện tại"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    label="Mật khẩu mới"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                                <TextField
                                    label="Nhập lại mật khẩu mới"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className={cx('save-button')}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                >
                                    Lưu thay đổi
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default User;
