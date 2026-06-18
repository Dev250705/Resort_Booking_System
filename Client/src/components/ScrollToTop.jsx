import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
  
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' 
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 150);

    return () => clearTimeout(timer); 
  }, [pathname]);

  return null;
}
