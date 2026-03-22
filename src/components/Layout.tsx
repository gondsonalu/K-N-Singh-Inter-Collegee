import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAdmin) return null;

  const isDarkBg = isHome && !scrolled && !isOpen;
  const navClass = isDarkBg ? 'bg-transparent py-4' : 'glass py-2';
  const textColor = isDarkBg ? 'text-white' : 'text-slate-700';
  const logoColor = isDarkBg ? 'text-white' : 'text-primary';
  const subLogoColor = isDarkBg ? 'text-white/80' : 'text-secondary';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Academics', path: '/academics' },
    { name: 'Admissions', path: '/admissions' },
    { name: 'Faculty', path: '/faculty' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Notices', path: '/notices' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className={`h-10 w-10 ${logoColor}`} />
            <div className="flex flex-col">
              <span className={`text-xl font-bold leading-none ${logoColor}`}>K N Singh</span>
              <span className={`text-xs font-medium ${subLogoColor}`}>Inter College</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-secondary ${
                  location.pathname === link.path 
                    ? 'text-secondary' 
                    : textColor
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={logoColor}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-2xl mt-2 rounded-b-3xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-8 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-base font-bold rounded-xl transition-all ${
                    location.pathname === link.path
                      ? 'bg-primary text-white'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus({ type: 'loading', message: 'Subscribing...' });
    try {
      await api.post('/api/subscriptions', { email });
      setStatus({ type: 'success', message: 'Subscribed successfully!' });
      setEmail('');
    } catch (err: unknown) {
      const error = err as Error;
      setStatus({ type: 'error', message: error.message || 'Subscription failed.' });
    }
  };

  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-secondary" />
              <span className="text-xl font-bold">K N Singh Inter College</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering students with knowledge and values since our inception. Affiliated with the UP Board, we strive for excellence in education.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-secondary" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-secondary" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-secondary" />
              <Youtube className="h-5 w-5 cursor-pointer hover:text-secondary" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/academics" className="hover:text-white">Academics</Link></li>
              <li><Link to="/admissions" className="hover:text-white">Admissions</Link></li>
              <li><Link to="/faculty" className="hover:text-white">Our Faculty</Link></li>
              <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Contact Info</h3>
            <ul className="space-y-4 text-slate-400 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-secondary flex-shrink-0" />
                <span>Masuriyapur, Nainijor, Azamgarh, Uttar Pradesh, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-secondary flex-shrink-0" />
                <span>info@knsinghintercollege.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Newsletter</h3>
            <p className="text-slate-400 text-sm mb-4">Subscribe to get the latest updates and notices.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
                <button 
                  type="submit"
                  className="bg-secondary px-4 py-2 rounded-r-md text-sm font-bold hover:bg-opacity-90 transition-all"
                >
                  Join
                </button>
              </div>
              {status.message && (
                <p className={`text-[10px] font-bold uppercase tracking-widest ${status.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} K N Singh Inter College. All rights reserved.</p>
          <p className="mt-2">Affiliated with UP Board | Masuriyapur, Azamgarh</p>
        </div>
      </div>
    </footer>
  );
};
