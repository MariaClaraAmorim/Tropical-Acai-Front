import axios from 'axios';
import { useState, useEffect } from 'react';

interface CustomOrder {
    id: string;
    clientId: string;
    total: number;
    deliveryMethod: string;
    deliveryAddress: string | null;
    deliveryFee: number;
    createdAt: Date;
    updatedAt: Date;
    customOrder: {
        size: {
            id: string;
            name: string;
            volume: number;
            price: number;
        };
        cream: {
            id: string;
            name: string;
            price: number;
        };
        fruits: {
            fruit: {
                id: string;
                name: string;
                price: number;
            };
            price: number;
        }[];
        toppings: {
            topping: {
                id: string;
                name: string;
                price: number;
            };
            price: number;
            isFree: boolean;
        }[];
    };
}

interface Order {
    id: string;
    clientId: string;
    total: number;
    deliveryMethod: string;
    deliveryAddress: string | null;
    deliveryFee: number;
    createdAt: Date;
    updatedAt: Date;
    products: {
        productId: string;
        quantity: number;
        price: number;
    }[];
}

export const useCustomOrders = () => {
    const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomOrders = async () => {
            try {
                const response = await axios.get('https://tropical-acai-back.onrender.com/api/order/custom'); 
                console.log(response.data); 
                setCustomOrders(response.data);
            } catch (err) {
                setError('Falha ao buscar pedidos customizados');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomOrders();
    }, []);

    return { customOrders, loading, error };
};

// Hook para buscar todos os pedidos gerais
export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('https://tropical-acai-back.onrender.com/api/orders');
                setOrders(response.data);
            } catch (err) {
                setError('Falha ao buscar pedidos');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return { orders, loading, error };
};