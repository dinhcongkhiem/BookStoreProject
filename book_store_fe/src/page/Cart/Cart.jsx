import React, { useState, useEffect } from 'react';
import style from './Cart.module.scss';
import classNames from 'classnames/bind';
import {
    Button,
    Checkbox,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    InputAdornment,
    Box,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CancelIcon from '@mui/icons-material/Cancel';
import { Table } from 'react-bootstrap';
import CartService from '../../service/CartService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useDebounce from '../../hooks/useDebounce';
import ConfirmModal from '../../component/Modal/ConfirmModal/ConfirmModal';
const cx = classNames.bind(style);

function Cart() {
    const [selectedItems, setSelectedItems] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCount, setSelectedCount] = useState(0);
    const queryClient = useQueryClient();
    useEffect(() => {
        setSelectedCount(selectedItems.length);
    }, [selectedItems]);

    const { data: productsInCart } = useQuery({
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
        setSelectedItems(event.target.checked ? productsInCart.cart.map((item) => item.productId) : []);
    };

    const handleSelectItem = (id) => {
        setSelectedItems(
            selectedItems.includes(id) ? selectedItems.filter((itemId) => itemId !== id) : [...selectedItems, id],
        );
    };

    const totalAmount = productsInCart?.cart?.reduce(
        (acc, item) => acc + (selectedItems.includes(item.productId) ? item.price * item.quantity : 0),
        0,
    );

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
                                                checked={selectedItems.includes(item.productId)}
                                                onChange={() => handleSelectItem(item.productId)}
                                            />
                                        </TableCell>
                                        <TableCell sx={{display: 'flex'}}>
                                            <img
                                                src={item.thumbnail_url}
                                                alt="Banner"
                                                style={{ width: '65px', marginRight: '10px' }}
                                            />
                                            <span className={cx('name-item')}>{item.productName}</span>
                                        </TableCell>
                                        <TableCell align="center">
                                            {item.price.toLocaleString()} <span>₫</span>
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
                                                {isNaN(item.productQuantity - item.quantity)
                                                    ? 0
                                                    : item.productQuantity - item.quantity}
                                            </div>
                                        </TableCell>

                                        <TableCell align="center" style={{ width: '15rem' }}>
                                            {isNaN(item.price * item.quantity)
                                                ? 0
                                                : (item.price * item.quantity)?.toLocaleString('vi-VN')}
                                            <span>₫</span>
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
                        <div className={cx('discount-content')} onClick={() => setDiscountDialogOpen(true)}>
                            <MonetizationOnIcon className={cx('discount-icon')} />
                            <span>Chọn hoặc nhập mã khuyến mãi khác</span>
                        </div>
                    </div>
                    <div className={cx('summary-details')}>
                        <p>
                            Tạm tính:
                            <strong>
                                {totalAmount?.toLocaleString()} <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                        <p>
                            Giảm giá:
                            <strong>
                                0 <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                        <hr />
                        <p>
                            Thành tiền:
                            <strong>
                                {totalAmount?.toLocaleString()} <span className={cx('currency-symbol')}>₫</span>
                            </strong>
                        </p>
                    </div>
                    <Button variant="outlined" color="primary" className={cx('checkout-button')}>
                        Mua hàng ({selectedCount})
                    </Button>
                </div>
            </div>

            <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)}>
                <DialogTitle>Chọn mã giảm giá</DialogTitle>
                <DialogContent>
                    <div className={cx('search-container')}>
                        <TextField
                            placeholder="Tìm kiếm mã giảm giá..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocalOfferIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {searchTerm ? (
                                            <IconButton onClick={() => setSearchTerm('')} className={cx('close-icon')}>
                                                <CancelIcon />
                                            </IconButton>
                                        ) : (
                                            <Box sx={{ width: '1.5rem' }} />
                                        )}
                                    </InputAdornment>
                                ),
                                classes: {
                                    input: cx('custom-textfield'),
                                },
                                style: { width: '25rem' },
                            }}
                        />
                        <Button className={cx('search-button')} variant="outlined" disabled={searchTerm === ''}>
                            Xác nhận
                        </Button>
                    </div>
                    <p>Chưa có mã giảm giá nào được áp dụng.</p>
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" color="primary" onClick={() => setDiscountDialogOpen(false)}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmModal
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onConfirm={() => handleConfirmDelete(itemToDelete)}
                title={'Xác nhận'}
                message={'Xóa sản phẩm này khỏi giỏ hàng của bạn'}
                type={'warn'}
            />
        </div>
    );
}

export default Cart;
