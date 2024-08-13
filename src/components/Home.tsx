import React from 'react';
import "./styles.css";
import logo from '../../public/logo.png';

const Home: React.FC = () => {
    return (
        <div className="home">
            <img src={logo} alt="Tropical Açaí Logo" />
            <h1>Bem-vindo (a) ao nosso catálogo!</h1>
            <h2>Peça o seu açaí com a <br /><strong>Tropical Açaí</strong></h2>
            <p>Descubra nossos produtos incríveis e faça seu pedido agora mesmo!</p>
            <a href="/catalog" className="cta-button">
                Explorar Produtos
            </a>
        </div>
    );
};

export default Home;
