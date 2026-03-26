import React from 'react';
import RoleRouter from './components/layout/RoleRouter';
import './components/error/ErrorLogger';

export default function Layout({ children, currentPageName }) {
    return (
        <RoleRouter currentPageName={currentPageName}>
            {children}
        </RoleRouter>
    );
}