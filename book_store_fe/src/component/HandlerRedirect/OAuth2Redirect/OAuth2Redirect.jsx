import { useContext, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthenticationContext } from '../../../context/AuthenticationProvider';
import UserService from '../../../service/UserService';
import { toast } from 'react-toastify';

function OAuth2Redirect() {
    const location = useLocation();
    const navigate = useNavigate();
    const [queryParameters] = useSearchParams();
    const { SetAuthentication } = useContext(AuthenticationContext);
    useEffect(() => {
        const refreshToken = queryParameters.get('refreshToken');

        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
            SetAuthentication((prev) => ({ ...prev, isAuthen: true, refreshToken: refreshToken }));
            UserService.getUserInfo()
                .then((res) => {
                    localStorage.setItem('user', JSON.stringify(res.data));
                })
                .catch((err) => {
                    console.log(err);
                });
            toast.success('Đăng nhập thành công', { position: 'top-center' });
            navigate('/', { state: { from: location, replace: true } });
        } else {
            navigate('/login', { state: { from: location, replace: true } });
            toast.error('Có lỗi xảy ra vui lòng thử lại!', { position: 'top-center' });
        }
    }, []);
    return null;
}

export default OAuth2Redirect;
