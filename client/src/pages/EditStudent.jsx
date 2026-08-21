import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';
import { getDirectImageUrl } from '../utils/imageUtils';
import { useBreadcrumb } from '../context/BreadcrumbContext';
import { useAuth } from '../context/AuthContext';
import './css/AddStudent.css';

const EditStudent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { setDynamicCrumb } = useBreadcrumb();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        class_id: '',
        roll_number: '',
        admission_number: '',
        dob: '',
        gender: '',
        blood_group: '',
        phone: '',
        address: '',
        admission_date: '',
        status: 'ACTIVE',
        photo: '',
        parent_name: '',
        parent_email: '',
        parent_phone: '',
        parent_relationship: 'Father',
        parent_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes');
                if (res.data.success) {
                    setClasses(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch classes", err);
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await api.get(`/students/${id}`);
                if (res.data.success) {
                    const s = res.data.data;
                    setDynamicCrumb(id, `${s.first_name} ${s.last_name}`);
                    setFormData({
                        first_name: s.first_name || '',
                        last_name: s.last_name || '',
                        email: s.email || '',
                        class_id: s.class_id || '',
                        roll_number: s.roll_number || '',
                        admission_number: s.admission_number || '',
                        dob: s.dob ? s.dob.split('T')[0] : '',
                        gender: s.gender || '',
                        blood_group: s.blood_group || '',
                        phone: s.phone || '',
                        address: s.address || '',
                        admission_date: s.admission_date ? s.admission_date.split('T')[0] : '',
                        status: s.status || 'ACTIVE',
                        photo: s.photo || '',
                        parent_name: s.parent_name || '',
                        parent_email: s.parent_email || '',
                        parent_phone: s.parent_phone || '',
                        parent_relationship: s.parent_relationship || 'Father',
                        parent_password: ''
                    });
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update student. Please try again.');
                console.error(err);
            }
        };
        fetchStudent();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.put(`/students/${id}`, formData);
            navigate(user?.role === 'CLASS_TEACHER' ? '/teacher/students' : '/admin/students');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update student');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            // Can use a local state or toast for loading, but let's just use window.alert if react-hot-toast isn't imported, but actually toast isn't imported here, so we will import it.
            const res = await api.post('/upload/image', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setFormData(prev => ({ ...prev, photo: res.data.url }));
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to upload image');
        }
    };

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Edit Student</h1>
                    </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit}>
                <div className="form-left-col">
                    {/* Personal Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Personal Information</h3>
                        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name <span className="req">*</span></label>
                                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name <span className="req">*</span></label>
                                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Blood Group</label>
                                <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
                                    <option value="">Select blood group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="2"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Academic Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Class <span className="req">*</span></label>
                                <select 
                                    name="class_id" 
                                    value={formData.class_id} 
                                    onChange={handleChange} 
                                    required
                                    style={user?.role === 'CLASS_TEACHER' ? { pointerEvents: 'none', backgroundColor: '#f1f5f9' } : {}}
                                >
                                    {user?.role !== 'CLASS_TEACHER' && <option value="">Select class</option>}
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.class_name} - {c.section}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Roll Number <span className="req">*</span></label>
                                <input type="text" name="roll_number" value={formData.roll_number} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Admission Number <span className="req">*</span></label>
                                <input type="text" name="admission_number" value={formData.admission_number} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Admission Date</label>
                                <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Status <span className="req">*</span></label>
                                <select name="status" value={formData.status} onChange={handleChange} required>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Parent Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Parent Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Parent Name <span className="req">*</span></label>
                                <input type="text" name="parent_name" value={formData.parent_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Parent Email <span className="req">*</span></label>
                                <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Parent Phone <span className="req">*</span></label>
                                <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Relationship <span className="req">*</span></label>
                                <select name="parent_relationship" value={formData.parent_relationship} onChange={handleChange} required>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                            </div>
                            <div className="form-group full-width">
                                <label>Update Parent Login Password (Optional)</label>
                                <input 
                                    type="text" 
                                    name="parent_password" 
                                    value={formData.parent_password} 
                                    onChange={handleChange} 
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-right-col">
                    <div className="form-section photo-upload-section">
                        <h3 className="form-section-title">Student Photo URL</h3>
                        <div className="form-group full-width">
                            <label>Upload Image</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                style={{ marginBottom: '10px' }}
                            />
                            <label>Or enter Image Link manually</label>
                            <input 
                                type="url" 
                                name="photo" 
                                value={formData.photo} 
                                onChange={handleChange} 
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                        {formData.photo && (
                            <div className="upload-box" style={{ marginTop: '16px', padding: 0, overflow: 'hidden', border: 'none' }}>
                                <img 
                                    src={getDirectImageUrl(formData.photo)} 
                                    alt="Preview" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "/default-avatar.png";
                                    }} 
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate(user?.role === 'CLASS_TEACHER' ? '/teacher/students' : '/admin/students')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? (
                                <><FaSpinner className="spinner-icon" /> Updating...</>
                            ) : (
                                'Update Student'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditStudent;
