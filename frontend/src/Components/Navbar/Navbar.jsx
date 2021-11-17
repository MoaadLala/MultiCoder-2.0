import { Link } from 'react-router-dom';
import './Navbar.css';
import { useState } from 'react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const changeMenuState = () => {
        const hamBtn = document.querySelector('.hamBtn');
        const mobileMenu = document.querySelector('.mobileMenu');
        const mobileNav = document.querySelector('.mobileNav');
        if (isMenuOpen) {
            hamBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenu.style.display = 'none';
            setIsMenuOpen(false);
            mobileNav.style.boxShadow = 'rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset';
        } else {
            hamBtn.innerHTML = '<i class="fas fa-times"></i>';
            mobileMenu.style.display = 'block';
            mobileNav.style.boxShadow = 'none';
            setIsMenuOpen(true);
        }
    }

    return (
        <>
            <nav>
                <div className="leftSide">
                    <h3 className="navBrand">Multi<span>Coder</span></h3>
                    <Link to="/">Home</Link>
                    <Link to="/">About</Link>
                    <Link to="play">Play</Link>
                </div>
                <div className="rightSide">
                    <button class="flatBtn">Sign Up</button>
                </div>
                <div className="mobileNav">
                    <h3 className="navBrand">Multi<span>Coder</span></h3>
                    <button className="hamBtn" onClick={changeMenuState}><i class="fas fa-bars"></i></button>
                </div>
            </nav>
            <div className="mobileMenu">
                <Link to="/">
                    <div className="mobileMenuItem">Home</div>
                </Link>
                <div className="mobileMenuItem">About</div>
                <Link to="play">
                    <div className="mobileMenuItem">Play</div>
                </Link>
                <button class="flatBtn">Sign Up</button>
            </div>
        </>
    )
}