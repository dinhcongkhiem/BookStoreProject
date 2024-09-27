import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }) => {
    const { authentication, loading } = useContext(AuthenticationContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!authentication.isAuthen) {
                toast.warning('Bạn chưa đăng nhập!', { position: 'top-center' });
                navigate('/');
            } else {
                if (authentication.user.role !== 'USER') {
                    navigate('/');
                }
            }
        }
    }, [authentication, loading, navigate]);

    if (!authentication.isAuthen) {
        return null;
    }
    if (authentication.user.role !== 'USER') {
        return null;
    }
    return children;
};

const AdminRoute = ({ children }) => {
    // const { authentication, loading } = useContext(AuthenticationContext);
    // const navigate = useNavigate();

    // useEffect(() => {
    //     if (!loading) {
    //         if (!authentication.isAuthen) {
    //             toast.warning('Bạn chưa đăng nhập!', { position: 'top-center' });
    //             navigate('/');
    //         } else {
    //             if (authentication.user.role !== 'ADMIN') {
    //                 navigate('/');
    //             }
    //         }
    //     }
    // }, [authentication, loading, navigate]);

    // if (!authentication.isAuthen) {
    //     return null;
    // }
    // if (authentication.user.role !== 'ADMIN') {
    //     return null;
    // }
    return children;
};

export { PrivateRoute, AdminRoute };
