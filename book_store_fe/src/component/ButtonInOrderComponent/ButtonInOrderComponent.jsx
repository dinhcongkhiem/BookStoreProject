import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import OrderService from '../../service/OrderService';
import ConfirmModal from '../Modal/ConfirmModal/ConfirmModal';
import CartService from '../../service/CartService';
import ModalLoading from '../Modal/ModalLoading/ModalLoading';
function ButtonInOrder({ status, orderId, onClose, onRefetch, productIds }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith('/admin');
    const [isOpenConfirm, setIsOpenConfirm] = useState({ type: null, isOpen: false });

    const handleNavigate = (path) => navigate(path);

    const reBuyProductsMutation = useMutation({
        mutationFn: () => CartService.rebuyProduct(productIds),
        onError: (error) => {
            if (error.response?.status === 409) {
                toast.error('Sản phẩm đã hết hàng');
            }
        },
        onSuccess: () => {
            navigate('/cart');
        },
    });
    const updateStatusOrderMutation = useMutation({
        mutationFn: ({ id, status }) => OrderService.updateStatusOrder(id, status),
        onError: (error) => console.error(error),
        onSuccess: () => {
            setIsOpenConfirm({ type: null, isOpen: false });
            toast.success('Đã cập nhật đơn hàng');
            if (onRefetch) {
                onRefetch();
            }
            queryClient.invalidateQueries(['orderDetail', orderId]);
            if (isAdmin) queryClient.invalidateQueries(['orderMng']);
            onClose();
        },
    });

    const handleOpenConfirm = (type) => setIsOpenConfirm({ type, isOpen: true });
    const handleCloseConfirm = () => setIsOpenConfirm({ type: null, isOpen: false });
    const handleConfirm = (type) => {
        updateStatusOrderMutation.mutate({ id: orderId, status: type });
    };

    const CancelOrderButton = () => (
        <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleOpenConfirm('CANCELED')}
        >
            Hủy đơn hàng
        </Button>
    );

    const ReorderButton = () => (
        <Button
            variant="outlined"
            color="primary"
            startIcon={<ReplayIcon />}
            onClick={() => reBuyProductsMutation.mutate()}
        >
            Mua lại
        </Button>
    );

    const buttons = {
        AWAITING_PAYMENT: !isAdmin && (
            <>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PaymentIcon />}
                    onClick={() => handleNavigate(`/payment/repayment/${orderId}`)}
                >
                    Thanh toán lại
                </Button>
                <CancelOrderButton />
            </>
        ),
        CANCELED: !isAdmin && <ReorderButton />,
        PROCESSING: isAdmin ? (
            <>
                <CancelOrderButton />
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckCircle />}
                    onClick={() => handleOpenConfirm('SHIPPING')}
                >
                    Xác nhận đơn hàng
                </Button>
            </>
        ) : (
            <CancelOrderButton />
        ),
        SHIPPING: isAdmin && (
            <>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckCircle />}
                    onClick={() => handleOpenConfirm('COMPLETED')}
                >
                    Hoàn thành đơn hàng
                </Button>
                <CancelOrderButton />
            </>
        ),
    };

    return (
        <>
            {buttons[status] || null}
            {isOpenConfirm.isOpen && (
                <ConfirmModal
                    open={isOpenConfirm.isOpen}
                    onClose={handleCloseConfirm}
                    onConfirm={() => handleConfirm(isOpenConfirm.type)}
                    title={'Xác nhận'}
                    message={
                        isOpenConfirm.type === 'SHIPPING'
                            ? 'Chuyển trạng thái đơn hàng qua đang giao'
                            : isOpenConfirm.type === 'CANCELED'
                              ? 'Bạn đang muốn hủy đơn hàng này?'
                              : 'Bạn đang muốn hoàn thành đơn hàng này?'
                    }
                />
            )}
            <ModalLoading open={updateStatusOrderMutation.isPending} />
        </>
    );
}
export default ButtonInOrder;
