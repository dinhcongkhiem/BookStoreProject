import { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    Button,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
    FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import style from './User.module.scss';
import UserService from '../../service/UserService';
import { validateInputChangePass } from '../../utills/ValidateInputs';

const cx = classNames.bind(style);

function ChangePassword({ setIsLoading }) {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [listErr, setListErr] = useState({
        password: false,
        newPassword: false,
        confirmPassword: {
            required: false,
            match: false,
        },
    });

    const [oldPasswordError, setOldPasswordError] = useState('');

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const mutation = useMutation({
        mutationFn: (data) => UserService.changePassword(data),
        onSuccess: () => {
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setOldPasswordError('');
            toast.success('Đổi mật khẩu thành công');
        },
        onError: (error) => {
            if (error.response && error.response.status === 400) {
                setOldPasswordError('Mật khẩu cũ không đúng');
            } else {
                toast.error('Có lỗi xảy ra khi đổi mật khẩu');
            }
        },
    });

    const handleChangePassword = () => {
        const data = {
            oldPassword: password,
            newPassword: newPassword,
            confirmNewPassword: confirmPassword,
        };

        setOldPasswordError('');

        if (validateInputChangePass(listErr, { password, newPassword, confirmPassword }, setListErr)) {
            mutation.mutate(data);
        }
    };

    if (mutation.isLoading) {
        setIsLoading(true);
    }

    return (
        <div className={cx('section')}>
            <h2>Đổi mật khẩu</h2>
            <div style={{ margin: '0 10rem' }}>
                <FormControl
                    size="small"
                    sx={{ width: '100%', marginTop: '2rem' }}
                    error={listErr.password || !!oldPasswordError}
                    required
                >
                    <InputLabel htmlFor="outlined-adornment-password">Mật khẩu cũ</InputLabel>
                    <OutlinedInput
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
                        label="Mật khẩu cũ"
                    />
                    <FormHelperText>{listErr.password ? 'Vui lòng nhập mật khẩu cũ' : oldPasswordError}</FormHelperText>
                </FormControl>
                <FormControl
                    size="small"
                    sx={{ width: '100%', marginTop: '2rem' }}
                    error={listErr.newPassword}
                    required
                >
                    <InputLabel htmlFor="outlined-adornment-new-password">Mật khẩu mới</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle new password visibility"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        label="Mật khẩu mới"
                    />
                    <FormHelperText>{listErr.newPassword ? 'Vui lòng nhập mật khẩu mới' : ''}</FormHelperText>
                </FormControl>
                <FormControl
                    size="small"
                    sx={{ width: '100%', marginTop: '2rem' }}
                    error={listErr.confirmPassword.required || listErr.confirmPassword.match}
                    required
                >
                    <InputLabel htmlFor="outlined-adornment-confirm-password">Nhập lại mật khẩu</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle confirm password visibility"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        label="Nhập lại mật khẩu"
                    />
                    <FormHelperText>
                        {listErr.confirmPassword.required
                            ? 'Vui lòng nhập lại mật khẩu'
                            : listErr.confirmPassword.match
                              ? 'Mật khẩu mới không trùng khớp'
                              : ''}
                    </FormHelperText>
                </FormControl>
                <div className="d-flex">
                    <Button
                        onClick={handleChangePassword}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={cx('save-button')}
                        fullWidth
                        sx={{ mt: 2, padding: '1rem', width: '40%', mx: 'auto' }}
                    >
                        <span className="fw-semibold">Lưu thay đổi</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

ChangePassword.propTypes = {
    setIsLoading: PropTypes.func,
};

export default ChangePassword;
