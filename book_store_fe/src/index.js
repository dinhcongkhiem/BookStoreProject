import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from './component/GlobalStyles';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthenticationProvider } from './context/AuthenticationProvider';

const theme = createTheme({
    typography: {
        htmlFontSize: 10,
        fontSize: 14,
    },
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AuthenticationProvider>
            <ThemeProvider theme={theme}>
                <GlobalStyles>
                    <App />
                </GlobalStyles>
            </ThemeProvider>
        </AuthenticationProvider>
    </React.StrictMode>,
);

reportWebVitals();
