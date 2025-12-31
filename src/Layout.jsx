import React from 'react';
import { LanguageProvider } from './components/language/LanguageContext';
import { ThemeProvider } from './components/theme/ThemeContext';

export default function Layout({ children, currentPageName }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <div className="ora-theme">
                    <style>{`
                        /* Dark Mode (Default) */
                        :root[data-theme="dark"],
                        :root {
                            --ora-orange: #FF8C00;
                            --ora-orange-light: #FFB347;
                            --ora-orange-dark: #CC7000;
                            --ora-blue: #1E90FF;
                            --ora-blue-light: #4DA6FF;
                            --ora-blue-dark: #0066CC;
                            
                            --background: 210 20% 8%;
                            --foreground: 210 20% 98%;
                            --card: 210 20% 10%;
                            --card-foreground: 210 20% 98%;
                            --popover: 210 20% 10%;
                            --popover-foreground: 210 20% 98%;
                            --primary: 27 100% 50%;
                            --primary-foreground: 0 0% 100%;
                            --secondary: 210 20% 15%;
                            --secondary-foreground: 210 20% 98%;
                            --muted: 210 20% 15%;
                            --muted-foreground: 210 10% 60%;
                            --accent: 27 100% 50%;
                            --accent-foreground: 0 0% 100%;
                            --destructive: 0 84% 60%;
                            --destructive-foreground: 0 0% 100%;
                            --border: 210 20% 20%;
                            --input: 210 20% 20%;
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
                            background: #0a0e17;
                            color: #e2e8f0;
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
                            background: #0a0e17;
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