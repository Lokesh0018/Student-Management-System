import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PaymentModal = ({ fee, onClose, onSuccess }) => {
  const [settings, setSettings] = useState(null);
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchSettings();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const toastId = toast.loading('Uploading screenshot...');
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setScreenshot(res.data.url);
        toast.success('Screenshot uploaded successfully!', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload screenshot');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utr && !screenshot) {
      toast.error('Please provide a UTR number or upload a screenshot');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post(`/fees/${fee.student_fee_id}/payment`, {
        utr_number: utr,
        amount: fee.amount,
        screenshot: screenshot
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

  return createPortal(
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div className="modal-content" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', width: '550px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '20px 20px 15px 20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{fee.term_name} Payment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0 5px', lineHeight: 1, color: 'var(--text-primary)' }}>&times;</button>
        </div>

        <div style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
          <div style={{ 
            display: 'flex', 
            width: '200%', 
            transform: `translateX(${step === 1 ? '0%' : '-50%'})`, 
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}>
            {/* Step 1: QR Code & Info */}
            <div style={{ width: '50%', flexShrink: 0, padding: '20px' }}>
              <div style={{ marginBottom: '15px', background: 'var(--bg)', padding: '10px', borderRadius: '6px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}><strong>Student:</strong> {fee.student.name}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}><strong>Amount:</strong> ₹{fee.amount}</p>
              </div>

              {!settings?.upi_id ? (
                <div className="alert alert-warning" style={{ fontSize: '0.9rem', padding: '10px' }}>
                  The school has not configured a UPI ID for payments yet. Please contact the administrator.
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginBottom: '20px', padding: '20px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>Scan & Pay</h3>
                  <div style={{ background: 'white', display: 'inline-block', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <QRCodeSVG value={generateUPIString()} size={160} />
                  </div>
                  <p style={{ margin: '15px 0 0 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>UPI ID: <strong style={{ color: 'var(--text-primary)' }}>{settings.upi_id}</strong></p>
                  {settings.instructions && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{settings.instructions}</p>
                  )}
                </div>
              )}

              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '6px' }}
                disabled={!settings?.upi_id}
                onClick={() => setStep(2)}
              >
                I've Completed Payment
              </button>
            </div>

            {/* Step 2: Upload Details */}
            <div style={{ width: '50%', flexShrink: 0, padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0, fontSize: '0.9rem' }}
                >
                  &larr; Back to QR
                </button>
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>Submit Payment Details</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Please provide either the UTR number or a screenshot of your successful payment.</p>

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: 'var(--text-primary)' }}>UPI Transaction ID / UTR</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={utr}
                    onChange={e => setUtr(e.target.value)}
                    placeholder="Enter 12-digit UTR number"
                    style={{ width: '100%', padding: '10px', fontSize: '0.9rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.9rem', marginBottom: '5px', display: 'block', color: 'var(--text-primary)' }}>Payment Screenshot</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', left: 0, top: 0 }}
                    />
                    <button type="button" className="btn-secondary" style={{ width: '100%', padding: '10px', borderRadius: '6px', pointerEvents: 'none', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}>
                      {uploading ? 'Uploading...' : screenshot ? 'Change Screenshot' : '📁 Upload Screenshot'}
                    </button>
                  </div>
                  {screenshot && (
                    <div style={{ marginTop: '10px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={screenshot} alt="Payment Proof" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '10px', fontSize: '1rem', borderRadius: '6px' }}
                  disabled={loading || uploading || (!utr && !screenshot)}
                >
                  {loading ? 'Submitting...' : "Submit Payment Details"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentModal;
