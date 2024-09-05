import OAuth2Redirect from '../component/HandlerRedirect/OAuth2Redirect/OAuth2Redirect';
import ActiveAccountRedirect from '../component/HandlerRedirect/ActiveAccountRedirect/ActiveAccountRedirect';
import { Home, Profile, Login, Register } from '../page';

// Public routes
const publicRoutes = [
    { path: '/', component: Home },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
    { path: '/oauth2/redirect', component: OAuth2Redirect, layout: null },
    { path: '/verify/redirect', component: ActiveAccountRedirect, layout: null },
];

const userRoutes = [{ path: '/profile/info', component: Profile }];

const adminRoutes = [];

export { publicRoutes, userRoutes, adminRoutes };
