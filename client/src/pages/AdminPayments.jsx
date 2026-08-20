import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/fees/payments');
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifying) return;
    try {
      const res = await api.put(`/fees/payments/${verifying}/verify`);
      if (res.data.success) {
        toast.success('Payment verified successfully');
        setVerifying(null);
        fetchPayments();
      }
    } catch (error) {
      console.error('Error verifying payment', error);
      toast.error('Error verifying payment');
      setVerifying(null);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) {
      toast.error('Reason is required');
      return;
    }
    try {
      const res = await api.put(`/fees/payments/${rejecting.id}/reject`, { reason: rejectReason });
      if (res.data.success) {
        toast.success('Payment rejected');
        setRejecting(null);
        setRejectReason('');
        fetchPayments();
      }
    } catch (error) {
      console.error('Error rejecting payment', error);
      toast.error('Error rejecting payment');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payment Verification</h1>
      </div>

      <div className="card">
        <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '10px' }}>Date</th>
              <th style={{ padding: '10px' }}>Student</th>
              <th style={{ padding: '10px' }}>Class</th>
              <th style={{ padding: '10px' }}>Term</th>
              <th style={{ padding: '10px' }}>Amount</th>
              <th style={{ padding: '10px' }}>UTR</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>{payment.first_name} {payment.last_name}</td>
                <td style={{ padding: '10px' }}>{payment.class_name} {payment.section}</td>
                <td style={{ padding: '10px' }}>{payment.term_name}</td>
                <td style={{ padding: '10px' }}>₹{payment.amount}</td>
                <td style={{ padding: '10px' }}>{payment.utr_number}</td>
                <td style={{ padding: '10px' }}>
                  <span className={`badge ${
                    payment.status === 'VERIFIED' ? 'badge-success' : 
                    payment.status === 'REJECTED' ? 'badge-danger' : 
                    'badge-info'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  {payment.status === 'SUBMITTED' && (
                    <>
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '4px 8px', marginRight: '5px' }} onClick={() => setVerifying(payment.id)}>Verify</button>
                        <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '4px 8px' }} onClick={() => setRejecting(payment)}>Reject</button>
                    </>
                  )}
                  {payment.status === 'REJECTED' && <small className="text-danger d-block">{payment.rejection_reason}</small>}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No payments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {rejecting && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h2>Reject Payment</h2>
            <form onSubmit={handleReject}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Rejection Reason *</label>
                <textarea 
                  className="form-control" 
                  value={rejectReason} 
                  onChange={e => setRejectReason(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px' }} 
                  rows="3"
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setRejecting(null); setRejectReason(''); }}>Cancel</button>
                <button type="submit" className="btn btn-danger">Reject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {verifying && (
        <div className="modal-overlay" onClick={() => setVerifying(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Confirm Verification</h3>
            <p style={{ marginTop: '10px', marginBottom: '20px' }}>Are you sure you want to verify this payment? The fee status will be marked as Paid.</p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }} onClick={() => setVerifying(null)}>Cancel</button>
              <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer' }} onClick={handleVerify}>Verify Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
