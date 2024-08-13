import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './catalog.css';
import CustomOrder from './customOrder';
import { CartItem } from '../types/OrderCustom';

interface Product {
    id: string;
    name: string;
    description: string;
    ingredients: string;
    price: number;
    available: boolean;
}

const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/products');
                console.log('Produtos encontrados:', response.data);
                setProducts(response.data);
            } catch (error) {
                toast.error('Falha ao procurar produtos.');
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = (product: Product) => {
        const cartItem: CartItem = {
            type: 'product', 
            quantity: 1,
            id: product.id,
            name: product.name,
            ingredients: product.ingredients,
            price: product.price,
        };

        addToCart(cartItem);
        toast.success('Produto adicionado ao carrinho!');
    };


    return (
        <div className="catalog">
            <h1>Nossos produtos</h1>
            <div className="product-list">
                {Array.isArray(products) && products.map((product) => (
                    <div key={product.id} className="product-card">
                        <h2>{product.name}</h2>
                        <p>{product.ingredients}</p>
                        <p className="price">${product.price.toFixed(2)}</p>
                        <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.available}
                        >
                            {product.available ? 'Adicionar ao carrinho' : <span className="Sem estoque">Sem estoque</span>}
                        </button>
                    </div>
                ))}
            </div>

            <CustomOrder />
        </div>
    );
};

export default Catalog;
