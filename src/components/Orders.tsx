import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchOrders, fetchOrderCount } from '../api/order';
import './styles.css';
import { FaStar } from 'react-icons/fa';

// Interfaces dos tipos de dados
interface Fruit {
    id: string;
    name: string;
    price: number;
}

interface Topping {
    id: string;
    name: string;
    price: number;
}

interface Size {
    id: string;
    name: string;
    volume: number;
    price: number;
}

interface Cream {
    id: string;
    name: string;
    price: number;
}

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    ingredients: string;
    isFreeProduct: boolean;
    available: boolean;
}

interface ProductOrder {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product: Product;
}

interface FruitOrder {
    id: string;
    fruitId: string;
    orderId: string;
    price: number;
    fruit: Fruit;
}

interface ToppingOrder {
    id: string;
    toppingId: string;
    orderId: string;
    price: number;
    isFree: boolean;
    topping: Topping;
}

interface Order {
    id: string;
    clientId: string;
    total: number;
    couponId: string | null;
    deliveryMethod: string;
    deliveryAddress: string;
    deliveryFee: number;
    createdAt: string;
    updatedAt: string;
    sizeId: string;
    creamId: string;
    status: string;
    products: ProductOrder[];
    fruits: FruitOrder[];
    toppings: ToppingOrder[];
    size: Size;
    cream: Cream;
    coupon: any;
}

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotalOrders] = useState<number>(0);
    const [isCouponUnlocked, setIsCouponUnlocked] = useState<boolean>(false);
    const [ws, setWs] = useState<WebSocket | null>(null);

    const navigate = useNavigate();

    const fetchClientData = async () => {
        const clientId = localStorage.getItem('clientId');

        if (!clientId) {
            toast.error('Usuário não está logado');
            navigate('/login');
            return;
        }

        try {
            const productOrdersResponse = await fetchOrders(clientId);
            console.log('Product Orders Response:', productOrdersResponse);

            if (Array.isArray(productOrdersResponse)) {
                setOrders(productOrdersResponse);
            } else {
                throw new Error('Dados de pedidos inválidos');
            }

            const orderCountResponse = await fetchOrderCount(clientId);
            console.log('Order Count Response:', orderCountResponse);

            if (orderCountResponse && typeof orderCountResponse.total === 'number') {
                const totalCompletedOrders = orderCountResponse.total;
                setTotalOrders(totalCompletedOrders);

                // Verifica se o cupom foi desbloqueado para o próximo pedido (11°, 21°, 31°, etc.)
                const isCouponUnlocked = totalCompletedOrders % 10 === 0 && totalCompletedOrders !== 0;
                setIsCouponUnlocked(isCouponUnlocked);

            } else {
                throw new Error('Dados de contagem de pedidos inválidos');
            }

        } catch (error) {
            console.error('Erro ao buscar dados do cliente:', error);
            setError('Ocorreu um erro ao buscar seus pedidos. Por favor, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientData();

        if (!ws) {
            const websocket = new WebSocket('ws://localhost:3000');
            websocket.onopen = () => {
                console.log('WebSocket connection established');
            };
            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data);
                if (data.type === 'update_order' && data.order) {
                    setOrders(prevOrders => {
                        // Atualiza a lista de pedidos com base no id do pedido
                        const updatedOrders = prevOrders.filter(order => order.id !== data.order.id);
                        return [data.order, ...updatedOrders];
                    });
                }
            };
            websocket.onerror = (error: any) => {
                toast.error('WebSocket error: ' + (error.message || 'Unknown error'));
                console.error('WebSocket error:', error);
            };
            websocket.onclose = (event) => {
                if (event.wasClean) {
                    console.log('WebSocket connection closed cleanly');
                } else {
                    console.error('WebSocket connection closed with error', event.reason);
                }
            };

            setWs(websocket);
        }

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);

    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const formatAddress = (address: string) => {
        try {
            const parsedAddress = JSON.parse(address);
            return `${parsedAddress.logradouro}, ${parsedAddress.numero}, ${parsedAddress.bairro}, ${parsedAddress.localidade} - ${parsedAddress.uf}, CEP: ${parsedAddress.cep}`;
        } catch (e) {
            return 'Endereço inválido';
        }
    };

    const renderStaticProduct = (orderId: string) => (
        <div className="product-info" key={`static-product-${orderId}`}>
            <p className="details">Nome: Açaí Cupom Fidelidade</p>
            <p className="details">Quantidade: 1</p>
            <p className="details">Preço: R$ 0.00</p>
            <p className="details">Ingredientes: Açaí, leite condensado, granola, banana</p>
        </div>
    );

    const renderOrderDetails = (order: Order) => {
        const hasCustomItems = order.size || order.cream || order.fruits.length > 0 || order.toppings.length > 0;

        return (
            <div className="order-details" key={order.id}>
                <p className="status">Status: {order.status}</p>
                <p>Total: R$ {order.total.toFixed(2)}</p>
                <p>Entrega: {order.deliveryMethod}</p>
                <p>Endereço: {formatAddress(order.deliveryAddress)}</p>
                <p>Taxa de Entrega: R$ {order.deliveryFee.toFixed(2)}</p>
                <p>Data do Pedido: {new Date(order.createdAt).toLocaleString()}</p>

                {order.products.length > 0 && (
                    <div className="products-section">
                        <h3>Produtos</h3>
                        {order.products.map((productOrder) => (
                            <div className="product-info" key={productOrder.id}>
                                <p className="details">Produto: {productOrder.product.name}</p>
                                <p className="details">Quantidade: {productOrder.quantity}</p>
                                <p className="details">Preço: R$ {productOrder.price.toFixed(2)}</p>
                                <p className="details">Ingredientes: {productOrder.product.ingredients.replace(/"/g, '')}</p>
                            </div>
                        ))}
                    </div>
                )}

                {hasCustomItems && (
                    <div className="product-info">
                        {order.size && order.size.name && (
                            <p className="details">Tamanho: {order.size.name} - {order.size.volume}ml - R$ {order.size.price.toFixed(2)}</p>
                        )}
                        {order.cream && order.cream.name && (
                            <p className="details">Creme: {order.cream.name} - R$ {order.cream.price.toFixed(2)}</p>
                        )}
                        {order.fruits.length > 0 && (
                            <div className="fruits-section">
                                {order.fruits.map((fruitOrder) => (
                                    <p className="details" key={fruitOrder.id}>Fruta: {fruitOrder.fruit?.name || 'Nome não disponível'} - R$ {fruitOrder.price.toFixed(2)}</p>
                                ))}
                            </div>
                        )}
                        {order.toppings.length > 0 && (
                            <div className="toppings-section">
                                {order.toppings.map((toppingOrder) => (
                                    <p className="details" key={toppingOrder.id}>
                                        Adicional: {toppingOrder.topping?.name || 'Nome não disponível'}
                                        {toppingOrder.isFree ? ' (Grátis)' : ` - R$ ${toppingOrder.price.toFixed(2)}`}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="orders-container">
            <div className="fidelity-card">
                <h2>Cartão Fidelidade <FaStar className="star-icon" /></h2>
                <p>Você fez <span className="orders-count">{total}</span> pedido{total !== 1 ? 's' : ''}.</p>
                <p>A cada <span className="target-orders">10</span> pedidos e você desbloqueará um cupom!</p>
                {isCouponUnlocked && (
                    <div className="coupon-container">
                        <p>Parabéns! Use na sua próxima compra o cupom:</p>
                        <strong>FREE100</strong>
                    </div>
                )}
            </div>

            <div className="order-cards-container">
                {orders.map((order) => (
                    <div className="order-card" key={order.id}>
                        {renderOrderDetails(order)}
                        {order.couponId && renderStaticProduct(order.id)}

                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
