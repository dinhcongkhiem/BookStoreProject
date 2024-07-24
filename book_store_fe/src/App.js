import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts';
import { adminRoutes, userRoutes, publicRoutes } from './routes/routes';
import { AdminRoute, PrivateRoute } from './component/PrivateRoute/PrivateRoute';
function App() {
    return (
        <Router>
            <Routes>
                {publicRoutes.map((route, index) => {
                    const Page = route.component;
                    return (
                        <Route
                            key={route.path || index}
                            path={route.path}
                            element={
                                <DefaultLayout>
                                    <Page />
                                </DefaultLayout>
                            }
                        />
                    );
                })}
                {userRoutes.map((route, index) => {
                    const Page = route.component;
                    let Layout = DefaultLayout;
                    if (route.layout) {
                        Layout = route.layout;
                    }
                    return (
                        <Route
                            key={route.path || index}
                            path={route.path}
                            element={
                                <userRoutes>
                                    <Layout>
                                        <Page />
                                    </Layout>
                                </userRoutes>
                            }
                        />
                    );
                })}

                {adminRoutes.map((route, index) => {
                    const Page = route.component;
                    let Layout = DefaultLayout;
                    if (route.layout) {
                        Layout = route.layout;
                    }
                    return (
                        <Route
                            key={route.path || index}
                            path={route.path}
                            element={
                                <AdminRoute>
                                    <Layout>
                                        <Page />
                                    </Layout>
                                </AdminRoute>
                            }
                        />
                    );
                })}
            </Routes>
        </Router>
    );
}

export default App;
