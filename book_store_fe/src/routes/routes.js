import { Home, Profile, Login, Register, About, Contact, Product, User, Dashboard, Cart, ProductManagent, AddProduct, EditProduct, DetailProduct } from '../page';
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
    ,
    { path: '/cart', component: Cart },
    { path: '/oauth2/redirect', component: OAuth2Redirect, layout: null },
    { path: '/verify/redirect', component: ActiveAccountRedirect, layout: null },
];

const userRoutes = [
    { path: '/profile/info', component: Profile },
    { path: '/user', component: User },
];

const adminRoutes = [{ path: '/admin/dashboard', component: Dashboard, label: 'Thống kê' },
{ path: '/admin/productmanagent', component: ProductManagent, label: 'Sản phẩm' },
{ path: '/admin/addproduct', component: AddProduct, },
{ path: '/admin/editproduct', component: EditProduct, },
{ path: '/admin/detailproduct', component: DetailProduct, },
];


export { publicRoutes, userRoutes, adminRoutes };
