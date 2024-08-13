import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';
import type { Cream, Fruit, Size, Topping, CustomOrder, CartItem } from '../types/OrderCustom';
import "./customOrder.css";

const CustomOrder: React.FC = () => {
    const [sizes, setSizes] = useState<Size[]>([]);
    const [creams, setCreams] = useState<Cream[]>([]);
    const [fruits, setFruits] = useState<Fruit[]>([]);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [selectedSize, setSelectedSize] = useState<Size | null>(null);
    const [selectedCream, setSelectedCream] = useState<Cream | null>(null);
    const [selectedFruits, setSelectedFruits] = useState<Fruit[]>([]);
    const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sizesResponse, creamsResponse, fruitsResponse, toppingsResponse] = await Promise.all([
                    axios.get('http://localhost:3000/api/sizes'),
                    axios.get('http://localhost:3000/api/creams'),
                    axios.get('http://localhost:3000/api/fruits'),
                    axios.get('http://localhost:3000/api/toppings')
                ]);

                setSizes(sizesResponse.data);
                setCreams(creamsResponse.data);
                setFruits(fruitsResponse.data);
                setToppings(toppingsResponse.data);
            } catch (error) {
                toast.error('Falha ao carregar dados.');
            }
        };

        fetchData();
    }, []);

    const calculateTotal = (): number => {
        const sizePrice = selectedSize?.price || 0;
        const creamPrice = selectedCream?.price || 0;
        const fruitsPrice = selectedFruits.reduce((total, fruit) => total + (fruit.price || 0), 0);
        const toppingsPrice = selectedToppings.reduce((total, topping) => total + (topping.price || 0), 0);

        return sizePrice + creamPrice + fruitsPrice + toppingsPrice;
    };

    const generateId = (): string => {
        return uuidv4().replace(/-/g, '');
    };

    const handleAddToCart = () => {
        if (!selectedSize || !selectedCream) {
            toast.error('Por favor, selecione todos os itens necessários.');
            return;
        }

        const customOrder: CustomOrder = {
            size: selectedSize,
            cream: selectedCream,
            fruits: selectedFruits,
            toppings: selectedToppings,
            total: calculateTotal(),
        };

        const cartItem: CartItem = {
            id: generateId(),
            name: 'Montado',
            price: customOrder.total,
            quantity: 1,
            customOrder: customOrder,
            type: 'custom',
        };

        addToCart(cartItem);
        toast.success('Produto personalizado adicionado ao carrinho!');
    };

    const freeToppings = toppings.filter(topping => topping.price === 0);
    const paidToppings = toppings.filter(topping => topping.price > 0);

    return (
        <div className="containerTeste">
            <h1 className="heading">Personalize seu Açaí</h1>

            <div className="section">
                <h2>Tamanhos</h2>
                {sizes.length > 0 ? sizes.map(size => (
                    <label key={size.id} className="label">
                        <input
                            type="radio"
                            name="size"
                            value={size.id}
                            checked={selectedSize?.id === size.id}
                            onChange={() => setSelectedSize(size)}
                        />
                        {size.name} {size.volume}ml - R${size.price.toFixed(2)}
                    </label>
                )) : <p className="loading">Carregando tamanhos...</p>}
            </div>

            <div className="section">
                <h2>Creme</h2>
                {creams.length > 0 ? creams.map(cream => (
                    <label key={cream.id} className="label">
                        <input
                            type="radio"
                            name="cream"
                            value={cream.id}
                            checked={selectedCream?.id === cream.id}
                            onChange={() => setSelectedCream(cream)}
                        />
                        {cream.name} - R${cream.price.toFixed(2)}
                    </label>
                )) : <p className="loading">Carregando cremes...</p>}
            </div>

            <div className="section">
                <h2>Frutas</h2>
                {fruits.length > 0 ? fruits.map(fruit => (
                    <label key={fruit.id} className="label">
                        <input
                            type="checkbox"
                            value={fruit.id}
                            checked={selectedFruits.some(f => f.id === fruit.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedFruits([...selectedFruits, fruit]);
                                } else {
                                    setSelectedFruits(selectedFruits.filter(f => f.id !== fruit.id));
                                }
                            }}
                        />
                        {fruit.name} - R${fruit.price.toFixed(2)}
                    </label>
                )) : <p className="loading">Carregando frutas...</p>}
            </div>

            <div className="section">
                <h2>Adicionais</h2>
                <h3 className="label">Grátis</h3>
                {freeToppings.length > 0 ? freeToppings.map(topping => (
                    <label key={topping.id} className="label">
                        <input
                            type="checkbox"
                            value={topping.id}
                            checked={selectedToppings.some(t => t.id === topping.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedToppings([...selectedToppings, topping]);
                                } else {
                                    setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
                                }
                            }}
                        />
                        {topping.name} - Grátis
                    </label>
                )) : <p className="loading">Nenhum adicional grátis disponível</p>}

                <h3  className="label">Pagos</h3>
                {paidToppings.length > 0 ? paidToppings.map(topping => (
                    <label key={topping.id} className="label">
                        <input
                            type="checkbox"
                            value={topping.id}
                            checked={selectedToppings.some(t => t.id === topping.id)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedToppings([...selectedToppings, topping]);
                                } else {
                                    setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
                                }
                            }}
                        />
                        {topping.name} - R${topping.price.toFixed(2)}
                    </label>
                )) : <p className="loading">Carregando adicionais pagos...</p>}
            </div>

            <div className="section">
                <h2 className="total">Total: R${calculateTotal().toFixed(2)}</h2>
                <button className="button" onClick={handleAddToCart}>Adicionar ao Carrinho</button>
            </div>
        </div>
    );
};

export default CustomOrder;