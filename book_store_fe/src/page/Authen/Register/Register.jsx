import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import {
    Button,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    Link,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';

import style from '../Authen.module.scss';
import { validateInputsRegister } from '../../../utills/ValidateInputs';
import AddressService from '../../../service/AddressService';
import googleIcon from '../../../assets/icons/google.png';
import facebookIcon from '../../../assets/icons/facebook.png';
import AuthService from '../../../service/AuthService';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';
import { toast } from 'react-toastify';

const cx = classNames.bind(style);
function Register() {
    const navigate = useNavigate();
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [commune, setCommune] = useState('');
    const [addressDetail, setAddressDetail] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [provincesOptions, setProvincesOptions] = useState();
    const [districtsOptions, setDistrictsOptions] = useState();
    const [communesOptions, setCommunesOptions] = useState();

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

    const [isLoading, setIsLoading] = useState(false);
    const ResgisterBtnRef = useRef();

    const handleClickShowPassword = (index) => {
        if (index === 0) {
            setShowPassword((show) => !show);
        } else if (index === 1) {
            setShowConfirmPassword((show) => !show);
        }
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleRegister = () => {
        if (
            validateInputsRegister(
                listErr,
                { fullname, email, phoneNum, password, confirmPassword, province, district, commune, addressDetail },
                setListErr,
            )
        ) {
            setIsLoading(true);
            const data = {
                fullName: fullname,
                email,
                phoneNum,
                password,
                confirmPassword,
                address: {
                    province,
                    district,
                    commune,
                    addressDetail,
                },
                role: 'USER',
            };

            AuthService.Register(data)
                .then((res) => {
                    if (res.status === 200) {
                        toast.success('Vui lòng kiểm tra email để kích hoạt tài khoản của bạn!', {
                            position: 'top-center',
                        });
                        setFullname('');
                        setEmail('');
                        setPassword('');
                        setPhoneNum('');
                        setConfirmPassword('');
                        setProvince('');
                        setDistrict('');
                        setCommune('');
                        setAddressDetail('');
                        setShowPassword('');
                        setShowConfirmPassword('');
                    }
                })
                .catch((err) => {
                    if (err.response.status === 400) {
                        toast.warn(err.response.data, { position: 'top-center' });
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleChangeAddress = (type, e) => {
        if (type === 1) {
            setProvince(e.target.value);
            setDistrict('');
            setCommune('');
            handleFetchAddress(type + 1, e.target.value.value);
        } else if (type === 2) {
            setDistrict(e.target.value);
            setCommune('');
            handleFetchAddress(type + 1, e.target.value.value);
        } else {
            setCommune(e.target.value);
        }
    };

    const handleFetchAddress = (type, id) => {
        AddressService.getDataAddress(type, id)
            .then((res) => {
                if (type === 1) {
                    setProvincesOptions(res);
                } else if (type === 2) {
                    setDistrictsOptions(res);
                } else {
                    setCommunesOptions(res);
                }
            })
            .catch((err) => console.log(err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        handleFetchAddress(1, 0);
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                ResgisterBtnRef.current.click();
            }
        };
        window.addEventListener('keypress', handleKeyPress);
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
        };
    }, []);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content')}>
                <h3>Đăng ký</h3>
                <div className={cx('input-wrapper')}>
                    <TextField
                        error={listErr.fullname}
                        required
                        fullWidth
                        helperText={listErr.fullname ? 'Vui lòng nhập email' : ''}
                        id="fullName"
                        label="Họ và tên"
                        variant="outlined"
                        className={cx('input')}
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                </div>
                <div className={cx('input-wrapper')}>
                    <TextField
                        error={listErr.email || listErr.emailFormat}
                        required
                        fullWidth
                        helperText={
                            listErr.email ? 'Vui lòng nhập email' : listErr.emailFormat ? 'Email không hợp lệ' : ''
                        }
                        id="email"
                        label="Email"
                        variant="outlined"
                        className={cx('input')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className={cx('input-wrapper')}>
                    <TextField
                        error={listErr.phoneNum}
                        required
                        fullWidth
                        helperText={listErr.phoneNum ? 'Vui lòng nhập số điện thoại' : ''}
                        id="phoneNum"
                        label="Số điện thoại"
                        variant="outlined"
                        className={cx('input')}
                        value={phoneNum}
                        onChange={(e) => setPhoneNum(e.target.value)}
                    />
                </div>
                <div className={cx('address-input')}>
                    <FormControl fullWidth required error={listErr.province}>
                        <InputLabel id="provinces">Tỉnh/Thành Phố</InputLabel>
                        <Select
                            labelId="provinces"
                            label="Tỉnh/Thành Phố"
                            value={province}
                            onChange={(e) => handleChangeAddress(1, e)}
                        >
                            {provincesOptions?.map((p) => (
                                <MenuItem key={p.value} value={p}>
                                    {p.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{listErr.province ? 'Vui lòng chọn tỉnh/thành phố' : ''}</FormHelperText>
                    </FormControl>
                    <FormControl fullWidth required error={listErr.district}>
                        <InputLabel id="districts">Quận/Huyện</InputLabel>
                        <Select
                            labelId="districts"
                            label="Quận/Huyện"
                            value={district}
                            onChange={(e) => handleChangeAddress(2, e)}
                        >
                            {districtsOptions?.map((p) => (
                                <MenuItem key={p.value} value={p}>
                                    {p.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{listErr.district ? 'Vui lòng chọn quận/huyện' : ''}</FormHelperText>
                    </FormControl>
                    <FormControl fullWidth required error={listErr.commune}>
                        <InputLabel id="communes">Xã/Phường/TT</InputLabel>
                        <Select
                            labelId="communes"
                            label="Xã/Phường/TT"
                            value={commune}
                            onChange={(e) => handleChangeAddress(3, e)}
                        >
                            {communesOptions?.map((p) => (
                                <MenuItem key={p.value} value={p}>
                                    {p.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{listErr.commune ? 'Vui lòng chọn xã/phường' : ''}</FormHelperText>
                    </FormControl>
                </div>
                <div className={cx('input-wrapper')}>
                    <TextField
                        error={listErr.addressDetail}
                        required
                        fullWidth
                        helperText={listErr.addressDetail ? 'Vui lòng nhập địa chỉ cụ thể' : ''}
                        id="addressDetail"
                        label="Địa chỉ cụ thể"
                        variant="outlined"
                        className={cx('input')}
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                    />
                </div>
                <div className={cx('input-wrapper')}>
                    <FormControl sx={{ width: '100%' }} error={listErr.password} required>
                        <InputLabel htmlFor="password">Mật khẩu</InputLabel>
                        <OutlinedInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => handleClickShowPassword(0)}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Mật khẩu"
                        />
                        <FormHelperText>{listErr.password ? 'Vui lòng nhập mật khẩu' : ''}</FormHelperText>
                    </FormControl>
                </div>

                <div className={cx('input-wrapper')}>
                    <FormControl
                        sx={{ width: '100%' }}
                        required
                        error={listErr.confirmPassword.match || listErr.confirmPassword.required}
                    >
                        <InputLabel htmlFor="confirm-password">Xác nhận mật khẩu</InputLabel>
                        <OutlinedInput
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => handleClickShowPassword(1)}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            label="Xác nhận mật khẩu"
                        />
                        <FormHelperText>
                            {listErr.confirmPassword.required
                                ? 'Vui lòng nhập xác nhận mật khẩu'
                                : listErr.confirmPassword.match
                                ? 'Mật khẩu xác nhận không khớp'
                                : ''}
                        </FormHelperText>
                    </FormControl>
                </div>

                <div className="d-flex justify-content-end align-items-center">
                    <Link href="#" underline="hover">
                        {'Quên mật khẩu?'}
                    </Link>
                </div>

                <div className={cx('action')}>
                    <p>
                        Bạn đã có tài khoản,
                        <Link href="#" underline="hover" onClick={() => navigate('/login')}>
                            {' Đăng nhập'}
                        </Link>
                    </p>
                    <Button variant="contained" onClick={handleRegister} ref={ResgisterBtnRef} size="large">
                        Đăng ký
                    </Button>
                </div>
                <br />
                <div className={cx('other-option')}>
                    <Button variant="outlined">
                        <img src={googleIcon} /> Đăng nhập với Google
                    </Button>

                    <Button variant="outlined">
                        <img src={facebookIcon} /> Đăng nhập với Facebook
                    </Button>
                </div>
            </div>
            <ModalLoading isLoading={isLoading} />
        </div>
    );
}

export default Register;
