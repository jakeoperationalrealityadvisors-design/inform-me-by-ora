import React from 'react';
import { ThemeProvider } from './components/theme/ThemeContext';
import RoleRouter from './components/layout/RoleRouter';

export default function Layout({ children, currentPageName }) {
    return (
        <ThemeProvider>
            <RoleRouter currentPageName={currentPageName}>
                {children}
            </RoleRouter>
        </ThemeProvider>
    );
}