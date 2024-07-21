import { Home, Profile } from '../page';

// Public routes
const publicRoutes = [{ path: '/', component: Home }];

const userRoutes = [{ path: '/profile/info', component: Profile }];

const adminRoutes = [];

export { publicRoutes, userRoutes, adminRoutes };
