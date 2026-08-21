import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FaUserGraduate, FaCalendarAlt, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaClock, FaIdCard, FaBuilding } from 'react-icons/fa';
import './css/AdminPaymentDetails.css';

const AdminPaymentDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const payment = location.state?.payment;

    if (!payment) {
        return <Navigate to="/admin/payments" replace />;
    }

    return (
        <div className="page-container payment-page">
            <div className="page-header">
                <h1>Payment Details</h1>
            </div>

            <div className="payment-details-grid">
                <div className="payment-details-card">
                    <div className="card-header">
                        <h2>Transaction Information</h2>
                        <span className={`badge ${payment.status === 'VERIFIED' ? 'badge-success' :
                                payment.status === 'REJECTED' ? 'badge-danger' :
                                    'badge-info'
                            }`}>
                            {payment.status === 'VERIFIED' ? <FaCheckCircle /> : payment.status === 'REJECTED' ? <FaTimesCircle /> : <FaClock />}
                            {payment.status}
                        </span>
                    </div>

                    <div className="transaction-info">
                        <div className="transaction-row">
                            <div className="transaction-icon-box">
                                <FaUserGraduate size={20} />
                            </div>
                            <div className="transaction-item">
                                <p className="transaction-label">Student Name</p>
                                <p className="transaction-value">{payment.first_name} {payment.last_name}</p>
                            </div>
                        </div>

                        <div className="transaction-row">
                            <div className="transaction-icon-box">
                                <FaIdCard size={20} />
                            </div>
                            <div className="transaction-item">
                                <p className="transaction-label">Class & Section</p>
                                <p className="transaction-value">{payment.class_name} {payment.section}</p>
                            </div>
                        </div>

                        <div className="transaction-row">
                            <div className="transaction-icon-box">
                                <FaCalendarAlt size={20} />
                            </div>
                            <div className="transaction-item">
                                <p className="transaction-label">Payment Date</p>
                                <p className="transaction-value">{new Date(payment.payment_date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="transaction-row">
                            <div className="transaction-icon-box">
                                <FaBuilding size={20} />
                            </div>
                            <div className="transaction-item">
                                <p className="transaction-label">Term</p>
                                <p className="transaction-value">{payment.term_name}</p>
                            </div>
                        </div>

                        <div className="transaction-amount-box">
                            <div className="transaction-amount-icon">
                                <FaMoneyBillWave size={24} />
                            </div>
                            <div className="transaction-amount-details">
                                <div>
                                    <p className="transaction-label">Amount Paid</p>
                                    <p className="transaction-amount-value">₹{payment.amount}</p>
                                </div>
                                <div className="utr-container">
                                    <p className="transaction-label">Transaction ID / UTR</p>
                                    <p className="transaction-utr-value">{payment.utr_number}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {payment.status === 'REJECTED' && (
                        <div className="rejection-box">
                            <FaTimesCircle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
                            <div>
                                <h4>Payment Rejected</h4>
                                <p>{payment.rejection_reason}</p>
                            </div>
                        </div>
                    )}
                </div>

                {payment.screenshot && (
                    <div className="payment-proof-card">
                        <h2>
                            Payment Proof
                        </h2>
                        <div className="payment-proof-container">
                            <img src={payment.screenshot} alt="Payment Proof screenshot" className="payment-proof-image"
                                onClick={() => window.open(payment.screenshot, '_blank')}
                            />
                        </div>
                        <p className="proof-hint">Click on the image to view in full size</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPaymentDetails;
