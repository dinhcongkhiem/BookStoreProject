import { createContext, useCallback, useEffect, useState } from 'react';
import AuthService from '../service/AuthService';
import { toast } from 'react-toastify';
import ModalLoading from '../component/Modal/ModalLoading/ModalLoading';

const AuthenticationContext = createContext();

function AuthenticationProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);
    const [authentication, SetAuthentication] = useState({
        isAuthen: false,
        refreshToken: '',
        user: '',
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const RefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        const User = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (RefreshToken && User) {
            SetAuthentication({
                isAuthen: true,
                refreshToken: RefreshToken,
                user: JSON.parse(User),
            });
        }
        setLoading(false);
    }, []);

    const login = useCallback((email, password, isRemember, navigate) => {
        setIsLoading(true);
        const data = { email, password };
        AuthService.Login(data, isRemember)
            .then((response) => {
                if (response.status === 200) {
                    SetAuthentication({
                        isAuthen: true,
                        refreshToken: response.data.refreshToken,
                        user: response.data.user,
                    });

                    const storage = isRemember ? localStorage : sessionStorage;
                    storage.setItem('refreshToken', response.data.refreshToken);
                    storage.setItem('user', JSON.stringify(response.data.user));
                    setIsLoading(false);
                    navigate('/');
                    toast.success('Đăng nhập thành công', { position: 'top-center' });
                }
            })
            .catch((error) => {
                setIsLoading(false);
                toast.error('Tài khoản hoặc mật khẩu không chính xác!');
                console.error(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        AuthService.logout()
            .then((response) => {
                if (response.status === 200) {
                    toast.success('Đã đăng xuất', { position: 'top-center' });
                    SetAuthentication({
                        isAuthen: false,
                        refreshToken: '',
                        user: '',
                    });
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const value = { login, logout, authentication, loading, SetAuthentication };
    return (
        <AuthenticationContext.Provider value={value}>
            {children}
            <ModalLoading isLoading={isLoading} />
        </AuthenticationContext.Provider>
    );
}

export { AuthenticationProvider, AuthenticationContext };
