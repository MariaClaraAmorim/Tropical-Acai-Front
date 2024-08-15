import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import './AdminOrders.css';
import axios from 'axios';

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
    clientName: string;
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

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [deliveryMethod, setDeliveryMethod] = useState<'retirada' | 'delivery'>('retirada');
    const [filter, setFilter] = useState<'Todos' | 'Completo' | 'Cancelado' | 'Aguardando'>('Todos');

    const fetchOrders = async () => {
        try {
            const response = await axios.get('https://tropical-acai-back.onrender.com/api/orders');
            const ordersWithParsedAddress = response.data.map((order: Order) => ({
                ...order,
                deliveryAddress: typeof order.deliveryAddress === 'string'
                    ? JSON.parse(order.deliveryAddress)
                    : order.deliveryAddress,
            }));
            setOrders(ordersWithParsedAddress);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch orders');
            setLoading(false);
        }
    };

    const connectWebSocket = () => {
        if (!ws) {
            const websocket = new WebSocket('wss://tropical-acai-back.onrender.com');
            websocket.onopen = () => {
                console.log('WebSocket connection established');
            };
            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('WebSocket data received:', data);

                if (data.type === 'new_order') {
                    setOrders(prevOrders => {
                        const updatedOrders = [data.order, ...prevOrders].sort(
                            (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        );
                        console.log('Updated orders:', updatedOrders);
                        return updatedOrders;
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
                // Reconnect after 5 seconds
                setTimeout(connectWebSocket, 5000);
            };

            setWs(websocket);
        }
    };

    useEffect(() => {
        fetchOrders();
        connectWebSocket();

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);

    const handleAccept = async (orderId: string) => {
        try {
            await axios.put(`https://tropical-acai-back.onrender.com/api/orders/${orderId}/accept`);
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'em preparo' } : order));
            toast.success('Pedido em preparação');
        } catch (error) {
            toast.error('Falha ao aceitar pedido');
        }
    };

    const handleFinalize = async (orderId: string, deliveryMethod: string) => {
        try {
            const newStatus = deliveryMethod === 'retirada' ? 'pronto para retirada' : 'saiu para entrega';
            await axios.put(`https://tropical-acai-back.onrender.com/api/orders/${orderId}/finalize`);
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
            toast.success(`Pedido ${newStatus === 'pronto para retirada' ? 'pronto para retirada' : 'saiu para entrega'}`);
        } catch (error) {
            toast.error('Falha ao finalizar pedido');
        }
    };

    const handleCancel = async (orderId: string) => {
        try {
            await axios.put(`https://tropical-acai-back.onrender.com/api/orders/${orderId}/cancel`);
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'Cancelado' } : order));
            toast.success('Pedido Cancelado');
        } catch (error) {
            toast.error('Falha ao cancelar pedido');
        }
    };


    if (loading) {
        return <div className="loading">Carregando...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const formatAddress = (address: any) => {
        if (typeof address === 'string') {
            try {
                address = JSON.parse(address);
            } catch (e) {
                return 'Endereço inválido';
            }
        }

        if (address && address.logradouro) {
            return `${address.logradouro}, ${address.numero}, ${address.bairro}, ${address.localidade} - ${address.uf}, CEP: ${address.cep}`;
        }
        return 'Endereço não disponível';
    };


    const renderCustomOrder = (order: Order) => {
        const hasCustomItems =
            order.size ||
            order.cream ||
            (order.fruits && order.fruits.length > 0) ||
            (order.toppings && order.toppings.length > 0);

        if (!hasCustomItems) {
            return (
                <tr>
                    <td colSpan={4}>Este pedido não possui itens personalizados</td>
                </tr>
            );
        }

        return (
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Cremes</th>
                        <th>Frutas</th>
                        <th>Adicionais</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{order.size ? `Tamanho: ${order.size.name} ${order.size.volume ? `${order.size.volume}ml` : ''}` : 'N/A'}</td>
                        <td>{order.cream ? `${order.cream.name}` : 'N/A'}</td>
                        <td>{order.fruits && order.fruits.length > 0 ? order.fruits.map((fruitOrder) => fruitOrder.fruit?.name || 'Nome não informado').join(', ') : 'N/A'}</td>
                        <td>{order.toppings && order.toppings.length > 0 ? order.toppings.map((toppingOrder) => toppingOrder.topping?.name || 'Nome não informado').join(', ') : 'N/A'}</td>
                        <td>
                            <div className="order-actions">
                                {order.status === 'Aguardando confirmação' && (
                                    <>
                                        <button className="btn accept" onClick={() => handleAccept(order.id)}>Aceitar</button>
                                        <button className="btn cancel" onClick={() => handleCancel(order.id)}>Cancelar</button>
                                    </>
                                )}
                                {(order.status === 'em preparo' || order.status === 'pronto para retirada') && (
                                    <button className="finalize-button" onClick={() => handleFinalize(order.id, order.deliveryMethod)}>Finalizar</button>
                                )}
                                {(order.status === 'pronto para retirada' || order.status === 'saiu para entrega' || order.status === 'completo') && (
                                    <button className="completed-status">Pedido já finalizado</button>
                                )}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
    };

    const renderProductOrder = (order: Order) => {
        const hasProductItems = order.products && order.products.length > 0;

        if (!hasProductItems) {
            return (
                <tr>
                    <td colSpan={4}>Este pedido não possui itens prontos</td>
                </tr>
            );
        }

        return (
            <table className="orders-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Quantidade</th>
                        <th>Preço</th>
                        <th>Ingredientes</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {order.products.map((productOrder) => (
                        <tr key={productOrder.id}>
                            <td>{productOrder.product?.name || 'Nome não disponível'}</td>
                            <td>{productOrder.quantity}</td>
                            <td>R$ {productOrder.price.toFixed(2)}</td>
                            <td>{productOrder.product?.ingredients.replace(/"/g, '') || 'Ingredientes não disponíveis'}</td><td>
                                <div className="order-actions">
                                    {order.status === 'Aguardando confirmação' && (
                                        <>
                                            <button className="btn accept" onClick={() => handleAccept(order.id)}>Aceitar</button>
                                            <button className="btn cancel" onClick={() => handleCancel(order.id)}>Cancelar</button>
                                        </>
                                    )}
                                    {(order.status === 'em preparo' || order.status === 'pronto para retirada') && (
                                        <button className="finalize-button" onClick={() => handleFinalize(order.id, order.deliveryMethod)}>Finalizar</button>
                                    )}
                                    {(order.status === 'pronto para retirada' || order.status === 'saiu para entrega' || order.status === 'completo') && (
                                        <button className="completed-status">Pedido já finalizado</button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderStaticProduct = (orderId: string) => (
        <div className="product-info" key={`static-product-${orderId}`}>
            <p className="details">Nome: Açaí Cupom Fidelidade</p>
            <p className="details">Quantidade: 1</p>
            <p className="details">Preço: R$ 0.00</p>
            <p className="details">Ingredientes: Açaí, leite condensado, granola, banana</p>
        </div>
    );

    const filteredOrders = orders.filter(order => {
        if (filter === 'Todos') return true;
        if (filter === 'Completo') return order.status === 'pronto para retirada' || order.status === 'saiu para entrega';
        if (filter === 'Cancelado') return order.status === 'Cancelado';
        if (filter === 'Aguardando') return order.status === 'Aguardando confirmação';
        return true;
    });

    return (
        <div className="admin-orders-container">
            <h1>Gerenciamento de pedidos</h1>
            <div className="filters">
                <button onClick={() => setFilter('Todos')} className={filter === 'Todos' ? 'active' : ''}>Todos</button>
                <button onClick={() => setFilter('Completo')} className={filter === 'Completo' ? 'active' : ''}>Completo</button>
                <button onClick={() => setFilter('Cancelado')} className={filter === 'Cancelado' ? 'active' : ''}>Cancelado</button>
                <button onClick={() => setFilter('Aguardando')} className={filter === 'Aguardando' ? 'active' : ''}>Aguardando</button>
            </div>
            <div className="order-cards-container">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <div className="order-card" key={order.id}>
                            <p className="status">Status: {order.status}</p>
                            <p>Cliente: {order.clientName}</p>
                            <p>Total: R$ {typeof order.total === 'number' ? order.total.toFixed(2) : 'N/A'}</p>
                            <p>Entrega: {order.deliveryMethod}</p>
                            <p>Endereço:
                                {deliveryMethod === "delivery"
                                    ? (order.deliveryAddress ? ` ${formatAddress(order.deliveryAddress)}` : "Endereço não disponível")
                                    : "O cliente optou por retirada"
                                }
                            </p>

                            <p>Taxa de Entrega: R$ {order.deliveryFee != null ? order.deliveryFee.toFixed(2) : 'N/A'}</p>
                            <p>Data do Pedido: {new Date(order.createdAt).toLocaleString()}</p>
                            {renderProductOrder(order)}
                            {renderCustomOrder(order)}
                            {order.couponId && renderStaticProduct(order.id)}
                        </div>
                    ))
                ) : (
                    <p>Nenhum pedido encontrado com o status selecionado.</p>
                )}
            </div>
        </div>
    );

};

export default AdminOrders;