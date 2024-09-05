import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './component/GlobalStyles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthenticationProvider } from './context/AuthenticationProvider';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
const theme = createTheme({
    typography: {
        htmlFontSize: 10,
        fontSize: 14,
    },
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
    <AuthenticationProvider>
        <ThemeProvider theme={theme}>
            <GlobalStyles>
                <App />
                <ToastContainer autoClose={2000} />
            </GlobalStyles>
        </ThemeProvider>
    </AuthenticationProvider>,
    // </React.StrictMode>,
);

reportWebVitals();
