import React, { useState, useRef, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Grid,
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    TextField,
    Checkbox,
    Switch,
    Pagination,
    Collapse,
    Autocomplete,
    InputAdornment,
    FormControl,
    Input,
    RadioGroup,
    FormControlLabel,
    Radio,
    TableSortLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    ShoppingCart as ShoppingCartIcon,
    AttachMoney as AttachMoneyIcon,
    LocalOffer as LocalOfferIcon,
    Search as SearchIcon,
    QrCode,
    ZoomIn,
    Clear,
} from '@mui/icons-material';
import BarcodeScanner from '../../../component/BarcodeScannerComponent/BarcodeScannerComponent';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import classNames from 'classnames/bind';
import styles from './Sell.module.scss';
import ProductService from '../../../service/ProductService';
import useDebounce from '../../../hooks/useDebounce';
import OrderService from '../../../service/OrderService';
import { toast } from 'react-toastify';
import QRCodeModal from '../../../component/Modal/QRCodeModal/QRCodeModal';
import ConfirmModal from '../../../component/Modal/ConfirmModal/ConfirmModal';
import UserService from '../../../service/UserService';
import UserInfo from '../../User/UserInfo';
import ModalLoading from '../../../component/Modal/ModalLoading/ModalLoading';

const cx = classNames.bind(styles);

