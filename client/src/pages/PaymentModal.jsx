import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
    if (!utr) return alert('Please enter UTR number');
    
    setLoading(true);
    try {
      const res = await api.post(`/fees/${fee.student_fee_id}/payment`, {
        utr_number: utr,
        amount: fee.amount
      });
      if (res.data.success) {
        alert('Payment submitted successfully for verification.');
        onSuccess();
      } else {
        alert(res.data.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting payment');
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
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-content" style={{ background: '#fff', padding: '30px', borderRadius: '12px', width: '450px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>{fee.term_name} Payment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p><strong>Student:</strong> {fee.student.name}</p>
          <p><strong>Amount:</strong> ₹{fee.amount}</p>
        </div>

        {!settings?.upi_id ? (
          <div className="alert alert-warning">
            The school has not configured a UPI ID for payments yet. Please contact the administrator.
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px' }}>Scan & Pay</h3>
            <div style={{ background: '#fff', display: 'inline-block', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}>
              <QRCodeSVG value={generateUPIString()} size={200} />
            </div>
            <p style={{ marginTop: '15px', color: '#666' }}>School UPI: {settings.upi_id}</p>
            {settings.instructions && (
              <p style={{ marginTop: '10px', fontSize: '14px', fontStyle: 'italic' }}>{settings.instructions}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>UPI Transaction ID / UTR *</label>
            <input 
              type="text" 
              className="form-control" 
              value={utr}
              onChange={e => setUtr(e.target.value)}
              placeholder="Enter 12-digit UTR number"
              required
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '16px' }}
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
