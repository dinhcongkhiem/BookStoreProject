import layouts from '../layouts';
import { Home, Profile, Login, Register } from '../page';

// Public routes
const publicRoutes = [
    { path: '/', component: Home },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
];

const userRoutes = [{ path: '/profile/info', component: Profile }];

const adminRoutes = [];

export { publicRoutes, userRoutes, adminRoutes };
