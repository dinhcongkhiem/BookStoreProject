import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import {
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    Link,
    OutlinedInput,
    TextField,
    Typography,
} from '@mui/material';
import FormControl from '@mui/material/FormControl';

import style from '../Authen.module.scss';
import googleIcon from '../../../assets/icons/google.png';
import facebookIcon from '../../../assets/icons/facebook.png';
import { validateInputsLogin } from '../../../utills/ValidateInputs';
import { AuthenticationContext } from '../../../context/AuthenticationProvider';
const cx = classNames.bind(style);
function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [listErr, setListErr] = useState({
        email: false,
        emailFormat: false,
        password: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isRemember, setIsRemember] = useState(true);
    const LoginBtnRef = useRef();
    const { login } = useContext(AuthenticationContext);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleLogin = () => {
        if (validateInputsLogin(listErr, { email, password }, setListErr)) {
            setIsLoading(true);
            login(email, password, isRemember);
            setIsLoading(false);
        }
    };
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                LoginBtnRef.current.click();
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
                <h3>Đăng nhập</h3>
                <FormGroup>
                    <div className={cx('input-wrapper')}>
                        <TextField
                            error={listErr.email || listErr.emailFormat}
                            required
                            fullWidth
                            helperText={
                                listErr.email ? 'Vui lòng nhập email' : listErr.emailFormat ? 'Email không hợp lệ' : ''
                            }
                            id="outlined-basic"
                            label="Email"
                            variant="outlined"
                            className={cx('input')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={cx('input-wrapper')}>
                        <FormControl sx={{ width: '100%' }} error={listErr.password} required>
                            <InputLabel htmlFor="outlined-adornment-password">Mật khẩu</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
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

                    <div className="d-flex justify-content-between align-items-center">
                        <FormControlLabel
                            control={<Checkbox defaultChecked value={isRemember} onChange={(e) => console.log(e)} />}
                            label={<Typography sx={{ fontWeight: 600 }}>Ghi nhớ đăng nhập</Typography>}
                        />
                        <Link underline="hover">{'Quên mật khẩu?'}</Link>
                    </div>

                    <div className={cx('action')}>
                        <p>
                            Bạn chưa có tài khoản,
                            <Link underline="hover" onClick={() => navigate('/register')}>
                                {' Đăng ký'}
                            </Link>
                        </p>
                        <Button variant="contained" onClick={handleLogin} ref={LoginBtnRef}>
                            Đăng nhập
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
                </FormGroup>
            </div>
        </div>
    );
}

export default Login;
