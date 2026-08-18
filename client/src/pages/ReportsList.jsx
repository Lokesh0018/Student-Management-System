import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaFilter } from 'react-icons/fa';
import './css/ReportsList.css';

const ReportsList = () => {
    const [activeTab, setActiveTab] = useState('STUDENTS');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');

    useEffect(() => {
        fetchClasses();
        fetchExams();
    }, []);

    useEffect(() => {
        fetchReportData();
    }, [activeTab]);

    const fetchClasses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/classes');
            if (res.data.success) setClasses(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchExams = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/exams');
            if (res.data.success) setExams(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            let url = '';
            let params = {};
            
            if (activeTab === 'STUDENTS') {
                url = 'http://localhost:5000/api/reports/students';
            } else if (activeTab === 'ATTENDANCE') {
                url = 'http://localhost:5000/api/reports/attendance';
                if (selectedClass) params.classId = selectedClass;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
            } else if (activeTab === 'PERFORMANCE') {
                url = 'http://localhost:5000/api/reports/performance';
                if (selectedClass) params.classId = selectedClass;
                if (selectedExam) params.examId = selectedExam;
            }

            const res = await axios.get(url, { params });
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!data || data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                let val = row[header] === null ? '' : row[header];
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            }).join(','))
        ].join('\\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${activeTab.toLowerCase()}_report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h1 className="page-title">Reports & Analytics</h1>
                <button className="action-btn" onClick={handleExportCSV} disabled={data.length === 0}>
                    <FaDownload /> Export CSV
                </button>
            </div>

            <div className="reports-tabs">
                <button className={`tab-btn ${activeTab === 'STUDENTS' ? 'active' : ''}`} onClick={() => setActiveTab('STUDENTS')}>
                    Student Roster
                </button>
                <button className={`tab-btn ${activeTab === 'ATTENDANCE' ? 'active' : ''}`} onClick={() => setActiveTab('ATTENDANCE')}>
                    Attendance
                </button>
                <button className={`tab-btn ${activeTab === 'PERFORMANCE' ? 'active' : ''}`} onClick={() => setActiveTab('PERFORMANCE')}>
                    Academic Performance
                </button>
            </div>

            {(activeTab === 'ATTENDANCE' || activeTab === 'PERFORMANCE') && (
                <div className="report-filters">
                    <div className="filter-group">
                        <label>Class</label>
                        <select className="filter-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>
                            ))}
                        </select>
                    </div>

                    {activeTab === 'ATTENDANCE' && (
                        <>
                            <div className="filter-group">
                                <label>Start Date</label>
                                <input type="date" className="filter-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="filter-group">
                                <label>End Date</label>
                                <input type="date" className="filter-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </>
                    )}

                    {activeTab === 'PERFORMANCE' && (
                        <div className="filter-group">
                            <label>Exam</label>
                            <select className="filter-input" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                                <option value="">All Exams</option>
                                {exams.map(e => (
                                    <option key={e.id} value={e.id}>{e.exam_name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button className="action-btn" onClick={fetchReportData} style={{ marginBottom: '2px' }}>
                        <FaFilter /> Filter
                    </button>
                </div>
            )}

            <div className="report-table-wrapper">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading report data...</div>
                ) : data.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>No data found for the selected criteria.</div>
                ) : (
                    <table className="report-table">
                        <thead>
                            <tr>
                                {Object.keys(data[0]).map(key => (
                                    <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    {Object.values(row).map((val, i) => (
                                        <td key={i}>
                                            {val !== null ? String(val).substring(0, 50) : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ReportsList;
