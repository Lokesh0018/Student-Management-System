import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './css/Settings.css'; // we can reuse some css or create new

const AdminFeeSettings = () => {
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/fees/settings');
      if (res.data.success && res.data.data) {
        setUpiId(res.data.data.upi_id || '');
        setPayeeName(res.data.data.payee_name || '');
        setInstructions(res.data.data.instructions || '');
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/fees/settings', {
        upi_id: upiId,
        payee_name: payeeName,
        instructions
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: res.data.message || 'Failed to save' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Fee Settings</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSave} className="form-container">
          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label>School UPI ID *</label>
            <input 
              type="text" 
              className="form-control" 
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. schoolname@upi"
              required
            />
          </div>

          <div className="form-group">
            <label>Payee Name (School Name)</label>
            <input 
              type="text" 
              className="form-control" 
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              placeholder="e.g. ABC School"
            />
          </div>

          <div className="form-group">
            <label>Payment Instructions for Parents</label>
            <textarea 
              className="form-control" 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows="4"
              placeholder="Enter any instructions to show on the payment screen..."
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminFeeSettings;
