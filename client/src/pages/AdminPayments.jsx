import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaUndo } from 'react-icons/fa';
import api from '../utils/api';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [verifying, setVerifying] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

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

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>STUDENT</th>
              <th>CLASS</th>
              <th>TERM</th>
              <th>AMOUNT</th>
              <th>UTR</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id} className="clickable-row" onClick={() => setSelectedPayment(payment)} style={{ cursor: 'pointer' }}>
                <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                <td><span className="font-semibold">{payment.first_name} {payment.last_name}</span></td>
                <td>{payment.class_name} {payment.section}</td>
                <td>{payment.term_name}</td>
                <td><span className="font-semibold text-gray">₹{payment.amount}</span></td>
                <td style={{ fontFamily: 'monospace' }}>{payment.utr_number}</td>
                <td>
                  <span className={`badge ${
                    payment.status === 'VERIFIED' ? 'badge-success' : 
                    payment.status === 'REJECTED' ? 'badge-danger' : 
                    'badge-info'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {payment.status === 'SUBMITTED' && (
                      <>
                          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); setVerifying(payment.id); }}>
                            <FaCheckCircle /> Verify
                          </button>
                          <button className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); setRejecting(payment); }}>
                            <FaTimesCircle /> Reject
                          </button>
                      </>
                    )}
                    {payment.status === 'VERIFIED' && (
                      <button className="btn btn-warning" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px', background: '#f59e0b', color: '#fff', border: 'none' }} onClick={(e) => { e.stopPropagation(); setRejecting(payment); }}>
                        <FaUndo /> Revoke & Reject
                      </button>
                    )}
                    {payment.status === 'REJECTED' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <small className="text-danger d-block" style={{ fontWeight: '500' }}>Reason: {payment.rejection_reason}</small>
                        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); setVerifying(payment.id); }}>
                          <FaCheckCircle /> Override & Verify
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan="8" className="text-center" style={{ padding: '2rem' }}>No payments found.</td></tr>
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
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Confirm Verification</h3>
            <p style={{ marginTop: '10px', marginBottom: '20px' }}>Are you sure you want to verify this payment? The fee status will be marked as Paid.</p>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }} onClick={() => setVerifying(null)}>Cancel</button>
              <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer' }} onClick={handleVerify}>Verify Payment</button>
            </div>
          </div>
        </div>
      )}

      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', width: '500px', boxShadow: 'var(--shadow-2)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', color: 'var(--text-primary)' }}>Payment Details</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Student Name</p>
                    <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>{selectedPayment.first_name} {selectedPayment.last_name}</p>
                </div>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Class & Section</p>
                    <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>{selectedPayment.class_name} {selectedPayment.section}</p>
                </div>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Payment Date</p>
                    <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
                </div>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Term</p>
                    <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>{selectedPayment.term_name}</p>
                </div>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Amount</p>
                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary)', fontSize: '16px' }}>₹{selectedPayment.amount}</p>
                </div>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>UTR / Transaction ID</p>
                    <p style={{ margin: 0, fontWeight: '500', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{selectedPayment.utr_number}</p>
                </div>
                {selectedPayment.screenshot && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Payment Proof</p>
                        <a href={selectedPayment.screenshot} target="_blank" rel="noreferrer">
                            <img src={selectedPayment.screenshot} alt="Payment Screenshot" style={{ width: '100%', maxWidth: '300px', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'zoom-in' }} />
                        </a>
                    </div>
                )}
                <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</p>
                    <span className={`badge ${
                        selectedPayment.status === 'VERIFIED' ? 'badge-success' : 
                        selectedPayment.status === 'REJECTED' ? 'badge-danger' : 
                        'badge-info'
                    }`}>
                        {selectedPayment.status}
                    </span>
                    {selectedPayment.status === 'REJECTED' && (
                        <p style={{ margin: '8px 0 0 0', color: 'var(--danger)', fontSize: '14px' }}>
                            <strong>Rejection Reason:</strong> {selectedPayment.rejection_reason}
                        </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => setSelectedPayment(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
