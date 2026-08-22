import React, { useState, useEffect } from 'react';
import { FaDownload, FaFilter, FaChartBar, FaUserGraduate, FaCalendarCheck } from 'react-icons/fa';
import { 
    PieChart, Pie, Cell, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
            const res = await api.get('/classes');
            if (res.data.success) setClasses(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchExams = async () => {
        try {
            const res = await api.get('/exams');
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
                url = '/reports/students';
            } else if (activeTab === 'ATTENDANCE') {
                url = '/reports/attendance';
                if (selectedClass) params.classId = selectedClass;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
            } else if (activeTab === 'PERFORMANCE') {
                url = '/reports/performance';
                if (selectedClass) params.classId = selectedClass;
                if (selectedExam) params.examId = selectedExam;
            }

            const res = await api.get(url, { params });
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
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
        ].join('\n');

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

    // Calculate Analytics Data
    const getStudentAnalytics = () => {
        const genderCount = data.reduce((acc, curr) => {
            const gender = curr.gender || 'Unknown';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(genderCount).map(key => ({ name: key, value: genderCount[key] }));
    };

    const getAttendanceAnalytics = () => {
        const statusCount = data.reduce((acc, curr) => {
            const status = curr.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(statusCount).map(key => ({ name: key, value: statusCount[key] }));
    };

    const getPerformanceAnalytics = () => {
        const gradeCount = data.reduce((acc, curr) => {
            const grade = curr.grade || 'N/A';
            acc[grade] = (acc[grade] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(gradeCount).map(key => ({ name: key, value: gradeCount[key] }));
    };

    return (
        <div className="reports-container fade-in">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">View and export system-wide insights</p>
                </div>
                <div className="action-buttons-group">
                    <button className="btn-secondary" onClick={handleExportCSV} disabled={data.length === 0}>
                        <FaDownload /> Export CSV
                    </button>
                </div>
            </div>

            <div className="tab-navigation">
                <button className={`tab-item ${activeTab === 'STUDENTS' ? 'active' : ''}`} onClick={() => setActiveTab('STUDENTS')}>
                    <FaUserGraduate /> Student Roster
                </button>
                <button className={`tab-item ${activeTab === 'ATTENDANCE' ? 'active' : ''}`} onClick={() => setActiveTab('ATTENDANCE')}>
                    <FaCalendarCheck /> Attendance
                </button>
                <button className={`tab-item ${activeTab === 'PERFORMANCE' ? 'active' : ''}`} onClick={() => setActiveTab('PERFORMANCE')}>
                    <FaChartBar /> Academic Performance
                </button>
            </div>

            {(activeTab === 'ATTENDANCE' || activeTab === 'PERFORMANCE') && (
                <div className="report-filters-card">
                    <div className="filter-group">
                        <label>Class</label>
                        <select className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
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
                                <input type="date" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="filter-group">
                                <label>End Date</label>
                                <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </>
                    )}

                    {activeTab === 'PERFORMANCE' && (
                        <div className="filter-group">
                            <label>Exam</label>
                            <select className="input-field" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                                <option value="">All Exams</option>
                                {exams.map(e => (
                                    <option key={e.id} value={e.id}>{e.exam_name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-primary" onClick={fetchReportData} style={{ height: '42px', padding: '0 24px' }}>
                            <FaFilter /> Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Analytics Section */}
            {!loading && data.length > 0 && (
                <div className="analytics-grid">
                    <div className="stat-card">
                        <h3>Total Records</h3>
                        <div className="stat-value">{data.length}</div>
                    </div>
                    
                    <div className="chart-card">
                        <h3>{activeTab === 'STUDENTS' ? 'Gender Distribution' : activeTab === 'ATTENDANCE' ? 'Attendance Overview' : 'Grade Distribution'}</h3>
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {activeTab === 'STUDENTS' || activeTab === 'ATTENDANCE' ? (
                                    <PieChart>
                                        <Pie 
                                            data={activeTab === 'STUDENTS' ? getStudentAnalytics() : getAttendanceAnalytics()} 
                                            cx="50%" cy="50%" 
                                            innerRadius={60} outerRadius={80} 
                                            paddingAngle={5} dataKey="value"
                                        >
                                            {(activeTab === 'STUDENTS' ? getStudentAnalytics() : getAttendanceAnalytics()).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                ) : (
                                    <BarChart data={getPerformanceAnalytics()}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
                                        <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)' }} />
                                        <Tooltip cursor={{fill: 'rgba(128,128,128,0.1)'}} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                                        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            <div className="report-table-wrapper">
                {loading ? (
                    <div className="table-loading-state">
                        <div className="spinner"></div>
                        <p>Generating report...</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="table-empty-state">No data found for the selected criteria.</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                {Object.keys(data[0])
                                    .filter(key => !(activeTab === 'STUDENTS' && key === 'status'))
                                    .map(key => (
                                    <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => (
                                <tr key={idx}>
                                    {Object.keys(row)
                                        .filter(key => !(activeTab === 'STUDENTS' && key === 'status'))
                                        .map((key, i) => (
                                        <td key={i} data-label={key.replace(/_/g, ' ').toUpperCase()}>
                                            {row[key] !== null ? String(row[key]).substring(0, 50) : '-'}
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
