import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMoneyBillWave, FaUserGraduate } from 'react-icons/fa';
import api from '../utils/api';
import PaymentModal from './PaymentModal';

const ParentFeeDashboard = () => {
  const [childrenData, setChildrenData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const res = await api.get('/fees/my-children');
      if (res.data.success) {
        setChildrenData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch fees', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Fees</h1>
      </div>

      {childrenData.length === 0 ? (
        <div className="card">No fee records found for your children.</div>
      ) : (
        childrenData.map(childData => (
          <div key={childData.student.id} className="card" style={{ marginBottom: '20px', background: '#f8fafc', border: 'none', padding: '20px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', color: '#334155', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              <FaUserGraduate className="text-primary" /> {childData.student.name} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>({childData.student.className})</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {childData.fees.length === 0 ? (
                <p style={{ color: '#64748b', fontStyle: 'italic' }}>No fees assigned.</p>
              ) : (
                childData.fees.map(fee => (
                  <div key={fee.student_fee_id} style={{ 
                    border: '1px solid #e2e8f0', 
                    padding: '24px', 
                    borderRadius: '16px', 
                    background: '#ffffff', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', fontWeight: '600' }}>{fee.term_name}</h3>
                      <span className={`badge ${
                        fee.status === 'PAID' ? 'badge-success' : 
                        fee.status === 'PAYMENT_SUBMITTED' ? 'badge-info' : 
                        fee.status === 'REJECTED' || fee.status === 'OVERDUE' ? 'badge-danger' : 
                        'badge-warning'
                      }`}>
                        {fee.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div style={{ margin: '15px 0', color: '#0f172a' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>₹{fee.amount}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.95rem', marginBottom: '25px' }}>
                      <FaCalendarAlt style={{ marginRight: '8px', color: '#94a3b8' }} />
                      Due: <strong style={{ marginLeft: '4px', color: '#475569' }}>{new Date(fee.due_date).toLocaleDateString()}</strong>
                    </div>
                    
                    <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                      {fee.status !== 'PAID' && fee.status !== 'PAYMENT_SUBMITTED' && fee.status !== 'INACTIVE' && fee.status !== 'OVERDUE' ? (
                        <button 
                          className="btn btn-primary" 
                          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', fontSize: '1rem', borderRadius: '8px' }}
                          onClick={() => setSelectedFee({ ...fee, student: childData.student })}
                        >
                          <FaMoneyBillWave /> Pay Now
                        </button>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px 0', background: '#f8fafc', borderRadius: '8px' }}>
                          {fee.status === 'PAID' ? (
                            <span style={{ color: '#10b981', fontWeight: '600' }}>Payment Complete ✓</span>
                          ) : fee.status === 'PAYMENT_SUBMITTED' ? (
                            <span style={{ color: '#3b82f6', fontWeight: '600' }}>Verification Pending ⏳</span>
                          ) : (
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>Expired / Overdue ⚠️</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))
      )}

      {selectedFee && (
        <PaymentModal 
          fee={selectedFee} 
          onClose={() => setSelectedFee(null)} 
          onSuccess={() => {
            setSelectedFee(null);
            fetchFees();
          }} 
        />
      )}
    </div>
  );
};

export default ParentFeeDashboard;
