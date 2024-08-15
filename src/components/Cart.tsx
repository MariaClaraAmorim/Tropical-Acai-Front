import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from 'react-icons/ai';
import './cart.css';
import { fetchOrderCount } from '../api/order';
import { OrderCountResponse } from '../types/Order';
import logo from '../../public/logo2.png';
import { MdDeleteOutline } from 'react-icons/md';
import axios from 'axios';

const Cart: React.FC<{ isOpen: boolean; toggleCart: () => void }> = ({ isOpen, toggleCart }) => {
    const { cart, removeFromCart, clearCart, incrementQuantity, decrementQuantity } = useCart();
    const [couponCode, setCouponCode] = useState<string>('');
    const [isCouponApplied, setIsCouponApplied] = useState<boolean>(false);
    const [canApplyCoupon, setCanApplyCoupon] = useState<boolean>(false);
    const [cep, setCep] = useState<string>('');
    const [address, setAddress] = useState<any>(null);
    const [numero, setNumero] = useState<string>('');
    const [deliveryFee, setDeliveryFee] = useState<number>(0);
    const [deliveryMethod, setDeliveryMethod] = useState<'retirada' | 'delivery'>('retirada');
    const [totalWithFee, setTotalWithFee] = useState<number>(0);
    const navigate = useNavigate();
    const clientId = localStorage.getItem('clientId') || '';

    useEffect(() => {
        const checkOrderCount = async () => {
            if (clientId) {
                try {
                    const response = await fetchOrderCount(clientId);
                    console.log('Order count response:', response);

                    // Total de pedidos completados
                    const totalCompletedOrders = response.total;
                    const nextOrderNumber = totalCompletedOrders + 1;

                    // Verifica se o próximo pedido é elegível para usar o cupom (11°, 21°, 31°, etc.)
                    const isEligibleForCoupon = totalCompletedOrders > 0 && nextOrderNumber % 10 === 1;

                    setCanApplyCoupon(isEligibleForCoupon);
                } catch (error) {
                    console.error('Erro ao buscar contagem de pedidos:', error);
                    toast.error('Erro ao verificar contagem de pedidos');
                }
            }
        };

        checkOrderCount();
    }, [clientId]);

    useEffect(() => {
        setTotalWithFee(parseFloat((cart.totalAmount + deliveryFee).toFixed(2)));
    }, [deliveryFee, cart.totalAmount]);

    const handleCheckout = async () => {
        if (!clientId) {
            toast.error('Usuário não está logado');
            navigate('/login');
            return;
        }

        if (deliveryMethod === 'delivery' && !address) {
            toast.error('Por favor, insira o endereço para entrega.');
            return;
        }

        if (deliveryMethod === 'delivery' && !numero) {
            toast.error('Por favor, insira o número da casa.');
            return;
        }

        const totalAmountRounded = parseFloat(cart.totalAmount.toFixed(2));
        const clientName = localStorage.getItem('clientName') || 'Cliente Anônimo'; // Obtendo o nome do cliente

        // Separar itens normais dos personalizados
        const customOrders = cart.items.filter(item => item.customOrder);
        const normalOrders = cart.items.filter(item => !item.customOrder);

        let orderData: any = {
            clientId,
            clientName, // Adiciona o nome do cliente ao pedido
            deliveryMethod: deliveryMethod,
            deliveryAddress: deliveryMethod === 'delivery' ? {
                cep: address.cep.replace('-', ''),
                logradouro: address.logradouro,
                complemento: address.complemento || '',
                numero: numero,
                bairro: address.bairro,
                localidade: address.localidade,
                uf: address.uf,
            } : undefined,
            total: totalAmountRounded,
            couponCode: isCouponApplied ? couponCode : undefined,
        };

        // Adicionar itens normais ao pedido
        if (normalOrders.length > 0) {
            orderData.products = normalOrders.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price
            }));
        }

        // Adicionar detalhes personalizados ao pedido
        if (customOrders.length > 0) {
            const customOrder = customOrders[0]; // Assumindo que há um único pedido personalizado por vez

            orderData.size = customOrder.customOrder?.size ? {
                id: customOrder.customOrder.size.id,
                name: customOrder.customOrder.size.name,
                volume: customOrder.customOrder.size.volume,
                price: customOrder.customOrder.size.price
            } : undefined;

            orderData.cream = customOrder.customOrder?.cream ? {
                id: customOrder.customOrder.cream.id,
                name: customOrder.customOrder.cream.name,
                price: customOrder.customOrder.cream.price
            } : undefined;

            orderData.fruits = customOrder.customOrder?.fruits?.map(fruit => ({
                id: fruit.id,
                name: fruit.name,
                price: fruit.price
            })) || [];

            orderData.toppings = customOrder.customOrder?.toppings?.map(topping => ({
                id: topping.id,
                name: topping.name,
                price: topping.price,
                isFree: topping.isFree || false
            })) || [];
        }

        console.log('Order Data:', orderData);

        try {
            const response = await axios.post('https://tropical-acai-back.onrender.com/api/orders', orderData);
            console.log('Pedido realizado com sucesso:', response.data);
            toast.success('Pedido realizado com sucesso!');
            clearCart();
            toggleCart();
        } catch (error) {
            console.error('Erro ao realizar o pedido:', error);
            toast.error('Erro ao realizar o pedido');
        }
    };

    const handleApplyCoupon = async () => {
        if (canApplyCoupon) {
            try {
                const response = await fetch('https://tropical-acai-back.onrender.com/api/cupom/apply', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: couponCode, clientId }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Erro ao aplicar cupom:', errorData);

                    if (errorData.error === 'Invalid coupon code') {
                        toast.error('Código de cupom inválido.');
                    } else if (errorData.error === 'O cupom só pode ser resgatado em múltiplos de 10 pedidos, com pelo menos 10 pedidos') {
                        toast.info('Você precisa ter pelo menos 10 pedidos e o número de pedidos precisa ser múltiplo de 10 para usar este cupom.');
                    } else {
                        toast.error('Erro ao aplicar o cupom.');
                    }
                    throw new Error(errorData.error || 'Erro ao aplicar o cupom');
                }

                const result = await response.json();
                if (result.success) {
                    setIsCouponApplied(true);
                    toast.success('Cupom aplicado com sucesso!');
                } else {
                    toast.error('Não foi possível aplicar o cupom.');
                }
            } catch (error: any) {
                console.error('Erro:', error);
                toast.error(error.message);
            }
        } else {
            toast.error('Você não atende aos requisitos para aplicar este cupom.');
        }
    };

    console.log('Coupon Code:', couponCode);
    console.log('Is Coupon Applied:', isCouponApplied);


    useEffect(() => {
        console.log('Can apply coupon:', canApplyCoupon);
    }, [canApplyCoupon]);

    const handleRemoveCoupon = () => {
        setIsCouponApplied(false);
        setCouponCode('');
        toast.info('Cupom removido.');
    };

    const handleCepSearch = async () => {
        if (cep.trim() === '') {
            toast.error('Por favor, insira um CEP válido.');
            return;
        }

        try {
            const addressResponse = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
            if (!addressResponse.ok) {
                throw new Error('Erro ao buscar informações do CEP');
            }
            const addressData = await addressResponse.json();
            if (!addressData || !addressData.address || !addressData.district || !addressData.city || !addressData.state) {
                throw new Error('CEP não encontrado ou dados incompletos');
            }

            setAddress({
                cep: addressData.cep,
                logradouro: addressData.address,
                complemento: addressData.complemento || '',
                bairro: addressData.district,
                localidade: addressData.city,
                uf: addressData.state,
            });

            const feeResponse = await fetch(`https://tropical-acai-back.onrender.com/api/orders/delivery-fee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cep }),
            });

            if (!feeResponse.ok) {
                throw new Error('Erro ao buscar taxa de entrega');
            }

            const feeData = await feeResponse.json();
            setDeliveryFee(feeData.fee);

            toast.success(`Endereço encontrado! Taxa de entrega aplicada`);
        } catch (error: any) {
            console.error('Erro:', error);
            toast.error(error.message);
        }
    };

    return (

        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <button className="close-btn" onClick={toggleCart}>X</button>
            <h2>Carrinho</h2>
            {cart.items.length === 0 ? (
                <p>Ops, seu carrinho está vazio! Vamos enche-lo com um açaí delicioso?</p>
            ) : (
                <>
                    <ul className="cart-items">
                        {cart.items.map(item => (

                            <>
                                <li key={item.id} className="cart-item">
                                    <span>{item.name}</span>
                                    <span>R$ {item.price.toFixed(2)}</span>

                                    <div className="quantity-controls">
                                        <button onClick={() => decrementQuantity(item.id)}><AiOutlineMinus /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => incrementQuantity(item.id)}><AiOutlinePlus /></button>
                                    </div>

                                    <button onClick={() => removeFromCart(item.id)}><AiOutlineDelete /></button>
                                </li>
                                {item.customOrder ? (
                                    <div className="item-details">
                                        <p><strong>Tamanho:</strong> {item.customOrder.size.name}</p>
                                        <p><strong>Creme:</strong> {item.customOrder.cream.name}</p>
                                        <p><strong>Frutas:</strong> {item.customOrder.fruits.map(fruit => fruit.name).join(', ')}</p>
                                        <p><strong>Adicionais:</strong> {item.customOrder.toppings.map(topping => topping.name).join(', ')}</p>
                                    </div>
                                ) : (
                                    <div className="item-details">
                                        <p>Quantidade: {item.quantity}</p>
                                    </div>
                                )}

                            </>
                        ))}
                    </ul>
                    <div className="cart-summary">
                        <p>Total dos produtos: R$ {cart.totalAmount.toFixed(2)}</p>
                        <p>Taxa de entrega: R$ {deliveryFee.toFixed(2)}</p>
                        <p>Total com taxa: R$ {totalWithFee.toFixed(2)}</p>
                        {isCouponApplied && <p>Cupom de fidelidade aplicado: {couponCode}</p>}
                    </div>

                    <div className="delivery-method">
                        <label>
                            <input
                                type="radio"
                                value="retirada"
                                checked={deliveryMethod === 'retirada'}
                                onChange={() => setDeliveryMethod('retirada')}
                            />
                            Retirada no local
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="delivery"
                                checked={deliveryMethod === 'delivery'}
                                onChange={() => setDeliveryMethod('delivery')}
                            />
                            Entrega
                        </label>
                    </div>

                    {deliveryMethod === "delivery" && (
                        <>
                            {address ? (
                                <div className="cart-summary">
                                    <h3>Endereço</h3>
                                    <p>{address.logradouro}, {address.bairro}, N° {numero}</p>
                                    <p>{address.localidade} - {address.uf}</p>
                                </div>
                            ) : (
                                <div className="cep-search">
                                    <input
                                        type="text"
                                        placeholder="Digite seu CEP"
                                        value={cep}
                                        onChange={(e) => setCep(e.target.value)}
                                    />

                                    <input
                                        type="text"
                                        placeholder="Número"
                                        value={numero}
                                        onChange={(e) => setNumero(e.target.value)}
                                    />

                                    <button
                                        onClick={handleCepSearch}
                                        style={{
                                            backgroundColor: 'var(--primary-color)',
                                            color: 'var(--secondary-color)',
                                            padding: '5px',
                                            fontSize: '18px',
                                        }}
                                    >
                                        Buscar
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {canApplyCoupon && (
                        <div className="container">
                            <div className="card">
                                <div className="co-img">
                                    <img src={logo} alt="Tropical Açaí Logo" />
                                </div>
                                <div className="cupom">
                                    <input
                                        type="text"
                                        placeholder="Código do cupom"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                    />
                                    <button
                                        style={{
                                            backgroundColor: 'var(--primary-color)',
                                            color: 'var(--secondary-color)',
                                            padding: '5px',
                                        }}
                                        onClick={handleApplyCoupon}
                                    >
                                        Aplicar Cupom
                                    </button>
                                    {isCouponApplied && (
                                        <button
                                            style={{
                                                backgroundColor: 'var(--accent-color)',
                                                color: 'var(--secondary-color)',
                                                padding: '5px',
                                            }}
                                            onClick={handleRemoveCoupon}
                                        >
                                            <MdDeleteOutline />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        style={{
                            backgroundColor: 'var(--background-color)',
                            justifyContent: 'center',
                            marginTop: '10px',
                            color: 'var(--secondary-color)',
                            padding: '10px',
                        }}
                        onClick={handleCheckout}
                        disabled={cart.items.length === 0}
                    >
                        Finalizar Pedido
                    </button>
                </>
            )}
        </div>
    );
};

export default Cart;
