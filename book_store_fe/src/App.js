import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts';
import { adminRoutes, userRoutes, publicRoutes } from './routes/routes';
import { AdminRoute, PrivateRoute } from './component/PrivateRoute/PrivateRoute';
import { Fragment } from 'react';
function App() {
    return (
        <Router>
            <Routes>
                {publicRoutes.map((route, index) => {
                    const Page = route.component;
                    let Layout = DefaultLayout;
                    if (route.layout === null) {
                        Layout = Fragment;
                    }
                    return (
                        <Route
                            key={route.path || index}
                            path={route.path}
                            element={
                                <Layout>
                                    <Page />
                                </Layout>
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
                                <PrivateRoute>
                                    <Layout>
                                        <Page />
                                    </Layout>
                                </PrivateRoute>
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
