import { useState, useCallback } from 'react';

const useOrderCount = () => {
    const [orderCount, setOrderCount] = useState<number | null>(null);

    const fetchOrderCount = useCallback(async (clientId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/orders/${clientId}/count`);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching order count:', errorData);
                throw new Error(errorData.error || 'Error fetching order count');
            }
            const data = await response.json();
            setOrderCount(data.orderCount);
        } catch (error: any) {
            console.error('Error:', error);
            setOrderCount(null);
        }
    }, []);

    return { orderCount, fetchOrderCount };
};

export default useOrderCount;


