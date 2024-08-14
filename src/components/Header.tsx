import React, { useState } from 'react';
import Cart from './Cart';
import { Link } from 'react-router-dom';
import "./header.css";
import logo from '../../public/logo2.png';
import { FaShoppingCart } from 'react-icons/fa';
import { RiCoupon2Line } from 'react-icons/ri';
import { CiSettings } from "react-icons/ci";
import { BiLogOut } from 'react-icons/bi';
import { IoHomeOutline } from "react-icons/io5";
import { useCart } from '../context/CartContext';
import { MdOutlineProductionQuantityLimits } from 'react-icons/md';

interface HeaderProps {
    handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleLogout }) => {
    const userRole = localStorage.getItem('userType');

    const [isCartOpen, setIsCartOpen] = useState(false);
    const { cart } = useCart();
    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <header className="header">
            <div className="logo">
                <img src={logo} alt="Tropical Açaí Logo" />
                <span>Tropical Açaí</span>
            </div>

            <nav>
                {userRole === 'ADMIN' ? (
                    <>
                        <Link to="/">
                            <IoHomeOutline />
                            <p className="none">Home</p>
                        </Link>
                        <Link to="/catalog">
                            <MdOutlineProductionQuantityLimits />
                            <p className="none">Produtos</p>
                        </Link>
                        <Link to="/admin/orders">
                            <RiCoupon2Line />
                            <p className="none">Gerenciamento</p>
                        </Link>
                        <Link to="/admin/settings">
                            <CiSettings />
                            <p className="none">Configuração</p>
                        </Link>
                        <button onClick={handleLogout}>
                            <BiLogOut />
                            <p className="none">Logout</p>
                        </button>
                        <button onClick={toggleCart} className="cart-button">
                            <FaShoppingCart />
                            {totalItems > 0 && <span className="cart-indicator">{totalItems}</span>}
                        </button>
                        {isCartOpen && <Cart isOpen={isCartOpen} toggleCart={toggleCart} />}
                    </>
                ) : (
                    <>
                        <Link to="/">
                            <IoHomeOutline />
                            <p className="none">Home</p>
                        </Link>
                        <Link to="/catalog">
                            <MdOutlineProductionQuantityLimits />
                            <p className="none">Produtos</p>
                        </Link>
                        <Link to="/orders">
                            <RiCoupon2Line />
                            <p className="none">Pedidos</p>
                        </Link>
                        <button onClick={handleLogout}>
                            <BiLogOut />
                            <p className="none">Logout</p>
                        </button>
                        <button onClick={toggleCart} className="cart-button">
                            <FaShoppingCart />
                            {totalItems > 0 && <span className="cart-indicator">{totalItems}</span>}
                        </button>
                        {isCartOpen && <Cart isOpen={isCartOpen} toggleCart={toggleCart} />}
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
