import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const ws = useRef(null);
    const reconnectTimer = useRef(null);
    const listeners = useRef(new Map());

    const connect = () => {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws`;
            
            ws.current = new WebSocket(wsUrl);
            setConnectionStatus('connecting');

            ws.current.onopen = () => {
                setIsConnected(true);
                setConnectionStatus('connected');
                console.log('WebSocket connected');
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Notify all listeners
                    listeners.current.forEach((callback) => {
                        callback(data);
                    });
                } catch (error) {
                    console.error('WebSocket message parse error:', error);
                }
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                setConnectionStatus('disconnected');
                console.log('WebSocket disconnected');
                
                // Auto-reconnect after 5 seconds
                reconnectTimer.current = setTimeout(() => {
                    connect();
                }, 5000);
            };
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            setConnectionStatus('error');
        }
    };

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const send = (data) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected');
        }
    };

    const subscribe = (id, callback) => {
        listeners.current.set(id, callback);
        return () => {
            listeners.current.delete(id);
        };
    };

    return (
        <WebSocketContext.Provider value={{ isConnected, connectionStatus, send, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
}