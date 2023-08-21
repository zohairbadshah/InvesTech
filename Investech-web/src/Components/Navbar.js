import React,{useState} from 'react'
import {Link} from 'react-router-dom'
import '../Styles/navbar.css'
function Navbar() {
  const [activeLink, setActiveLink] = useState('/');
  const handleLinkClick = (to) => {
    setActiveLink(to);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-title">InvesTech</div>
    <ul>
      <li>
        <Link to="/" onClick={() => handleLinkClick('/')} className={activeLink === '/' ? 'clicked' : ''}>Home</Link>
      </li>
      <li>
        <Link to="/news" onClick={() => handleLinkClick('/news')} className={activeLink === '/news' ? 'clicked' : ''} >News</Link>
      </li>
      <li>
        <Link to="/stocks" onClick={() => handleLinkClick('/stocks')} className={activeLink === '/stocks' ? 'clicked' : ''}>Stocks</Link>
      </li>
      {/* Add more sidebar links as needed */}
      <hr style={{color:'white',marginTop:'200px'}}/>
      <li>
        <Link to="/about" onClick={() => handleLinkClick('/about')} className={activeLink === '/about' ? 'clicked' : ''}>About</Link>
      </li>
      <li>
        <Link to="/contact" onClick={() => handleLinkClick('/contact')} className={activeLink === '/contact' ? 'clicked' : ''}>Contact</Link>
      </li>
    </ul>
  </div>
  )
}

export default Navbar