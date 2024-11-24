import React, { memo, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField } from '@mui/material';
import classNames from 'classnames/bind';
import style from './QRCodePaymentModal.module.scss';
import icon from '../../../assets/icons/bank_transfer_icon.png';
import { Close, QrCode } from '@mui/icons-material';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import { useMutation, useQuery } from '@tanstack/react-query';
import OrderService from '../../../service/OrderService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const cx = classNames.bind(style);
const QRCodePaymentModal = ({ open, handleClose, data }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(300);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);

    const { data: responseStatus, error } = useQuery({
        queryKey: ['checkStatusPayment'],
        queryFn: () => OrderService.checkStatusOrder(data?.orderCode).then((res) => res.data),
        retry: 1,
        refetchInterval: 3000,
        enabled: !!data.qrcodeURL,
    });
    useEffect(() => {       
        if(responseStatus && responseStatus === "PROCESSING" && data.qrcodeURL.length > 0) {
            toast.success('Đã đặt hàng thành công!');
            handleClose();
            navigate('/order');
            localStorage.removeItem('selectedVoucher');
        }
    }, [responseStatus]);
    const cancelPaymentMutation = useMutation({
        mutationFn: (orderCode) => OrderService.cancelPayment(orderCode),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: () => {
            toast.success('Đã hủy thanh toán thành công');
            handleClose();
            navigate('/order');
        },
    });

    const handleCancelPayment = () => {
        cancelPaymentMutation.mutate(data?.orderCode);
    };

    const handleClosePayment = () => {
        setIsOpenConfirmModal(true);
    };
    useEffect(() => {
        if (timeLeft <= 0) {
            toast.warn('Yêu cầu thanh toán của bạn đã bị hủy, bạn có thể thực hiện thanh toán lại sau đó!', {
                delay: 5000,
            });
            handleClose();
            navigate('/order');
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);
    const minutes = Math.floor(timeLeft / 60)
        .toString()
        .padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    return (
        <Dialog
            open={open}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            maxWidth={'none'}
            disableEscapeKeyDown
        >
            <DialogTitle id="confirm-dialog-title">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <img src={icon} alt="icon" width={35} /> Thanh toán bằng chuyển khoản ngân hàng
                    </div>
                    <div className={cx('close-btn')} onClick={handleClosePayment}>
                        <Close />
                    </div>
                </div>
            </DialogTitle>
            <DialogContent dividers>
                <div className="d-flex gap-5">
                    <div className={cx('qrcode-container')}>
                        <div className={cx('qrcode-img')}>
                            <img src={data?.qrcodeURL} alt="" />
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                            <p style={{ opacity: 0.6 }}>Tổng tiền</p>
                            <p className="fw-bold">{data?.finalPrice?.toLocaleString('vi-VN')} ₫</p>
                        </div>
                    </div>
                    <div className={cx('tutorial', 'col-7')}>
                        <h4>Quét mã QR để thanh toán</h4>
                        <div className={cx('step')}>
                            <div>1</div>
                            <p>Mở ứng dụng ngân hàng có hỗ trợ VietQR trên điện thoại. </p>
                        </div>

                        <div className={cx('step')}>
                            <div>2</div>
                            <p>
                                Trên ứng dụng chọn tính năng <QrCode sx={{ margin: '0 .6rem' }} /> Quét mã QR.{' '}
                            </p>
                        </div>

                        <div className={cx('step')}>
                            <div>3</div>
                            <p>Quét mã QR ở trang này và thanh toán. </p>
                        </div>

                        <div className={cx('countdown')}>
                            <p>Giao dịch kết thúc sau</p>
                            <div>
                                <p>{minutes}</p>
                                <span>:</span>
                                <p>{seconds}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
            <ConfirmModal
                open={isOpenConfirmModal}
                onClose={() => setIsOpenConfirmModal(false)}
                type="warn"
                onConfirm={handleCancelPayment}
                title="Hủy thanh toán"
                message={
                    'Bạn có chắc muốn hủy thanh toán đơn hàng này, bạn có thể thanh toán lại trong vòng 5 phút trước khi nó bị hủy!'
                }
            />
        </Dialog>
    );
};

export default memo(QRCodePaymentModal);
