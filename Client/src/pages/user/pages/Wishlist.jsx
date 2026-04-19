import React, { useState, useEffect } from 'react';
import ResortCard from "../../../components/ResortCard";
import { Heart } from 'lucide-react';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/users/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setWishlist(data.wishlist || []);
        }
      } catch (err) {
        console.error("Error fetching wishlist", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a' }}>My Wishlist</h2>
      
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading your favorite resorts...</p>
      ) : wishlist.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '24px'
        }}>
          {wishlist.map(resort => (
            <ResortCard key={resort._id} resort={resort} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Heart size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h2 style={{ marginTop: 0, marginBottom: '12px', color: '#0f172a' }}>Your Wishlist is Empty</h2>
          <p style={{ color: '#64748b', marginBottom: '24px', maxWidth: '400px' }}>Explore our luxurious resorts and add your favorites here to easily find them later.</p>
          <a href="/" style={{ 
            padding: '12px 24px', 
            background: '#f1f5f9', 
            color: '#4f46e5', 
            textDecoration: 'none',
            borderRadius: '12px', 
            fontWeight: '600',
            cursor: 'pointer',
          }}>
            Explore Resorts
          </a>
        </div>
      )}
    </div>
  );
}
