import axios from 'axios';
import { RegisterRequest, LoginRequest, LoginResponse } from '../types/Auth';
import { OrderCountResponse } from '../types/Order';

const API_BASE_URL = 'https://tropical-acai-back.onrender.com/api';

interface OrderProduct {
    id: string;
    quantity: number;
    price: number;
}

interface CreateOrderPayload {
    clientId: string;
    products: OrderProduct[];
    total: number;
}

export const registerUser = async (user: RegisterRequest): Promise<void> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register`, user);
        console.log('Registration successful:', response.data);
        localStorage.setItem('clientId', response.data.clientId);
    } catch (error) {
        console.error('Error registering user:', error);
    }
};

export const loginUser = async (user: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>(`${API_BASE_URL}/login`, user);
        console.log('Login successful:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('clientId', response.data.clientId);
        localStorage.setItem('userType', response.data.userType);
        return response.data;
    } catch (error: any) {
        console.error('Error logging in:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
};

export const logoutUser = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('clientId');
    localStorage.removeItem('userType');
    console.log('Logout successful');
};

export const createOrder = async (payload: CreateOrderPayload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/orders`, payload);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export const fetchOrders = async (clientId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/${clientId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const fetchCustomOrders = async (clientId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/${clientId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching custom orders:', error);
        throw error;
    }
};

export const fetchOrderCount = async (clientId: string): Promise<OrderCountResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/${clientId}/count`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order count:', error);
        throw error;
    }
};

export const validateCoupon = async (couponData: { couponCode: string }) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/validate-coupon`, couponData);
        return response.data;
    } catch (error) {
        console.error('Error validating coupon:', error);
        throw error;
    }
};

export const fetchAddress = async (cep: string) => {
    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching address:', error);
        throw error;
    }
};
