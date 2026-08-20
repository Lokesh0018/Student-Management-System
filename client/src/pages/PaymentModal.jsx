import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PaymentModal = ({ fee, onClose, onSuccess }) => {
  const [settings, setSettings] = useState(null);
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/fees/settings');
      if (res.data.success && res.data.data) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr) {
      toast.error('Please enter UTR number');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post(`/fees/${fee.student_fee_id}/payment`, {
        utr_number: utr,
        amount: fee.amount
      });
      if (res.data.success) {
        toast.success('Payment submitted successfully for verification.');
        onSuccess();
      } else {
        toast.error(res.data.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error submitting payment');
    } finally {
      setLoading(false);
    }
  };

  const generateUPIString = () => {
    if (!settings?.upi_id) return '';
    // Format: upi://pay?pa=upiId&pn=PayeeName&am=Amount&cu=INR
    const upiId = encodeURIComponent(settings.upi_id);
    const payee = encodeURIComponent(settings.payee_name || 'School');
    return `upi://pay?pa=${upiId}&pn=${payee}&am=${fee.amount}&cu=INR`;
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: '400px', maxWidth: '100%', maxHeight: '95vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{fee.term_name} Payment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 5px' }}>&times;</button>
        </div>

        <div style={{ marginBottom: '15px', background: '#f8f9fa', padding: '10px', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}><strong>Student:</strong> {fee.student.name}</p>
          <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Amount:</strong> ₹{fee.amount}</p>
        </div>

        {!settings?.upi_id ? (
          <div className="alert alert-warning" style={{ fontSize: '0.9rem', padding: '10px' }}>
            The school has not configured a UPI ID for payments yet. Please contact the administrator.
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Scan & Pay</h3>
            <div style={{ background: '#fff', display: 'inline-block', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <QRCodeSVG value={generateUPIString()} size={150} />
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '0.9rem' }}>UPI ID: <strong>{settings.upi_id}</strong></p>
            {settings.instructions && (
              <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', fontStyle: 'italic' }}>{settings.instructions}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>UPI Transaction ID / UTR *</label>
            <input 
              type="text" 
              className="form-control" 
              value={utr}
              onChange={e => setUtr(e.target.value)}
              placeholder="Enter 12-digit UTR number"
              required
              style={{ width: '100%', padding: '10px', fontSize: '0.9rem', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '6px' }}
            disabled={loading || !settings?.upi_id}
          >
            {loading ? 'Submitting...' : "I've Completed Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
