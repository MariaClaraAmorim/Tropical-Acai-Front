import React, { createContext, useEffect, useState } from 'react';

interface WebSocketContextType {
    messages: any[];
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const ws = new WebSocket('ws://tropical-acai-back.onrender.com/ws');

        ws.onopen = () => {
            console.log('Conectado ao servidor WebSocket');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Mensagem recebida via WebSocket:', message);
        };

        ws.onerror = (error) => {
            console.error('Erro no WebSocket:', error);
        };

        ws.onclose = () => {
            console.log('Conexão WebSocket fechada');
        };

        return () => {
            ws.close();
        };
    }, []);
    useEffect(() => {
        const ws = new WebSocket('ws://tropical-acai-back.onrender.com/ws');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);

            if (message.event === 'Novo pedido') {
                setMessages((prevMessages) => [...prevMessages, message.data]);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        return () => {
            ws.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ messages }}>
            {children}
        </WebSocketContext.Provider>
    );
};
