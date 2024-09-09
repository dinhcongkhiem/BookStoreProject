import layouts from '../layouts';
import { Home, Profile, Login, Register, About, Contact } from '../page';

// Public routes
const publicRoutes = [
    { path: '/', component: Home },
    { path: '/login', component: Login, layout: null },
    { path: '/register', component: Register, layout: null },
    { path: '/about', component: About },
    { path: '/contact', component: Contact },
];

const userRoutes = [{ path: '/profile/info', component: Profile }];

const adminRoutes = [];

export { publicRoutes, userRoutes, adminRoutes };
