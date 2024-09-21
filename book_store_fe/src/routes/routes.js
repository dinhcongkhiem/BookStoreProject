import { Home, Profile, Login, Register, About, Contact, Product, User, Dashboard, Cart } from '../page';
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
    { path: '/user', component: User },
    { path: '/cart', component: Cart },
    { path: '/oauth2/redirect', component: OAuth2Redirect, layout: null },
    { path: '/verify/redirect', component: ActiveAccountRedirect, layout: null },
];

const userRoutes = [{ path: '/profile/info', component: Profile }];

const adminRoutes = [{ path: '/admin/dashboard', component: Dashboard }];

export { publicRoutes, userRoutes, adminRoutes };
