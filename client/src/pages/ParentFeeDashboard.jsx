import React, { useState, useEffect } from 'react';
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
          <div key={childData.student.id} className="card" style={{ marginBottom: '20px' }}>
            <h2>{childData.student.name} - {childData.student.className}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' }}>
              {childData.fees.length === 0 ? (
                <p>No fees assigned.</p>
              ) : (
                childData.fees.map(fee => (
                  <div key={fee.student_fee_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                    <h3>{fee.term_name}</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>₹{fee.amount}</p>
                    <p>Due: {new Date(fee.due_date).toLocaleDateString()}</p>
                    
                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${
                        fee.status === 'PAID' ? 'badge-success' : 
                        fee.status === 'PAYMENT_SUBMITTED' ? 'badge-info' : 
                        fee.status === 'REJECTED' || fee.status === 'OVERDUE' ? 'badge-danger' : 
                        'badge-warning'
                      }`}>
                        {fee.status.replace('_', ' ')}
                      </span>

                      {fee.status !== 'PAID' && fee.status !== 'PAYMENT_SUBMITTED' && (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => setSelectedFee({ ...fee, student: childData.student })}
                        >
                          Pay Now
                        </button>
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
