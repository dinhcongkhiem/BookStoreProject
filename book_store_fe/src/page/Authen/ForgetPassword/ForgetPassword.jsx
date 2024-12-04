import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Button,
    FormGroup,
    IconButton,

    TextField,
} from '@mui/material';

import style from '../Authen.module.scss';
import { validateInputsForgetPass } from '../../../utills/ValidateInputs';
import { AuthenticationContext } from '../../../context/AuthenticationProvider';
import { useMutation } from '@tanstack/react-query';
import AuthService from '../../../service/AuthService';
import { toast } from 'react-toastify';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';

const cx = classNames.bind(style);
function ForgetPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [listErr, setListErr] = useState({
        email: false,
        emailFormat: false,
    });
    const LoginBtnRef = useRef();
    const { authentication } = useContext(AuthenticationContext);

    const forgetPassRequestMutation = useMutation({
        mutationFn: () => AuthService.forgetPass(email),
        onSuccess: () => {
            toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu');
            navigate('/');
        },
        onError: (error) => {
            if (error.response.status === 404) {
                toast.error('Email không tồn tại');
            } else {
                toast.error('Có lỗi xảy ra vui lòng thử lại sau');
            }
        },
    });

    const handleForgetRequest = () => {
        if (validateInputsForgetPass(listErr, { email }, setListErr)) {
            forgetPassRequestMutation.mutate();
        }
    };

    useEffect(() => {
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
                <IconButton className={cx('back-button')} onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <h3 className="m-0">Quên mật khẩu</h3>
                <p className="text-center mb-5" style={{ opacity: 0.8 }}>
                    Nhập email của bạn chúng tôi sẽ gửi cho bạn email khổi phục mật khẩu.
                </p>
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

                    <div className={cx('action')}>
                        <Button variant="contained" onClick={handleForgetRequest} ref={LoginBtnRef} fullWidth>
                            Đặt lại mật khẩu
                        </Button>
                    </div>
                </FormGroup>
            </div>
            <ModalLoading isLoading={forgetPassRequestMutation.isPending} />
        </div>
    );
}

export default ForgetPassword;
