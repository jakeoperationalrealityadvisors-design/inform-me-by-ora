import React from 'react';

export default function Layout({ children, currentPageName }) {
    return (
        <div className="dark-theme">
            <style>{`
                :root {
                    --background: 0 0% 5%;
                    --foreground: 210 40% 98%;
                    --card: 222 47% 11%;
                    --card-foreground: 210 40% 98%;
                    --popover: 222 47% 11%;
                    --popover-foreground: 210 40% 98%;
                    --primary: 217 91% 60%;
                    --primary-foreground: 222 47% 11%;
                    --secondary: 217 33% 17%;
                    --secondary-foreground: 210 40% 98%;
                    --muted: 217 33% 17%;
                    --muted-foreground: 215 20% 65%;
                    --accent: 217 91% 60%;
                    --accent-foreground: 210 40% 98%;
                    --destructive: 0 84% 60%;
                    --destructive-foreground: 210 40% 98%;
                    --border: 217 33% 17%;
                    --input: 217 33% 17%;
                    --ring: 217 91% 60%;
                    --radius: 1rem;
                }
                
                body {
                    background: #0a0e17;
                    color: #e2e8f0;
                }
                
                .dark-theme {
                    min-height: 100vh;
                    background: #0a0e17;
                }
            `}</style>
            {children}
        </div>
    );
}