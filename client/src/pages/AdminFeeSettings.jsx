import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './css/Settings.css';

const AdminFeeSettings = () => {
  const [upiId, setUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    try {
      const res = await api.put('/fees/settings', {
        upi_id: upiId,
        payee_name: payeeName,
        instructions
      });
      if (res.data.success) {
        toast.success('Fee Settings saved successfully');
      } else {
        toast.error(res.data.message || 'Failed to save');
      }
    } catch (error) {
      toast.error('An error occurred while saving fee settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSave} className="settings-form">
      <div className="form-group">
        <label>School UPI ID *</label>
        <input 
          type="text" 
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
          value={payeeName}
          onChange={(e) => setPayeeName(e.target.value)}
          placeholder="e.g. ABC School"
        />
      </div>

      <div className="form-group">
        <label>Payment Instructions for Parents</label>
        <textarea 
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows="4"
          placeholder="Enter any instructions to show on the payment screen..."
        ></textarea>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default AdminFeeSettings;
