import React, { useState } from 'react';

export default function Security() {
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          currentPassword: passwords.currentPassword, 
          newPassword: passwords.newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Password updated successfully!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to update password' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a' }}>Security Settings</h2>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Update your password and secure your account.</p>
      
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
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Current Password</label>
          <input 
            type="password" 
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handleChange}
            placeholder="Enter current password" 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>New Password</label>
          <input 
            type="password" 
            name="newPassword"
            value={passwords.newPassword}
            onChange={handleChange}
            placeholder="Enter new password" 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
            required
            minLength={6}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#475569' }}>Confirm New Password</label>
          <input 
            type="password" 
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm new password" 
            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px' }} 
            required
            minLength={6}
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
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
