import React from 'react';
import "./styles.css";
import logo from '../../public/logo.png';

const Home: React.FC = () => {
    const userRole = localStorage.getItem('userType');

    const clientName = localStorage.getItem('clientName');

    return (
        <div className="home">
            <img src={logo} alt="Tropical Açaí Logo" />
            <h1>Bem-vindo(a) ao nosso catálogo, {clientName}!</h1>
            <h2>Peça o seu açaí com a <br /><strong>Tropical Açaí</strong></h2>
            <p>Descubra nossos produtos incríveis e faça seu pedido agora mesmo!</p>
            {userRole === 'ADMIN' ? (
                <a href="/admin/catalog" className="cta-button">
                    Explorar Produtos
                </a>
            ) : (
                <a href="/catalog" className="cta-button">
                    Explorar Produtos
                </a>
            )}
        </div>
    );
};

export default Home;
