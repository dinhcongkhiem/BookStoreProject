import {
    Home,
    Profile,
    Login,
    Register,
    About,
    Contact,
    Product,
    User,
    Dashboard,
    Cart,
    AddProduct,
    EditProduct,
    DetailProduct,
    Voucher,
    AddVoucher,
    EditVoucher,
    Discount,
    AddDiscount,
    EditDiscount,
    ProductDetail,
    ProductManagement,
} from '../page';
import OAuth2Redirect from '../component/HandlerRedirect/OAuth2Redirect/OAuth2Redirect';
import ActiveAccountRedirect from '../component/HandlerRedirect/ActiveAccountRedirect/ActiveAccountRedirect';

// Public routes
const publicRoutes = [
    { path: '/', component: Home },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
    { path: '/about', component: About },
    { path: '/contact', component: Contact },
    { path: '/product', component: Product },
    { path: '/product/detail', component: ProductDetail },
    { path: '/cart', component: Cart },
    { path: '/oauth2/redirect', component: OAuth2Redirect, layout: null },
    { path: '/verify/redirect', component: ActiveAccountRedirect, layout: null },
];


const userRoutes = [
    { path: '/profile/info', component: Profile },
    { path: '/user', component: User },
];

const adminRoutes = [
    { path: '/admin/dashboard', component: Dashboard, label: 'Thống kê' },
    { path: '/admin/product', component: ProductManagement, label: 'Sản phẩm' },
    { path: '/admin/product/add', component: AddProduct },
    { path: '/admin/product/edit', component: EditProduct },
    { path: '/admin/detailproduct', component: DetailProduct },
    { path: '/admin/voucher', component: Voucher, label: 'Mã giảm giá' },
    { path: '/admin/voucher/add', component: AddVoucher },
    { path: '/admin/voucher/edit', component: EditVoucher },
    { path: '/admin/discount', component: Discount, label: 'Khuyến mãi' },
    { path: '/admin/discount/add', component: AddDiscount },
    { path: '/admin/discount/edit', component: EditDiscount },
];


export { publicRoutes, userRoutes, adminRoutes };
