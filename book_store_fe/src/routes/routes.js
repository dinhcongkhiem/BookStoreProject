import * as Pages from '../page';
import OAuth2Redirect from '../component/HandlerRedirect/OAuth2Redirect/OAuth2Redirect';
import ActiveAccountRedirect from '../component/HandlerRedirect/ActiveAccountRedirect/ActiveAccountRedirect';

// Public routes
const publicRoutes = [
    { path: '/', component: Pages.Home },
    { path: '/login', component: Pages.Login, layout: null },
    { path: '/register', component: Pages.Register, layout: null },
    { path: '/about', component: Pages.About },
    { path: '/contact', component: Pages.Contact },
    { path: '/product', component: Pages.Product },
    { path: '/product/detail', component: Pages.ProductDetail },
    { path: '/cart', component: Pages.Cart },
    { path: '/order ', component: Pages.Order },
    { path: '/orderDetail ', component: Pages.OrderDetail },
    { path: '/oauth2/redirect', component: OAuth2Redirect, layout: null },
    { path: '/verify/redirect', component: ActiveAccountRedirect, layout: null },
    { path: '/payment', component: Pages.Payment },
];

const userRoutes = [
    { path: '/profile/info', component: Pages.Profile },
    { path: '/user', component: Pages.User },
];

const adminRoutes = [
    { path: '/admin/dashboard', component: Pages.Dashboard, label: 'Thống kê' },
    { path: '/admin/product', component: Pages.ProductManagement, label: 'Sản phẩm' },
    { path: '/admin/product/add', component: Pages.AddProduct },
    { path: '/admin/product/edit', component: Pages.EditProduct },
    { path: '/admin/detailproduct', component: Pages.DetailProduct },
    { path: '/admin/voucher', component: Pages.Voucher, label: 'Mã giảm giá' },
    { path: '/admin/voucher/add', component: Pages.AddVoucher },
    { path: '/admin/voucher/edit', component: Pages.EditVoucher },
    { path: '/admin/discount', component: Pages.Discount, label: 'Khuyến mãi' },
    { path: '/admin/discount/add', component: Pages.AddDiscount },
    { path: '/admin/discount/edit', component: Pages.EditDiscount },
    { path: '/admin/attributes', component: Pages.Attributes, label: 'Thuộc tính' },
];

export { publicRoutes, userRoutes, adminRoutes };
