import React from 'react';

export default function Layout({ children, currentPageName }) {
    return (
        <div className="ora-theme">
            <style>{`
                :root {
                    --ora-blue: #1e90ff;
                    --ora-dark-blue: #0066cc;
                    --ora-light-blue: #4da6ff;
                    --background: 0 0% 100%;
                    --foreground: 222 47% 11%;
                    --card: 0 0% 100%;
                    --card-foreground: 222 47% 11%;
                    --popover: 0 0% 100%;
                    --popover-foreground: 222 47% 11%;
                    --primary: 210 100% 56%;
                    --primary-foreground: 0 0% 100%;
                    --secondary: 214 32% 91%;
                    --secondary-foreground: 222 47% 11%;
                    --muted: 214 32% 91%;
                    --muted-foreground: 215 16% 47%;
                    --accent: 210 100% 56%;
                    --accent-foreground: 0 0% 100%;
                    --destructive: 0 84% 60%;
                    --destructive-foreground: 0 0% 100%;
                    --border: 214 32% 91%;
                    --input: 214 32% 91%;
                    --ring: 210 100% 56%;
                    --radius: 0.5rem;
                }
                
                body {
                    background: #f8fafc;
                    color: #1e293b;
                }
                
                .ora-theme {
                    min-height: 100vh;
                    background: #f8fafc;
                }
                
                .ora-gradient {
                    background: linear-gradient(135deg, #1e90ff 0%, #0066cc 100%);
                }
            `}</style>
            {children}
        </div>
    );
}