export default function Sell() {
    const [orderBy, setOrderBy] = useState('newest');
    const [invoices, setInvoices] = useState([]);
    const [activeInvoice, setActiveInvoice] = useState(null);
    const [activeInvoiceData, setActiveInvoiceData] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isAddnewUser, setIsAddnewUser] = useState(false);

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [amout, setAmount] = useState('');
    const [isOpenModalDeleteOrderDetail, setIsOpenModalDeleteOrderDetail] = useState(false);
    const [orderDetailId, setOrderDetailId] = useState(null);
    const [totalUserPayment, setTotalUserPayment] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openQRCodeModal, setOpenQRCodeModal] = useState(null);
    const [paymentType, setPaymentType] = useState('cash');
    const debouncedSearchValue = useDebounce(searchTerm.trim(), 800);
    const queryClient = useQueryClient();
    const handleSearch = (event) => {
        setPage(1);
        setSearchTerm(event.target.value);
    };
    const {
        data: productSellRes,
        error,
        isLoading: isLoadingProducts,
    } = useQuery({
        queryKey: ['productsMng', debouncedSearchValue, page, isProductDialogOpen, orderBy],
        queryFn: () =>
            ProductService.getAllProductForMng({
                page: page,
                pageSize: 20,
                keyword: debouncedSearchValue,
                status: 1,
                sort: orderBy,
            }).then((res) => res.data),
        retry: 1,
        enabled: !!isProductDialogOpen,
    });

    const {
        data: productInOrderRes,
        error: productInOrderError,
        isLoading: isLoadingProductsInOrder,
    } = useQuery({
        queryKey: ['productInOrder', activeInvoice],
        queryFn: () =>
            OrderService.getOrderDetailByID(activeInvoice).then((response) => {
                const updatedData = response.data.items.map((item) => ({
                    ...item,
                    initialQuantity: item.quantity,
                }));
                return { ...response.data, items: updatedData };
            }),
        retry: 1,
        enabled: !!activeInvoice,
    });

    const createOrderMutation = useMutation({
        mutationFn: () => OrderService.createCounterSellOrder(),
        onError: (error) => console.log(error),
        onSuccess: (data) => {
            setActiveInvoice(data.data.orderId);
            setAmount('');
            toast.success('Đơn hàng mới đã được tạo');
            setInvoices((prevInvoices) => [...prevInvoices, data.data]);
        },
    });

    const createOrderDetailMutation = useMutation({
        mutationFn: (data) => OrderService.createOrderDetail({ items: data, orderId: activeInvoice }),
        onError: (error) => {
            console.log(error);
            if (error.response.status === 409) {
                toast.error(error.response.data);
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['productInOrder', activeInvoice]);
        },
    });

    const cancelOrder = useMutation({
        mutationFn: (id) => OrderService.cancelOrderInCounter(id),
        onError: (error) => console.log(error),
        onSuccess: (data, id) => {
            deleteInvoice(id);
            toast.success('Đã hủy đơn hàng');
        },
    });
    const deleteInvoice = (invoiceId) => {
        setInvoices((prevInvoices) => prevInvoices.filter((invoice) => invoice.orderId !== invoiceId));
        if (invoices.length === 1) {
            localStorage.removeItem('invoices');
            setActiveInvoice(null);
        }

        if (activeInvoice === invoiceId) {
            const activeIndex = invoices.findIndex((invoice) => invoice.orderId === invoiceId);
            setActiveInvoice(invoices[activeIndex === 0 ? 1 : 0]?.orderId || null);
            setTotalUserPayment(0);
        }
    };

    const addProductToInvoice = (product) => {
        const data = product.map((p) => ({ productId: p.id, qty: 1 }));
        createOrderDetailMutation.mutate(data);
    };

    const handleAddProduct = () => {
        if (!activeInvoice) {
            toast.warn('Vui lòng tạo đơn hàng');
            return;
        }
        setIsProductDialogOpen(true);
    };

    const confirmAddProducts = () => {
        addProductToInvoice(selectedProducts);
        setIsProductDialogOpen(false);
        setSelectedProducts([]);
    };

    const handleSelectProduct = (product) => {
        const selectedIndex = selectedProducts.findIndex((p) => p.id === product.id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedProducts, product);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedProducts.slice(1));
        } else if (selectedIndex === selectedProducts.length - 1) {
            newSelected = newSelected.concat(selectedProducts.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedProducts.slice(0, selectedIndex),
                selectedProducts.slice(selectedIndex + 1),
            );
        }

        setSelectedProducts(newSelected);
    };

    const handleChangeTab = (event, newValue) => {
        setAmount('');
        setActiveInvoice(newValue);
    };

    const handleAddSelectedUser = (user) => {
        setSelectedUser(user);
        const newData = {
            ...activeInvoiceData,
            user: user,
        };

        setInvoices((prevInvoices) =>
            prevInvoices.map((invoice) => (invoice.orderId === activeInvoice ? newData : invoice)),
        );
    };

    const handleChangeValueCash = (value) => {
        if (value > 150000000) {
            toast.warn('Số tiền không được vượt quá 150.000.000 ₫');
            return;
        }
        setAmount(value);
        handleAddCustomerPayment('cash', value, false);
    };

    const clearPaymentValues = () => {
        setAmount('');
        setTotalUserPayment(0);
        setInvoices((prevInvoices) =>
            prevInvoices.map((invoice) => (invoice.orderId === activeInvoice ? { ...invoice, payment: [] } : invoice)),
        );
    };

    const handleAddCustomerPayment = (type, amount, isReset) => {
        if (!amount) {
            return;
        }

        if (totalUserPayment + parseFloat(amount) > 150000000 && isReset !== false) {
            toast.warn('Số tiền không được vượt quá 150.000.000 ₫');
            setAmount('');
        } else {
            let updatedPayments = [...(activeInvoiceData.payment || [])];
            const existingPaymentIndex = updatedPayments.findIndex((item) => item.paymentType === type);

            if (existingPaymentIndex !== -1 && isReset !== false && type === 'cash') {
                updatedPayments[existingPaymentIndex].amount += parseInt(amount);
            } else {
                const payment = { paymentType: type, amount: parseInt(amount) };
                updatedPayments = isReset ? [...updatedPayments, payment] : [payment];
            }
            const newData = {
                ...activeInvoiceData,
                payment: updatedPayments,
            };

            setInvoices((prevInvoices) =>
                prevInvoices.map((invoice) => (invoice.orderId === activeInvoice ? newData : invoice)),
            );
            if (isReset) {
                setAmount('');
            }
        }
    };

    const removePaymentType = (type) => {
        let updatedPayments = [...(activeInvoiceData.payment || [])];
        const existingPaymentIndex = updatedPayments.findIndex((item) => item.paymentType === type);
        updatedPayments.splice(existingPaymentIndex, 1);
        const newData = {
            ...activeInvoiceData,
            payment: updatedPayments,
        };

        setInvoices((prevInvoices) =>
            prevInvoices.map((invoice) => (invoice.orderId === activeInvoice ? newData : invoice)),
        );
    };
    useEffect(() => {
        const storedInvoices = localStorage.getItem('invoices');
        try {
            setInvoices(JSON.parse(storedInvoices) || []);
            setActiveInvoice(JSON.parse(storedInvoices)?.[0]?.orderId || null);
        } catch {
            setInvoices([]);
        }
    }, []);

    useEffect(() => {
        if (invoices?.length > 0) {
            localStorage.setItem('invoices', JSON.stringify(invoices));
            const activeInvoiceData = invoices.find((invoice) => invoice.orderId === activeInvoice);
            if (amout || paymentType !== 'cash') {
                setTotalUserPayment(
                    activeInvoiceData?.payment
                        ? activeInvoiceData?.payment.reduce((total, item) => total + item.amount, 0)
                        : 0,
                );
            }
            setSelectedUser(activeInvoiceData?.user);
            setActiveInvoiceData(activeInvoiceData);
        }
    }, [invoices, activeInvoice]);

    const updateQuantityMutation = useMutation({
        mutationFn: ({ qty, id }) => OrderService.updateQuantiyOrder({ quantity: qty, id: id }),
        onError: (error) => {
            console.log(error);
            if (error.response.status === 409) {
                toast.error(error.response.data);
            }
        },
        onSuccess: (data, d) => {
            queryClient.invalidateQueries(['productInOrder', activeInvoice]);
        },
    });

    const removeOrderDetailMutation = useMutation({
        mutationFn: (id) => OrderService.deleteOrderDetail(id),
        onError: (error) => console.log(error),
        onSuccess: (data) => {
            setIsOpenModalDeleteOrderDetail(false);
            queryClient.invalidateQueries(['productInOrder', activeInvoice]);
        },
    });

    const debouncedUpdate = useDebounce((id, quantity) => {
        const existingCartItem = productInOrderRes.items.find((cart) => cart.id === id);
        if (existingCartItem && existingCartItem.initialQuantity !== quantity) {
            updateQuantityMutation.mutate({ qty: quantity, id: id });
        }
    }, 0);

    const handleQuantityChange = (productId, value) => {
        const product = productInOrderRes.items.find((item) => item.productId === productId);
        queryClient.setQueryData(['productInOrder', activeInvoice], (oldData) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                items: oldData.items.map((item) => {
                    if (item.productId === productId) {
                        console.log(value);
                        console.log(item.quantity);
                        console.log(item.productQuantity);
                        

                        let newQuantity =  value;
                        if(value  >= item.quantity && item.productQuantity <= 0) {
                            newQuantity = item.quantity;
                        }
                        if (newQuantity < 0) {
                            toast.error('Số lượng không hợp lệ');
                            return item;
                        }
                        
                        if ((product.originalPrice - product.discount) * newQuantity > 100000000) {
                            toast.error('Giá trị đơn hàng quá lớn, vui lòng thử lại');
                            console.log("ahhahaha");
                            return item;
                        }
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

    const successOrderMutation = useMutation({
        mutationFn: () =>
            OrderService.successOrderMutation(activeInvoice, {
                userId: selectedUser ? selectedUser.id : -1,
                paymentType:
                    paymentType === 'cash' ? 'cash_on_delivery' : paymentType === 'bank' ? 'bank_transfer' : 'both',
                amountPaid: totalUserPayment,
            }),
        onError: (error) => {
            if (error.response.status === 409) { toast.error(error.response.data) }
        },
        onSuccess: (res) => {
            setAmount('');
            const url = URL.createObjectURL(res.data);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);

            URL.revokeObjectURL(url);

            iframe.onload = () => {
                iframe.contentWindow?.print();
            };
            deleteInvoice(activeInvoice);
            toast.success('Đã hoàn thành đơn hàng');
        },
    });

    const [searchUserTerm, setSearchUserTerm] = useState('');
    const searchUserTermDebouce = useDebounce(searchUserTerm.trim(), 600);
    const { data: userRes } = useQuery({
        queryKey: ['userByInCount', searchUserTermDebouce, isAddnewUser],
        queryFn: () =>
            UserService.getAllUser({
                page: page,
                size: 15,
                keyword: searchUserTermDebouce.length > 0 ? searchUserTermDebouce : null,
            }).then((response) => response.data),
        retry: 1,
    });

    const handleChangeSort = (prop) => {
        if (prop === 'newest' && orderBy === prop) {
            setOrderBy('oldest');
        } else if (prop === 'newest') {
            setOrderBy(prop);
        } else if (orderBy.split('_')[0] !== prop) {
            setOrderBy(`${prop}_asc`);
        } else {
            setOrderBy(`${prop}_${orderBy.split('_')[1] !== 'desc' ? 'desc' : 'asc'}`);
        }
        setPage(1);
    };

    return (
        <div className={cx('root')}>
            <AppBar position="static" className={cx('appBar')}>
                <Toolbar>
                    <ShoppingCartIcon className={cx('icon')} />
                    <Typography variant="h6" component="div" className={cx('title')}>
                        Bán hàng tại quầy
                    </Typography>
                    <Button
                        color="inherit"
                        variant="outlined"
                        onClick={() => {
                            if (invoices.length === 5) {
                                toast.warn('Tối đa 5 đơn hàng cùng lúc');
                                return;
                            }
                            createOrderMutation.mutate();
                        }}
                        startIcon={<AddIcon />}
                        className={cx('createButton')}
                    >
                        Tạo đơn hàng mới
                    </Button>
                </Toolbar>
            </AppBar>
            <div className={cx('container')}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper className={cx('paper', 'invoicePaper')}>
                            <Typography variant="h6" gutterBottom component="div" className={cx('sectionTitle')}>
                                Danh sách đơn hàng
                            </Typography>
                            <Tabs
                                sx={{ maxHeight: '300px', overflow: 'auto' }}
                                value={activeInvoice}
                                onChange={handleChangeTab}
                            >
                                {invoices.map((invoice) => (
                                    <Tab
                                        size="small"
                                        sx={{ minHeight: 'none' }}
                                        key={invoice.orderId}
                                        label={`Đơn hàng ${invoice.orderId}`}
                                        value={invoice.orderId}
                                        icon={
                                            <IconButton
                                                sx={{ color: 'red' }}
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    cancelOrder.mutate(invoice.orderId);
                                                }}
                                                className={cx('deleteIcon')}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        }
                                        iconPosition="end"
                                    />
                                ))}
                            </Tabs>
                            {activeInvoiceData && (
                                <TableContainer className={cx('productList')}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Sản phẩm</TableCell>
                                                <TableCell align="right">Giá</TableCell>
                                                <TableCell align="center">Số lượng</TableCell>
                                                <TableCell align="right">Tổng</TableCell>
                                                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                                                    Thao tác
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {productInOrderRes?.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center">
                                                            <img
                                                                src={item.thumbnailUrl}
                                                                alt={item.productName}
                                                                className={cx('productImage')}
                                                                style={{ width: '5rem', marginRight: '1rem' }}
                                                            />
                                                            <Typography variant="body2" className={cx('productTitle')}>
                                                                {item.productName}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {(item.originalPrice - item.discount).toLocaleString('vi-VN')}₫
                                                        {item.discount > 0 && (
                                                            <p className={cx('originalPrice')}>
                                                                {item.originalPrice.toLocaleString('vi-VN')}
                                                                <span>₫</span>
                                                            </p>
                                                        )}{' '}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <div className={cx('quantity-container')}>
                                                            <button
                                                                className={cx('quantity-btn')}
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        item.quantity - 1,
                                                                    )
                                                                }
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <RemoveIcon />
                                                            </button>

                                                            <input
                                                                type="number"
                                                                className={cx('quantity-input')}
                                                                value={item.quantity}
                                                                readOnly
                                                                onChange={(e) => {
                                                                    const newValue = e.target.value.replace(
                                                                        /[^0-9]/g,
                                                                        '',
                                                                    );
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
                                                                    handleQuantityChange(
                                                                        item.productId,
                                                                        item.quantity + 1,
                                                                    )
                                                                }
                                                            >
                                                                <AddIcon />
                                                            </button>
                                                        </div>
                                                        <div className={cx('stock-remaining')}>
                                                            Số lượng còn lại:
                                                            {item.productQuantity}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {(
                                                            item.quantity *
                                                            (item.originalPrice - item.discount)
                                                        ).toLocaleString('vi-VN')}
                                                        ₫
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            sx={{ color: 'red' }}
                                                            onClick={() => {
                                                                setIsOpenModalDeleteOrderDetail(true);
                                                                setOrderDetailId(item.id);
                                                            }}
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ paddingLeft: '1.5rem' }}>
                        <Box className={cx('rightColumn')}>
                            <Paper className={cx('paper', 'actionPaper')}>
                                <Typography variant="h6" gutterBottom component="div" className={cx('sectionTitle')}>
                                    Thêm sản phẩm
                                </Typography>
                                <Button
                                    variant="outlined"
                                    onClick={handleAddProduct}
                                    className={cx('addProductButton')}
                                    startIcon={<LocalOfferIcon />}
                                >
                                    Thêm sản phẩm
                                </Button>
                                <Box className={cx('qrToggleContainer')}>
                                    <Typography variant="body1" className={cx('qrToggleLabel')}>
                                        Quét mã vạch
                                    </Typography>
                                    <Switch
                                        disabled={!activeInvoice}
                                        checked={showScanner}
                                        onChange={() => setShowScanner(!showScanner)}
                                        color="primary"
                                    />
                                </Box>
                                <Collapse in={showScanner} collapsedSize={0}>
                                    {showScanner && (
                                        <Box className={cx('scannerContainer')}>
                                            <BarcodeScanner
                                                orderId={activeInvoice}
                                                onSuccess={() => queryClient.invalidateQueries(['productInOrder'])}
                                            />
                                        </Box>
                                    )}
                                </Collapse>
                            </Paper>
                            <Box className={cx('totalAmount')}>
                                <Autocomplete
                                    name="user"
                                    options={
                                        userRes
                                            ? [
                                                ...userRes.content.map((item) => ({
                                                    label: `${item.fullName} - ${item.phoneNum}`,
                                                    id: item.id,
                                                })),
                                                { label: 'Thêm mới người dùng', id: 'new' },
                                            ]
                                            : [{ label: 'Thêm mới người dùng', id: 'new' }]
                                    }
                                    value={selectedUser}
                                    filterOptions={(x) => x}
                                    onInputChange={(e, value) => setSearchUserTerm(value)}
                                    onChange={(event, value) => {
                                        if (value?.id === 'new') {
                                            console.log('Thêm mới người dùng được chọn');
                                            setIsAddnewUser(true);
                                        } else {
                                            handleAddSelectedUser(value);
                                        }
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Người mua" />}
                                    noOptionsText="Không tìm thấy người dùng"
                                    size="small"
                                    sx={{ m: 0, flex: 1, marginBottom: '1rem' }}
                                />

                                <div className="d-flex justify-content-between">
                                    <span>Tổng tiền</span>
                                    <p>
                                        {productInOrderRes
                                            ? productInOrderRes?.originalSubtotal.toLocaleString('vi-VN') + ' ₫'
                                            : 0}
                                    </p>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>Giảm giá</span>
                                    <p>
                                        {productInOrderRes
                                            ? productInOrderRes?.totalDiscount.toLocaleString('vi-VN') + ' ₫'
                                            : 0}
                                    </p>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <strong>Khách cần trả</strong>
                                    <p>
                                        {productInOrderRes
                                            ? productInOrderRes?.grandTotal.toLocaleString('vi-VN') + ' ₫'
                                            : 0}
                                    </p>
                                </div>
                                <FormControl size="small" fullWidth>
                                    <RadioGroup
                                        row
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        name="row-radio-buttons-group"
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                        value={paymentType}
                                        onChange={(e) => {
                                            setPaymentType(e.target.value);
                                            if (e.target.value === 'bank') {
                                                setTotalUserPayment(productInOrderRes?.grandTotal);
                                            }
                                            clearPaymentValues();
                                        }}
                                    >
                                        <FormControlLabel
                                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                                            value="cash"
                                            control={<Radio size="small" />}
                                            label="Tiền mặt"
                                        />
                                        <FormControlLabel
                                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                                            value="bank"
                                            control={<Radio size="small" />}
                                            label="Chuyển khoản"
                                        />
                                        <FormControlLabel
                                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                                            value="both"
                                            control={<Radio size="small" />}
                                            label="Cả hai"
                                        />
                                    </RadioGroup>
                                </FormControl>
                                {paymentType === 'bank' &&
                                    activeInvoice !== null &&
                                    productInOrderRes?.grandTotal > 0 && (
                                        <div className="d-flex align-items-start" style={{ userSelect: 'none' }}>
                                            <img
                                                src={`https://api.vietqr.io/image/970422-0842888559-bXU1iBq.jpg?addInfo=BookBazaar&amount=${productInOrderRes?.grandTotal}`}
                                                alt="qrcode"
                                                width={150}
                                            />
                                            <button
                                                className={cx('show-barcode')}
                                                onClick={() => setOpenQRCodeModal(productInOrderRes?.grandTotal)}
                                            >
                                                <ZoomIn />
                                            </button>
                                        </div>
                                    )}
                                {paymentType === 'cash' && (
                                    <>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong>Tiền khách đưa</strong>
                                            <FormControl variant="standard" sx={{ width: '45%' }}>
                                                <Input
                                                    value={amout}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d*$/.test(value)) {
                                                            handleChangeValueCash(value);
                                                        }
                                                    }}
                                                    disabled={!activeInvoice}
                                                    id="standard-adornment-weight"
                                                    endAdornment={<InputAdornment position="end">₫</InputAdornment>}
                                                    aria-describedby="standard-weight-helper-text"
                                                    inputProps={{
                                                        'aria-label': 'weight',
                                                    }}
                                                />
                                            </FormControl>
                                        </div>
                                    </>
                                )}
                                {paymentType === 'both' && (
                                    <>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <strong>Số tiền</strong>
                                            <FormControl variant="standard" sx={{ width: '45%' }}>
                                                <Input
                                                    value={amout}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value > 150000000) {
                                                            toast.warn('Số tiền không được vượt quá 150.000.000 ₫');
                                                            return;
                                                        }
                                                        if (/^\d*$/.test(value)) {
                                                            setAmount(value);
                                                        }
                                                    }}
                                                    disabled={!activeInvoice}
                                                    id="standard-adornment-weight"
                                                    endAdornment={<InputAdornment position="end">₫</InputAdornment>}
                                                    aria-describedby="standard-weight-helper-text"
                                                    inputProps={{
                                                        'aria-label': 'weight',
                                                    }}
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="d-flex mx-3 gap-3 mt-3">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                disabled={!productInOrderRes || productInOrderRes.items.length === 0}
                                                sx={{ textTransform: 'none' }}
                                                onClick={() => handleAddCustomerPayment('cash', amout, true)}
                                            >
                                                Tiền mặt
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                disabled={!productInOrderRes || productInOrderRes.items.length === 0}
                                                sx={{ textTransform: 'none' }}
                                                onClick={() => handleAddCustomerPayment('bank', amout, true)}
                                            >
                                                Chuyển khoản
                                            </Button>
                                        </div>
                                        {activeInvoiceData?.payment?.length > 0 && (
                                            <div className={cx('list-paying')}>
                                                {activeInvoiceData.payment.map((item) => (
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span>
                                                            {item.paymentType === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                                                            {item.paymentType === 'bank' && (
                                                                <button
                                                                    className={cx('show-barcode')}
                                                                    onClick={() => setOpenQRCodeModal(item.amount)}
                                                                >
                                                                    <QrCode />
                                                                </button>
                                                            )}
                                                            <button
                                                                className={cx('show-barcode', 'cancel')}
                                                                onClick={() => removePaymentType(item.paymentType)}
                                                            >
                                                                <Clear />
                                                            </button>
                                                        </span>
                                                        <span>{item.amount.toLocaleString('vi-VN')} ₫</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between mt-3">
                                            <strong>Khách trả</strong>
                                            <p>{totalUserPayment?.toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                    </>
                                )}
                                {totalUserPayment > productInOrderRes?.grandTotal && (
                                    <div className="d-flex justify-content-between">
                                        <strong>Tiền thừa trả khách</strong>
                                        <p>
                                            {(totalUserPayment - productInOrderRes?.grandTotal).toLocaleString('vi-VN')}
                                            ₫
                                        </p>
                                    </div>
                                )}
                                <Button
                                    onClick={() => successOrderMutation.mutate()}
                                    variant="contained"
                                    className={cx('checkoutButton')}
                                    disabled={
                                        (!activeInvoiceData ||
                                            totalUserPayment < productInOrderRes?.grandTotal ||
                                            !productInOrderRes?.items.length > 0) &&
                                        paymentType !== 'bank'
                                    }
                                    startIcon={
                                        isLoading ? <CircularProgress size={24} color="inherit" /> : <AttachMoneyIcon />
                                    }
                                >
                                    Hoàn thành
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </div>
            <Dialog
                open={isProductDialogOpen}
                onClose={() => {
                    setIsProductDialogOpen(false);
                    setSearchTerm('');
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Chọn sản phẩm</DialogTitle>
                <DialogContent>
                    <Box mb={2}>
                        <TextField
                            size="small"
                            fullWidth
                            variant="outlined"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: <SearchIcon color="action" />,
                            }}
                        />
                    </Box>
                    <TableContainer className={cx('dialogTable')}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox"></TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy.split('_')[0] === 'id'}
                                            direction={orderBy.split('_')[1]}
                                            onClick={() => handleChangeSort('id')}
                                        >
                                            ID
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Sản phẩm</TableCell>
                                    <TableCell align="right">Giá</TableCell>
                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                        Số lượng còn
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {productSellRes?.content?.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedProducts.some((p) => p.id === product.id)}
                                                onChange={() => handleSelectProduct(product)}
                                            />
                                        </TableCell>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell sx={{ maxWidth: '45rem' }}>
                                            <Box display="flex" alignItems="center">
                                                <img
                                                    alt={product.name}
                                                    src={product.thumbnail_url}
                                                    style={{ width: '6.5rem', marginRight: '1rem' }}
                                                />
                                                <Typography variant="body2" className={cx('productTitle')}>
                                                    {product.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            {product.price.toLocaleString('vi-VN')} <span>₫</span>
                                            {product.price !== product.originalPrice && (
                                                <p className={cx('originalPrice')}>
                                                    {product.originalPrice.toLocaleString('vi-VN')}
                                                    <span>₫</span>
                                                </p>
                                            )}{' '}
                                        </TableCell>
                                        <TableCell align="right">{product?.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={2}>
                        <Pagination
                            color="primary"
                            variant="outlined"
                            count={productSellRes?.totalPages < 1 ? 1 : productSellRes?.totalPages}
                            onChange={(e, v) => setPage(v)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsProductDialogOpen(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={confirmAddProducts} color="primary" disabled={selectedProducts.length === 0}>
                        Thêm ({selectedProducts.length})
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={isAddnewUser}
                onClose={() => {
                    setIsAddnewUser(false);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Thêm mới người dùng</DialogTitle>
                <DialogContent>
                    <UserInfo onClose={() => setIsAddnewUser(false)} />
                </DialogContent>
            </Dialog>
            {openQRCodeModal && (
                <QRCodeModal
                    open={openQRCodeModal !== null}
                    onClose={() => setOpenQRCodeModal(null)}
                    amount={openQRCodeModal}
                />
            )}
            <ConfirmModal
                open={isOpenModalDeleteOrderDetail}
                onClose={() => setIsOpenModalDeleteOrderDetail(false)}
                onConfirm={() => removeOrderDetailMutation.mutate(orderDetailId)}
                title="Xác nhận xóa sản phẩm"
                type="info"
            />
            <ModalLoading open={createOrderMutation.isPending || successOrderMutation.isPending || updateQuantityMutation.isPending || removeOrderDetailMutation.isPending} />
        </div>
    );
}
