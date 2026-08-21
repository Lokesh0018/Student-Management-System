import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaClock, FaIdCard, FaBuilding } from 'react-icons/fa';

const AdminPaymentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const payment = location.state?.payment;

  if (!payment) {
    return <Navigate to="/admin/payments" replace />;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)' }}>Payment Details</h1>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="card" style={{ flex: '1 1 500px', background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
             <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Transaction Information</h2>
             <span className={`badge ${
                payment.status === 'VERIFIED' ? 'badge-success' : 
                payment.status === 'REJECTED' ? 'badge-danger' : 
                'badge-info'
             }`} style={{ fontSize: '0.95rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {payment.status === 'VERIFIED' ? <FaCheckCircle/> : payment.status === 'REJECTED' ? <FaTimesCircle/> : <FaClock/>}
                {payment.status}
             </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '10px', color: 'var(--primary)' }}>
                      <FaUserGraduate size={20} />
                  </div>
                  <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Student Name</p>
                      <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{payment.first_name} {payment.last_name}</p>
                  </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '10px', color: 'var(--primary)' }}>
                      <FaIdCard size={20} />
                  </div>
                  <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Class & Section</p>
                      <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{payment.class_name} {payment.section}</p>
                  </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '10px', color: 'var(--primary)' }}>
                      <FaCalendarAlt size={20} />
                  </div>
                  <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment Date</p>
                      <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{new Date(payment.payment_date).toLocaleDateString()}</p>
                  </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: '10px', color: 'var(--primary)' }}>
                      <FaBuilding size={20} />
                  </div>
                  <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Term</p>
                      <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{payment.term_name}</p>
                  </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', gridColumn: '1 / -1', background: 'var(--bg)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '10px', color: 'var(--success)' }}>
                      <FaMoneyBillWave size={24} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Amount Paid</p>
                          <p style={{ margin: 0, fontWeight: '700', color: 'var(--success)', fontSize: '1.5rem' }}>₹{payment.amount}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Transaction ID / UTR</p>
                          <p style={{ margin: 0, fontWeight: '600', fontFamily: 'monospace', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{payment.utr_number}</p>
                      </div>
                  </div>
              </div>
          </div>

          {payment.status === 'REJECTED' && (
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                  <FaTimesCircle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
                  <div>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--danger)', fontSize: '1rem' }}>Payment Rejected</h4>
                      <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{payment.rejection_reason}</p>
                  </div>
              </div>
          )}
        </div>

        {payment.screenshot && (
          <div className="card" style={{ flex: '1 1 400px', background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)' }}>
              <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                  Payment Proof
              </h2>
              <div style={{ background: 'var(--bg)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <a href={payment.screenshot} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', cursor: 'zoom-in' }}>
                      <img src={payment.screenshot} alt="Payment Screenshot" style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }} 
                           onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} 
                           onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} 
                      />
                  </a>
              </div>
              <p style={{ margin: '12px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Click on the image to view in full size</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentDetails;
