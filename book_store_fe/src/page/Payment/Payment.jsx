import classNames from 'classnames/bind';

import style from './Payment.module.scss';
import {
    Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    InputAdornment, Tooltip
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import { useContext, useEffect, useState } from 'react';
import bank_transfer_icon from '../../assets/icons/bank_transfer_icon.png';
import cash_on_delivery_icon from '../../assets/icons/cash_on_delivery_icon.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthenticationContext } from '../../context/AuthenticationProvider';
import UserService from '../../service/UserService';
import UpdateAddressModal from '../../component/Modal/UpdateAddressModal/UpdateAddressModal';
import ModalLoading from '../../component/Modal/ModalLoading/ModalLoading';
import CheckoutService from '../../service/CheckoutService';
import OrderService from '../../service/OrderService';
import { toast } from 'react-toastify';
import QRCodePaymentModal from '../../component/Modal/QRCodePaymentModal/QRCodePaymentModal';
import ChooseVoucherModal from '../../component/Modal/ChooseVoucherModal/ChooseVoucherModal';

const cx = classNames.bind(style);

function Payment() {
    const { authentication } = useContext(AuthenticationContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState();
    const [diffAddress, setDiffAddress] = useState();
    const [addressOption, setAddressOption] = useState('default');
    const [paymentType, setPaymentType] = useState('cash_on_delivery');
    const [paymentData, setPaymentData] = useState('');
    const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
    const cartIdsFromState = location.state?.cartIds || null;
    const productFromState = location.state?.product || null;
    const cartIds = cartIdsFromState || JSON.parse(localStorage.getItem('cartIdsForPayment'));
    const product = productFromState || JSON.parse(localStorage.getItem('productForPayment'));
    const {
        data: userInfo,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['user'],
        queryFn: () => UserService.getUserInfo().then((res) => res.data),
        enabled: !user,
    });

    useEffect(() => {
        const savedUser =
            authentication?.user ||
            JSON.parse(localStorage.getItem('user')) ||
            JSON.parse(sessionStorage.getItem('user'));
        if (!savedUser.address || !savedUser.phoneNum) {
            toast.warning('Vui lòng cập nhật đầy đủ thông tin tài khoản của bạn trước khi mua hàng!', { delay: 5000 });
            navigate('/user/info');
        }
        if (savedUser) {
            setUser(savedUser);
        } else if (userInfo) {
            setUser(userInfo);
        }
    }, [authentication?.user, userInfo]);
    const {
        data: checkoutData,
        error: checkoutErr,
        isLoading: checkoutLoading,
    } = useQuery({
        queryKey: ['checkoutData', cartIds, product, diffAddress, addressOption],
        queryFn: () =>
            CheckoutService.getCheckoutData({
                cartIds,
                productId: product?.pid,
                qty: product?.qty,
                address: addressOption === 'new' ? diffAddress : null,
            }).then((res) => res.data),
    });
    const [isOpen, setIsOpen] = useState(false);
    const handleChangeAddressOption = (e) => {
        if (!diffAddress && e.target.value === 'new') {
            setIsOpen(true);
        }
        setAddressOption(e.target.value);
    };
    useEffect(() => {
        setUser(userInfo);
    }, [userInfo]);

    const createOrderMutation = useMutation({
        mutationFn: (data) => OrderService.createOrder(data),
        onError: (error) => console.log(error),
        onSuccess: (data) => {
            if (data.data.paymentType === 'cash_on_delivery') {
                localStorage.removeItem('cartIdsForPayment');
                localStorage.removeItem('productForPayment');
                toast.success('Đã đặt hàng thành công!');
                navigate('/order');
                return;
            }
            setPaymentData({
                orderCode: data.data.orderCode,
                qrcodeURL: data.data.qrcodeURL,
                finalPrice: data.data.finalPrice,
            });
        },
    });
    const handleOrder = () => {
        const data = {
            address: diffAddress ? diffAddress.address : null,
            shippingFee: checkoutData?.shippingFee,
            paymentType: paymentType,
            buyerName: diffAddress ? diffAddress.fullName : null,
            buyerPhoneNum: diffAddress ? diffAddress.phoneNum : null,
            items: checkoutData?.items.map((i) => ({ cartId: i.cartId, productId: i.productId, qty: i.quantity })),
        };
        createOrderMutation.mutate(data);
    };



    return (
        <div className={cx('d-flex justify-content-center', 'wrapper')}>
            <div className={cx('col-lg-8')}>
                <div className={cx('section')}>
                    <h4>Đơn hàng</h4>
                    <div className={cx('orders')}>
                        {checkoutData?.items.map((checkout, index) => (
                            <div className={cx('order-item')} key={index}>
                                <img src={checkout.thumbnail_url} alt="Order_Item_1" />
                                <p className={cx('name')}>{checkout.productName}</p>
                                <div className={cx('price')}>
                                    <p>
                                        {checkout.price.toLocaleString('vi-VN')}
                                        <span>₫</span>
                                    </p>
                                    {checkout.price !== checkout.original_price && (
                                        <p className={cx('originalPrice')}>
                                            {(checkout.original_price).toLocaleString('vi-VN')}
                                            <span>₫</span>
                                        </p>
                                    )}
                                </div>
                                <p>{checkout.quantity}</p>
                                <p>
                                    {(checkout.price * checkout.quantity).toLocaleString('vi-VN')}
                                    <span>₫</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={cx('section')}>
                    <h4 className={cx('mt-5')}>Giao hàng tới</h4>
                    <FormControl>
                        <RadioGroup value={addressOption} onChange={handleChangeAddressOption}>
                            <FormControlLabel
                                sx={{ alignItems: 'flex-start' }}
                                value="default"
                                control={<Radio size="small" />}
                                label={
                                    <div className={cx('option-value')}>
                                        <p className={cx('title')}>Địa chỉ mặc định: </p>
                                        <div>
                                            <p className={cx('recipient-name')}>{user?.fullName}</p>
                                            <p>
                                                Địa chỉ:
                                                {`${user?.address.addressDetail}, ${user?.address.commune.label},
                                                 ${user?.address.district.label}, ${user?.address.province.label}`}
                                            </p>
                                            <p>
                                                Số điện thoại: <span>{user?.phoneNum}</span>
                                            </p>
                                        </div>
                                    </div>
                                }
                            />

                            <FormControlLabel
                                sx={{ alignItems: 'flex-start' }}
                                value="new"
                                control={<Radio size="small" />}
                                label={
                                    <div className={cx('option-value')}>
                                        <p className={cx('title')}>Sử dụng địa chỉ khác{diffAddress && ':'}</p>
                                        <div>
                                            {diffAddress && (
                                                <>
                                                    <p className={cx('recipient-name')}>{diffAddress?.fullName}</p>
                                                    <p>
                                                        Địa chỉ:
                                                        {`${diffAddress?.address?.addressDetail}, ${diffAddress?.address?.commune.label},
                                                 ${diffAddress?.address.district.label}, ${diffAddress?.address.province.label}`}
                                                    </p>
                                                    <p>
                                                        Số điện thoại: <span>{diffAddress?.phoneNum}</span>
                                                    </p>
                                                    <button onClick={() => setIsOpen(true)}>Sửa</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </RadioGroup>
                    </FormControl>
                </div>
            </div>
            <div className={cx('col-lg-4', 'left-side')}>
                <div className={cx('section')}>
                    <h4>Phương thức thanh toán</h4>
                    <FormControl>
                        <RadioGroup value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                            <FormControlLabel
                                value="cash_on_delivery"
                                control={<Radio size="small" />}
                                label={
                                    <Box display="flex" alignItems="center">
                                        <img
                                            src={cash_on_delivery_icon}
                                            alt="bank_transfer_icon"
                                            style={{ marginRight: 8, width: '3rem' }}
                                        />
                                        <Typography>Thanh toán bằng tiền mặt khi nhận hàng</Typography>
                                    </Box>
                                }
                            />
                            <FormControlLabel
                                value="bank_transfer"
                                control={<Radio size="small" />}
                                label={
                                    <Box display="flex" alignItems="center">
                                        <img
                                            src={bank_transfer_icon}
                                            alt="bank_transfer_icon"
                                            style={{ marginRight: 8, width: '3rem' }}
                                        />
                                        <Typography>Thanh toán bằng chuyển khoản ngân hàng</Typography>
                                    </Box>
                                }
                            />
                        </RadioGroup>
                    </FormControl>
                </div>
                <div className={cx('section')}>
                    <h4>BookBazaar Khuyến Mãi</h4>
                    <div className={cx('discount-content')} onClick={() => setVoucherDialogOpen(true)}>
                        <MonetizationOnIcon className={cx('discount-icon')} />
                        Chọn hoặc nhập mã khuyến mãi.
                    </div>
                </div>
                <div className={cx('section', 'order-price')}>
                    <div className={cx('head')}>
                        <div>
                            <h4>Đơn hàng</h4>
                            <span>{checkoutData?.items.reduce((total, item) => total + item.quantity, 0)} sản phẩm</span>
                        </div>
                        <Link to="/cart">Thay đổi</Link>
                    </div>
                    <div>
                        <div className="d-flex justify-content-between">
                            <p className={cx('label')}>Tạm tính</p>
                            <p>
                                {checkoutData?.originalSubtotal.toLocaleString('vi-VN')}
                                <span>₫</span>
                            </p>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p className={cx('label')}>Phí vận chuyển</p>
                            <p>
                                {checkoutData?.shippingFee.toLocaleString('vi-VN')} <span>₫</span>
                            </p>
                        </div>
                        {checkoutData?.totalDiscount > 0 && (
                            <div className="d-flex justify-content-between">
                                <p className={cx('label')}>Giảm giá từ Deal</p>
                                <p className={cx('discount')}>
                                    -{checkoutData?.totalDiscount.toLocaleString('vi-VN')} <span>₫</span>
                                </p>
                            </div>
                        )}

                        {/* {appliedPromo && (
                            <div className="d-flex justify-content-between">
                                <p className={cx('label')}>Giảm giá từ mã khuyến mãi</p>
                                <p className={cx('discount')}>{appliedPromo.discount}</p>
                            </div>
                        )} */}
                    </div>
                    <div className={cx('order-total-price')}>
                        <div className="d-flex justify-content-between">
                            <h5>Tổng tiền</h5>
                            <div>
                                <p className={cx('total')}>
                                    {checkoutData?.grandTotal.toLocaleString('vi-VN')} <span>₫</span>
                                </p>
                            </div>
                        </div>
                        <Button variant="contained" sx={{ width: '80%' }} onClick={handleOrder}>
                            Đặt hàng
                        </Button>
                    </div>
                </div>
            </div>
            <UpdateAddressModal
                open={isOpen}
                onClose={(isSubmit) => {
                    setIsOpen(false);
                    if (!diffAddress && !isSubmit) {
                        setAddressOption('default');
                    }
                }}
                setValue={setDiffAddress}
            />
            <ModalLoading isLoading={isLoading || checkoutLoading || createOrderMutation.isPending} />
            {paymentData?.qrcodeURL?.length > 0 && (
                <QRCodePaymentModal
                    open={paymentData?.qrcodeURL?.length > 0}
                    handleClose={() => setPaymentData(null)}
                    data={paymentData}
                />
            )}
            <ChooseVoucherModal open={voucherDialogOpen} setOpen={() => setVoucherDialogOpen(false)}/>

        </div>
    );
}

export default Payment;