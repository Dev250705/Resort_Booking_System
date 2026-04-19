import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.user) {
          setUser(data.user);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: user.name, phone: user.phone })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Profile updated successfully!' });
        sessionStorage.setItem('user', JSON.stringify({ ...user, ...data.user }));
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a' }}>My Profile</h2>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Manage your personal information and preferences.</p>
      
      {status.message && (
        <div style={{ 
          padding: '12px 16px', 
          marginBottom: '24px', 
          borderRadius: '8px', 
          backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: status.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '14px'
        }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Full Name</label>
          <input 
            type="text" 
            name="name"
            value={user.name || ''} 
            onChange={handleChange}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Email Address</label>
          <input 
            type="email" 
            value={user.email || ''} 
            disabled
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#f8fafc', color: '#94a3b8' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Phone Number</label>
          <input 
            type="tel" 
            name="phone"
            value={user.phone || ''} 
            onChange={handleChange}
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '12px', 
            padding: '12px 24px', 
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: 'fit-content'
        }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
