import { useEffect } from 'react';
import { useLocation } from 'react-router';

const ScrollToTop = () => {
  // useLocation tracks the current URL
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' 
    });
  }, [pathname]);

  return null; 
};

export default ScrollToTop;