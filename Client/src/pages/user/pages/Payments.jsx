import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/payments/my-payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error("Error fetching payments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Success': return <CheckCircle2 size={16} color="#16a34a" />;
      case 'Failed': return <XCircle size={16} color="#dc2626" />;
      default: return <Clock size={16} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success': return { bg: '#dcfce7', text: '#166534' };
      case 'Failed': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#fef3c7', text: '#92400e' };
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a' }}>Payment History</h2>
      
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading your payment history...</p>
      ) : payments.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                <th style={{ padding: '16px 8px', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '16px 8px', fontWeight: '600' }}>Resort</th>
                <th style={{ padding: '16px 8px', fontWeight: '600' }}>Transaction ID</th>
                <th style={{ padding: '16px 8px', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '16px 8px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                const statusColors = getStatusColor(payment.status);
                return (
                  <tr key={payment._id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                    <td style={{ padding: '16px 8px', color: '#475569' }}>
                      {new Date(payment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 8px', color: '#0f172a', fontWeight: '500' }}>
                      {payment.booking?.resort?.name || 'Resort Stay'}
                    </td>
                    <td style={{ padding: '16px 8px', color: '#64748b', fontFamily: 'monospace' }}>
                      {payment.razorpay_payment_id || payment.razorpay_order_id}
                    </td>
                    <td style={{ padding: '16px 8px', color: '#0f172a', fontWeight: '600' }}>
                      ₹{payment.amount?.toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', borderRadius: '16px' }}>
          <CreditCard size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#0f172a' }}>No Payment History</h3>
          <p style={{ color: '#64748b', marginBottom: '24px', maxWidth: '400px' }}>Your past transactions and payment records will appear here.</p>
        </div>
      )}
    </div>
  );
}
