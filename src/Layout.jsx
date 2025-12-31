import React from 'react';
import { LanguageProvider } from './components/language/LanguageContext';
import { ThemeProvider } from './components/theme/ThemeContext';
import OfflineIndicator from './components/mobile/OfflineIndicator';
import InstallPWA from './components/mobile/InstallPWA';

export default function Layout({ children, currentPageName }) {
    // Register service worker for PWA
    React.useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => console.log('SW registered'))
                .catch(err => console.log('SW registration failed', err));
        }
    }, []);

    return (
        <ThemeProvider>
            <LanguageProvider>
                <OfflineIndicator />
                <InstallPWA />
                <div className="ora-theme">
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
                            
                            --background: 0 0% 100%;
                            --foreground: 222 47% 11%;
                            --card: 0 0% 100%;
                            --card-foreground: 222 47% 11%;
                            --popover: 0 0% 100%;
                            --popover-foreground: 222 47% 11%;
                            --primary: 27 100% 50%;
                            --primary-foreground: 0 0% 100%;
                            --secondary: 210 20% 96%;
                            --secondary-foreground: 222 47% 11%;
                            --muted: 210 20% 96%;
                            --muted-foreground: 215 16% 47%;
                            --accent: 27 100% 50%;
                            --accent-foreground: 0 0% 100%;
                            --destructive: 0 84% 60%;
                            --destructive-foreground: 0 0% 100%;
                            --border: 214 32% 91%;
                            --input: 214 32% 91%;
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
                    {children}
                </div>
            </LanguageProvider>
        </ThemeProvider>
    );
}