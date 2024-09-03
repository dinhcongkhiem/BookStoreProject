import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthService from '../../../service/AuthService';

function ActiveAccountRedirect() {
    const location = useLocation();
    const navigate = useNavigate();
    const [queryParameters] = useSearchParams();
    useEffect(() => {
        const activeKey = queryParameters.get('activeKey');

        if (activeKey) {
            AuthService.verifyAccount(activeKey)
                .then((res) => {
                    if (res.status === 200) {
                        toast.success('Kích hoạt tài khoản thành công', { position: 'top-center' });
                        navigate('/login', { state: { from: location, replace: true } });
                    }
                })
                .catch((err) => {
                    if (err.response.status === 400) {
                        toast.error(err.response.data, { position: 'top-center' });
                        navigate('/', { state: { from: location, replace: true } });
                    }
                });
        } else {
            navigate('/login', { state: { from: location, replace: true } });
            toast.error('Có lỗi xảy ra vui lòng thử lại!', { position: 'top-center' });
        }
    }, []);
    return null;
}

export default ActiveAccountRedirect;
