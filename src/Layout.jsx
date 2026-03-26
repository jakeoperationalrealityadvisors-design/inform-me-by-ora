import React, { useState } from 'react';
import { ThemeProvider } from './components/theme/ThemeContext';
import RoleRouter from './components/layout/RoleRouter';
import UserFlowWalkthrough from './components/onboarding/UserFlowWalkthrough';

export default function Layout({ children, currentPageName }) {
    const [showTour, setShowTour] = useState(false);

    return (
        <ThemeProvider>
            <RoleRouter currentPageName={currentPageName} onReplayTour={() => setShowTour(true)}>
                {children}
            </RoleRouter>
            <UserFlowWalkthrough
                forceShow={showTour}
                onClose={() => setShowTour(false)}
            />
        </ThemeProvider>
    );
}