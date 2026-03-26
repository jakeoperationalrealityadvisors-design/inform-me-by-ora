import React from 'react';
import { UIProfileProvider } from './components/ui-profile/UIProfileContext';
import UIProfileStyles from './components/ui-profile/UIProfileStyles';
import { base44 } from '@/api/base44Client';
import { LanguageProvider } from './components/language/LanguageContext';
import { ThemeProvider } from './components/theme/ThemeContext';
import { WebSocketProvider } from './components/connections/WebSocketProvider';
import { ConnectionManager } from './components/connections/ConnectionManager';
import { SecurityProvider } from './components/security/SecurityProvider';
import './components/error/ErrorLogger';
import OfflineIndicator from './components/mobile/OfflineIndicator';
import InstallPWA from './components/mobile/InstallPWA';
import SyncIndicator from './components/mobile/SyncManager';
import MobileNav from './components/mobile/MobileNav';
import { useBackgroundSync } from './components/mobile/BackgroundSync';
import UserProfile from './components/navigation/UserProfile';
import ErrorBoundary from './components/error/ErrorBoundary';
import CookieConsent from './components/common/CookieConsent';

export default function Layout({ children, currentPageName }) {
    // Initialize background sync
    useBackgroundSync();
    
    const [seniorMode, setSeniorMode] = React.useState(false);
    
    // Check for senior mode
    React.useEffect(() => {
        const checkUser = async () => {
            try {
                const user = await base44.auth.me();
                setSeniorMode(user?.technical_level === 'senior');
            } catch (e) {
                // User not logged in yet
            }
        };
        checkUser();
    }, []);
    
    // Register service worker for PWA (only if the file exists)
    React.useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                if (confirm('New version available! Reload to update?')) {
                                    window.location.reload();
                                }
                            }
                        });
                    });
                })
                .catch(() => {
                    // Service worker not available — PWA features disabled
                });
        }
    }, []);

    return (
        <SecurityProvider>
            <ThemeProvider>
                <LanguageProvider>
                    <UIProfileProvider>
                        <ConnectionManager>
                        <WebSocketProvider>
                        <OfflineIndicator />
                        <InstallPWA />
                        <SyncIndicator />
                        <UIProfileStyles />
                        <div className="fixed top-4 right-4 z-50 hidden sm:block" style={{ display: 'none' }}>
                            <UserProfile />
                        </div>
                        <div className="ora-theme" data-senior-mode={seniorMode}>
                    <style>{`
                        /* Dark Mode (Default) */
                        :root[data-theme="dark"],
                        :root {
                            --ora-orange: #FF8C00;
                            --ora-orange-light: #FFB347;
                            --ora-orange-dark: #CC7000;
                            --ora-blue: #1E40AF;
                            --ora-blue-light: #3B82F6;
                            --ora-blue-dark: #1E3A8A;
                            
                            --background: 222 47% 4%;
                            --foreground: 27 100% 50%;
                            --card: 222 47% 7%;
                            --card-foreground: 27 100% 50%;
                            --popover: 222 47% 7%;
                            --popover-foreground: 27 100% 50%;
                            --primary: 27 100% 50%;
                            --primary-foreground: 0 0% 0%;
                            --secondary: 217 91% 30%;
                            --secondary-foreground: 27 100% 50%;
                            --muted: 222 47% 11%;
                            --muted-foreground: 27 100% 50%;
                            --accent: 27 100% 50%;
                            --accent-foreground: 0 0% 0%;
                            --destructive: 0 84% 60%;
                            --destructive-foreground: 0 0% 100%;
                            --border: 217 91% 20%;
                            --input: 217 91% 20%;
                            --ring: 27 100% 50%;
                            --radius: 0.5rem;
                        }
                        
                        /* Light Mode */
                        :root[data-theme="light"] {
                            --ora-orange: #FF8C00;
                            --ora-orange-light: #FFB347;
                            --ora-orange-dark: #CC7000;
                            --ora-blue: #1E90FF;
                            --ora-blue-light: #4DA6FF;
                            --ora-blue-dark: #0066CC;

                            --background: 0 0% 97%;
                            --foreground: 222 47% 11%;
                            --card: 0 0% 100%;
                            --card-foreground: 222 47% 11%;
                            --popover: 0 0% 100%;
                            --popover-foreground: 222 47% 11%;
                            --primary: 27 100% 50%;
                            --primary-foreground: 0 0% 100%;
                            --secondary: 210 20% 92%;
                            --secondary-foreground: 222 47% 11%;
                            --muted: 210 20% 93%;
                            --muted-foreground: 215 16% 47%;
                            --accent: 27 100% 50%;
                            --accent-foreground: 0 0% 100%;
                            --destructive: 0 84% 60%;
                            --destructive-foreground: 0 0% 100%;
                            --border: 214 32% 88%;
                            --input: 214 32% 88%;
                            --ring: 27 100% 50%;
                            --radius: 0.5rem;
                        }
                        
                        body.dark-mode {
                            background: #000000;
                            color: #f0f0f0;
                        }
                        
                        body.light-mode {
                            background: #f8fafc;
                            color: #1e293b;
                        }
                        
                        .ora-theme {
                            min-height: 100vh;
                            transition: background-color 0.3s ease;
                        }
                        
                        .dark-mode .ora-theme {
                            background: #000000;
                        }
                        
                        .light-mode .ora-theme {
                            background: #f8fafc;
                        }
                        
                        .ora-gradient {
                            background: linear-gradient(135deg, var(--ora-orange) 0%, var(--ora-blue) 100%);
                        }
                        
                        .ora-gradient-orange {
                            background: linear-gradient(135deg, var(--ora-orange) 0%, var(--ora-orange-light) 100%);
                        }
                        
                        .ora-gradient-blue {
                            background: linear-gradient(135deg, var(--ora-blue) 0%, var(--ora-blue-dark) 100%);
                        }
                    `}</style>
                        <ErrorBoundary>
                            <div className="sidebar-content">
                                {children}
                            </div>
                        </ErrorBoundary>
                        <MobileNav />
                        <CookieConsent />
                        </div>
                        </WebSocketProvider>
                        </ConnectionManager>
                    </UIProfileProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </SecurityProvider>
    );
}