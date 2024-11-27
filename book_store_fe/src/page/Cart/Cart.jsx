import React, { useState, useEffect } from 'react';
import style from './Cart.module.scss';
import classNames from 'classnames/bind';
import { Button, Checkbox, IconButton, TableHead, TableRow, TableCell, TableBody, TableContainer } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Table } from 'react-bootstrap';
import CartService from '../../service/CartService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useDebounce from '../../hooks/useDebounce';
import ConfirmModal from '../../component/Modal/ConfirmModal/ConfirmModal';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ModalLoading from '../../component/Modal/ModalLoading/ModalLoading';
import ChooseVoucherModal from '../../component/Modal/ChooseVoucherModal/ChooseVoucherModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faTicket } from '@fortawesome/free-solid-svg-icons';
const cx = classNames.bind(style);

function Cart() {
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    const [grandTotal, setGrandTotal] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const queryClient = useQueryClient();

    const { data: productsInCart, isLoading } = useQuery({
        queryKey: ['productsInCart'],
        queryFn: () =>
            CartService.getProductInCart({ page: 1 }).then((response) => {
                const updatedData = response.data.cart.map((item) => ({
                    ...item,
                    initialQuantity: item.quantity,
                }));
                return { ...response.data, cart: updatedData };
            }),
        retry: 1,
    });
    useEffect(() => {
        const grandTotal = productsInCart?.cart?.reduce(
            (acc, item) => acc + (selectedItems.includes(item.id) ? item.original_price * item.quantity : 0),
            0,
        );
        const totalDiscount = productsInCart?.cart?.reduce(
            (acc, item) => acc + (selectedItems.includes(item.id) ? item.discount * item.quantity : 0),
            0,
        );
        let voucherDiscount;
        if (selectedVoucher) {
            if (selectedVoucher.type === 'PERCENT') {
                voucherDiscount = (grandTotal * selectedVoucher.value) / 100;
            } else {
                voucherDiscount = selectedVoucher.value;
            }

            if (voucherDiscount > selectedVoucher.maxValue && selectedVoucher.maxValue !== null) {
                voucherDiscount = selectedVoucher.maxValue;
            }
        } else {
            voucherDiscount = 0;
        }
        setVoucherDiscount(voucherDiscount);
        setTotalDiscount(totalDiscount);
        setGrandTotal(grandTotal);
    }, [selectedItems, productsInCart, selectedVoucher]);
    const updateCartMutation = useMutation({
        mutationFn: (data) => CartService.updateCartItem(data),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: (data, d) => {
            queryClient.setQueryData(['productsInCart'], (oldData) => {
                return {
                    ...oldData,
                    cart: oldData.cart.map((item) =>
                        item.id === d.cartId ? { ...item, initialQuantity: d.qty } : item,
                    ),
                };
            });
        },
    });

    const debouncedUpdate = useDebounce((id, quantity) => {
        const existingCartItem = productsInCart.cart.find((cart) => cart.id === id);
        if (existingCartItem && existingCartItem.initialQuantity !== quantity) {
            updateCartMutation.mutate({ qty: quantity, cartId: id });
        }
    }, 600);

    const handleQuantityChange = (productId, value) => {
        queryClient.setQueryData(['productsInCart'], (oldData) => {
            if (!oldData) return oldData;

            return {
                ...oldData,
                cart: oldData.cart.map((item) => {
                    if (item.productId === productId) {
                        const newQuantity = value >= 1 ? Math.min(value, item.productQuantity) : 0;
                        debouncedUpdate(item.id, newQuantity);

                        return {
                            ...item,
                            quantity: newQuantity,
                        };
                    }
                    return item;
                }),
            };
        });
    };

    const handleDeleteIconClick = (id) => {
        setItemToDelete(id);
        setOpenDialog(true);
    };

    const { mutate: handleConfirmDelete } = useMutation({
        mutationFn: (id) => CartService.removeCartItem(id),
        onError: (error) => {
            console.log(error);
        },
        onSuccess: (data, id) => {
            queryClient.setQueryData(['productsInCart'], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    cart: oldData.cart.filter((item) => item.id !== id),
                };
            });
            setOpenDialog(false);
        },
    });

    const handleSelectAll = (event) => {
        setSelectedItems(event.target.checked ? productsInCart.cart.map((item) => item.id) : []);
    };

    const handleSelectItem = (id) => {
        setSelectedItems(
            selectedItems.includes(id) ? selectedItems.filter((itemId) => itemId !== id) : [...selectedItems, id],
        );
    };

    const handleSubmit = () => {
        if (selectedItems.length <= 0) {
            toast.info('Bạn chưa chọn sản phẩm nào để mua.');
            return;
        }
        localStorage.setItem('selectedVoucher', JSON.stringify(selectedVoucher));
        localStorage.setItem('cartIdsForPayment', JSON.stringify(selectedItems));
        localStorage.removeItem('productForPayment');
        navigate('/payment', { state: { cartIds: selectedItems } });
    };

    return (
        <div className={cx('cart-container')}>
            <h2>
                <b>Giỏ Hàng Của Bạn</b>
            </h2>
            <div className={cx('cart-content')}>
                <TableContainer
                    className={cx('cart-item-container')}
                    sx={{
                        width: '100%',
                        overflowX: 'auto',
                        position: 'relative',
                        display: 'block',
                        maxWidth: '100%',
                        '& td, & th': { whiteSpace: 'nowrap' },
                    }}
                >
                    <Table aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox onChange={handleSelectAll} />
                                </TableCell>
                                <TableCell>Sản phẩm</TableCell>
                                <TableCell align="center">Đơn giá</TableCell>
                                <TableCell align="center">Số lượng</TableCell>
                                <TableCell align="center">Thành tiền</TableCell>
                                <TableCell align="center">Xóa</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productsInCart?.cart?.length > 0 ? (
                                productsInCart.cart.map((item) => (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        key={item.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleSelectItem(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                to={`/product/detail?id=${item.productId}`}
                                                style={{ display: 'flex' }}
                                            >
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt="Banner"
                                                    style={{ width: '65px', marginRight: '10px' }}
                                                />
                                                <span className={cx('name-item')}>{item.productName}</span>
                                            </Link>
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.price.toLocaleString('vi-VN')} <span>₫</span>
                                            {item.price !== item.original_price && (
                                                <p className={cx('originalPrice')}>
                                                    {item.original_price.toLocaleString('vi-VN')}
                                                    <span>₫</span>
                                                </p>
                                            )}
                                        </TableCell>

                                        <TableCell align="center">
                                            <div className={cx('quantity-container')}>
                                                <button
                                                    className={cx('quantity-btn')}
                                                    onClick={() =>
                                                        handleQuantityChange(item.productId, item.quantity - 1)
                                                    }
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <RemoveIcon />
                                                </button>

                                                <input
                                                    type="number"
                                                    className={cx('quantity-input')}
                                                    value={item.quantity}
                                                    min="1"
                                                    max={item.productQuantity}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value.replace(/[^0-9]/g, '');
                                                        const numericValue = Number(newValue);
                                                        handleQuantityChange(item.productId, numericValue);
                                                    }}
                                                    onBlur={(e) => {
                                                        const newValue = parseInt(e.target.value);

                                                        if (newValue <= 0 || isNaN(newValue)) {
                                                            handleQuantityChange(item.productId, 1);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    className={cx('quantity-btn')}
                                                    onClick={() =>
                                                        handleQuantityChange(item.productId, item.quantity + 1)
                                                    }
                                                    disabled={item.quantity >= item.productQuantity}
                                                >
                                                    <AddIcon />
                                                </button>
                                            </div>
                                            <div className={cx('stock-remaining')}>
                                                Số lượng còn lại:
                                                {item.productQuantity}
                                            </div>
                                        </TableCell>

                                        <TableCell align="center" style={{ width: '15rem' }}>
                                            {isNaN(item.price * item.quantity)
                                                ? 0
                                                : (item.price * item.quantity)?.toLocaleString('vi-VN')}
                                            <span> ₫</span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <IconButton
                                                className={cx('delete-icon-btn')}
                                                color="error"
                                                onClick={() => handleDeleteIconClick(item.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Giỏ hàng trống
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className={cx('cart-summary')}>
                    <div className={cx('discount-section')}>
                        <h3>BookBazaar Khuyến Mãi</h3>
                        {selectedVoucher ? (
                            <div className={cx('selected-voucher')}>
                                <div>
                                    <p>{`${selectedVoucher.name} giảm  ${
                                        selectedVoucher.type === 'PERCENT'
                                            ? ' ' + selectedVoucher.value + '% '
                                            : ' ' + selectedVoucher.value.toLocaleString('vi-VN') + '₫ '
                                    }`}</p>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        sx={{ textTransform: 'none' }}
                                        onClick={() => setSelectedVoucher(null)}
                                    >
                                        <span className="fw-semibold">Bỏ chọn</span>
                                    </Button>
                                </div>
                                <Button sx={{ textTransform: 'none' }} onClick={() => setVoucherDialogOpen(true)}>
                                    <FontAwesomeIcon icon={faTicket} size="lg" />
                                    <span className="mx-3">Chọn hoặc nhập mã khác</span>
                                    <FontAwesomeIcon icon={faChevronRight} size="lg" />
                                </Button>
                            </div>
                        ) : (
                            <div className={cx('discount-content')} onClick={() => setVoucherDialogOpen(true)}>
                                <MonetizationOnIcon className={cx('discount-icon')} />
                                Chọn hoặc nhập mã khuyến mãi.
                            </div>
                        )}
                    </div>
                    <div className={cx('summary-details')}>
                        <p>
                            <span>Tạm tính:</span>
                            <strong className="ms-3">
                                {grandTotal?.toLocaleString('vi-VN')} <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                        <p>
                            <span>Giảm giá từ Deal:</span>
                            <strong className="ms-3" style={{ color: 'rgb(0, 171, 86)' }}>
                                {selectedItems.length > 0 && '-'}
                                {totalDiscount?.toLocaleString('vi-VN')}
                                <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                        <p>
                            <span>Giảm giá từ mã khuyến mãi:</span>
                            <strong className="ms-3" style={{ color: 'rgb(0, 171, 86)' }}>
                                {selectedItems.length > 0 && '-'}
                                {voucherDiscount?.toLocaleString('vi-VN')}
                                <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                        <hr />
                        <p>
                            <span>Thành tiền:</span>
                            <strong className="ms-3">
                                {(grandTotal - totalDiscount - voucherDiscount)?.toLocaleString('vi-VN')}
                                <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                    </div>
                    <Button variant="outlined" color="primary" className={cx('checkout-button')} onClick={handleSubmit}>
                        Mua hàng ({selectedItems.length})
                    </Button>
                </div>
            </div>

            <ConfirmModal
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onConfirm={() => handleConfirmDelete(itemToDelete)}
                title={'Xác nhận'}
                message={'Xóa sản phẩm này khỏi giỏ hàng của bạn'}
                type={'warn'}
            />
            <ModalLoading isLoading={isLoading || updateCartMutation.isPending} />
            <ChooseVoucherModal
                open={voucherDialogOpen}
                setOpen={() => setVoucherDialogOpen(false)}
                setVoucher={(v) => setSelectedVoucher(v)}
                voucher={selectedVoucher}
                grandTotal={grandTotal - totalDiscount}
            />
        </div>
    );
}

export default Cart;
