import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './component/GlobalStyles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthenticationProvider } from './context/AuthenticationProvider';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const theme = createTheme({
    typography: {
        htmlFontSize: 10,
        fontSize: 14,
    },
});
const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthenticationProvider>
                <ThemeProvider theme={theme}>
                    <GlobalStyles>
                        <App />
                        <ToastContainer autoClose={2000} position="top-center" />
                    </GlobalStyles>
                </ThemeProvider>
            </AuthenticationProvider>
        </QueryClientProvider>
    // </React.StrictMode>,
);

reportWebVitals();
