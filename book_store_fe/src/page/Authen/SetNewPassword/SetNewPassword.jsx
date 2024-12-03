import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Button,
    FormGroup,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    FormControl,
} from '@mui/material';

import style from '../Authen.module.scss';
import {
    validateInputChangePass,
    validateInputSetNewPass,
    validateInputsForgetPass,
} from '../../../utills/ValidateInputs';
import { AuthenticationContext } from '../../../context/AuthenticationProvider';
import { useMutation } from '@tanstack/react-query';
import AuthService from '../../../service/AuthService';
import { toast } from 'react-toastify';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';

const cx = classNames.bind(style);
function SetNewPassword() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [listErr, setListErr] = useState({
        newPassword: false,
        confirmPassword: {
            required: false,
            match: false,
        },
    });
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const LoginBtnRef = useRef();
    const { authentication } = useContext(AuthenticationContext);
    const [searchParams] = useSearchParams();

    const setNewPassMutation = useMutation({
        mutationFn: (data) => AuthService.setNewPass({ newPassword: data.newPassword, confirmNewPassword: data.confirmPassword, verifyKey: searchParams.get('verifyKey') }),
        onSuccess: () => {
            toast.success('Đặt lại mật khẩu thành công, hãy đăng nhập để mua sách!');
            navigate('/login');
        },
        onError: (error) => console.log(error),
    })

    const handleSetNewPass = () => {
        if (validateInputSetNewPass(listErr, { newPassword: password, confirmPassword: confirmPassword }, setListErr)) {
            setNewPassMutation.mutate({ newPassword: password, confirmPassword: confirmPassword });
        }
    };

    useEffect(() => {
        if(searchParams.get('verifyKey') === null) {
            navigate('/');
        }
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
    }, [authentication.isAuthen, navigate, searchParams]);

    if(searchParams.get('verifyKey') === null) {
        return <div></div>
    }
    return (
        <div className={cx('wrapper')}>
            <div className={cx('content')}>
                <h3>Đặt lại mật khẩu</h3>
                <FormGroup>
                    <div className={cx('input-wrapper')}>
                        <FormControl sx={{ width: '100%' }} error={listErr.newPassword} required>
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
                                            onClick={() => setShowPassword(!showPassword)}
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
                            <FormHelperText>{listErr.newPassword ? 'Vui lòng nhập mật khẩu' : ''}</FormHelperText>
                        </FormControl>
                    </div>

                    <div className={cx('input-wrapper')}>
                        <FormControl
                            sx={{ width: '100%' }}
                            error={listErr.confirmPassword.required || listErr.confirmPassword.match}
                            required
                        >
                            <InputLabel size="small" htmlFor="outlined-adornment-password">
                                Xác nhận mật khẩu
                            </InputLabel>
                            <OutlinedInput
                                size="small"
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                label=" Xác nhận mật khẩu"
                            />
                            <FormHelperText>
                                {listErr.confirmPassword.required
                                    ? 'Vui lòng xác nhận mật khẩu'
                                    : listErr.confirmPassword.match
                                      ? 'Mật khẩu mới không trùng khớp'
                                      : ''}
                            </FormHelperText>
                        </FormControl>
                    </div>

                    <div className={cx('action')}>
                        <Button variant="contained" onClick={handleSetNewPass} ref={LoginBtnRef} fullWidth>
                            Đặt lại mật khẩu
                        </Button>
                    </div>
                </FormGroup>
            </div>
            <ModalLoading isLoading={setNewPassMutation.isPending} />
        </div>
    );
}

export default SetNewPassword;
