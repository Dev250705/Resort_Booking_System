import React, { useState, useEffect } from 'react';
import { Edit2, User, Mail, Phone, Shield } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '', phone: '', role: 'user' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

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
          setFormData({ name: data.user.name, phone: data.user.phone });
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        body: JSON.stringify({ name: formData.name, phone: formData.phone })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Profile updated successfully!' });
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false); // Close edit mode on success
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'relative' }}>
      
      {/* Header with Edit Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#0f172a', fontSize: '28px', fontWeight: '700' }}>My Profile</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Manage your personal information and preferences.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => { setFormData({ name: user.name, phone: user.phone }); setIsEditing(true); setStatus({ type: '', message: '' }); }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', background: '#f8fafc', color: '#4f46e5', 
              border: '1px solid #e0e7ff', borderRadius: '12px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#e0e7ff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {status.message && (
        <div style={{ 
          padding: '14px 20px', 
          marginBottom: '24px', 
          borderRadius: '12px', 
          backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: status.type === 'success' ? '#166534' : '#991b1b',
          fontSize: '15px', fontWeight: '500',
          display: 'flex', alignItems: 'center'
        }}>
          {status.message}
        </div>
      )}

      {!isEditing ? (
        /* VIEW MODE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Avatar & Basic Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '32px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}>
              {getInitials(user.name)}
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '24px', color: '#0f172a' }}>{user.name || 'User'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '15px' }}>
                <Shield size={16} color="#8b5cf6" />
                <span style={{ textTransform: 'capitalize' }}>{user.role || 'Guest'} Account</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* Detail Card 1 */}
            <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '12px', color: '#4f46e5' }}>
                <User size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</p>
                <p style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '500' }}>{user.name || 'Not provided'}</p>
              </div>
            </div>

            {/* Detail Card 2 */}
            <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#dbeafe', borderRadius: '12px', color: '#2563eb' }}>
                <Mail size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</p>
                <p style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '500' }}>{user.email || 'Not provided'}</p>
              </div>
            </div>

            {/* Detail Card 3 */}
            <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ padding: '12px', background: '#fce7f3', borderRadius: '12px', color: '#db2777' }}>
                <Phone size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</p>
                <p style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '500' }}>{user.phone || 'Not provided'}</p>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* EDIT MODE */
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px', maxWidth: '600px', background: '#f8fafc', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <User size={18} />
              </div>
              <input 
                type="text" 
                name="name"
                value={formData.name || ''} 
                onChange={handleChange}
                style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', transition: 'border 0.2s', backgroundColor: '#fff' }} 
                required
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Email Address (Cannot be changed)</label>
            <div style={{ position: 'relative', opacity: 0.7 }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                value={user.email || ''} 
                disabled
                style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <Phone size={18} />
              </div>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone || ''} 
                onChange={handleChange}
                style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', transition: 'border 0.2s', backgroundColor: '#fff' }} 
                required
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 1,
                padding: '14px 24px', 
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Saving Changes...' : 'Save Profile'}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsEditing(false); setStatus({ type: '', message: '' }); }}
              style={{ 
                flex: 1,
                padding: '14px 24px', 
                background: 'transparent', 
                color: '#475569', 
                border: '1px solid #cbd5e1', 
                borderRadius: '12px', 
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
