import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
    const [isRemember, setIsRemember] = useState(true);
    const LoginBtnRef = useRef();
    const { login, authentication } = useContext(AuthenticationContext);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleLogin = () => {
        if (validateInputsLogin(listErr, { email, password }, setListErr)) {
            login(email, password, isRemember, navigate);
        }
    };

    useEffect(() => {
        console.log(authentication.isAuthen);

        if (authentication.isAuthen) {
            navigate('/');
        }
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                LoginBtnRef.current.click();
            }
        };
        window.addEventListener('keypress', handleKeyPress);
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
        };
    }, [authentication.isAuthen, navigate]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content')}>
                <IconButton className={cx('back-button')} onClick={() => navigate('/')}>
                    <ArrowBackIcon />
                </IconButton>
                <h3>Đăng nhập</h3>
                <FormGroup>
                    <div className={cx('input-wrapper')}>
                        <TextField
                            size="small"
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
                            <InputLabel size="small" htmlFor="outlined-adornment-password">
                                Mật khẩu
                            </InputLabel>
                            <OutlinedInput
                                size="small"
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
                            control={
                                <Checkbox
                                    defaultChecked
                                    value={isRemember}
                                    onChange={() => setIsRemember(!isRemember)}
                                />
                            }
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
                        <Button variant="contained" onClick={handleLogin} ref={LoginBtnRef} fullWidth>
                            Đăng nhập
                        </Button>
                    </div>
                    <div className={cx('other-option')}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() =>
                                (window.location.href =
                                    'http://localhost:8080/oauth2/authorize/google?redirect_uri=http://localhost:3000/oauth2/redirect')
                            }
                            sx={{
                                gap: '10px',
                            }}
                        >
                            <img src={googleIcon} alt="Google Icon" style={{ width: '24px', height: '24px' }} />
                            Đăng nhập với Google
                        </Button>
                    </div>
                </FormGroup>
            </div>
        </div>
    );
}

export default Login;
