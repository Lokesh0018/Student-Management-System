import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { getDirectImageUrl } from '../utils/imageUtils';
import './css/AddStudent.css';

const AddStudent = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            class_id: '',
            roll_number: '',
            admission_number: '',
            dob: '',
            gender: '',
            phone: '',
            address: '',
            admission_date: '',
            status: 'ACTIVE',
            photo: '',
            parent_name: '',
            parent_email: '',
            parent_phone: '',
            parent_relationship: 'Father'
        }
    });

    const photoUrl = watch('photo');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes');
                if (res.data.success) {
                    setClasses(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch classes", err);
                toast.error('Failed to load classes.');
            }
        };
        fetchClasses();
    }, []);

    const onSubmit = async (data) => {
        try {
            await api.post('/students', data);
            toast.success('Student added successfully!');
            navigate('/admin/students');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to add student.');
        }
    };

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Add Student</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <Link to="/admin/students" className="crumb-link">Students</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Add Student</span>
                    </div>
                </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit(onSubmit)} aria-label="Add Student Form">
                <div className="form-left-col">
                    {/* Personal Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="first_name">First Name <span className="req">*</span></label>
                                <input 
                                    id="first_name"
                                    type="text" 
                                    aria-invalid={errors.first_name ? "true" : "false"}
                                    {...register('first_name', { required: 'First name is required' })} 
                                />
                                {errors.first_name && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.first_name.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="last_name">Last Name <span className="req">*</span></label>
                                <input 
                                    id="last_name"
                                    type="text" 
                                    aria-invalid={errors.last_name ? "true" : "false"}
                                    {...register('last_name', { required: 'Last name is required' })} 
                                />
                                {errors.last_name && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.last_name.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="dob">Date of Birth</label>
                                <input id="dob" type="date" {...register('dob')} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="gender">Gender</label>
                                <select id="gender" {...register('gender')}>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input id="email" type="email" {...register('email')} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone</label>
                                <input id="phone" type="tel" {...register('phone')} />
                            </div>
                            <div className="form-group full-width">
                                <label htmlFor="address">Address</label>
                                <textarea id="address" rows="2" {...register('address')}></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="form-section">
                        <h3 className="form-section-title">Academic Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="class_id">Class <span className="req">*</span></label>
                                <select id="class_id" aria-invalid={errors.class_id ? "true" : "false"} {...register('class_id', { required: 'Class is required' })}>
                                    <option value="">Select class</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.class_name} - {c.section}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.class_id.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="roll_number">Roll Number <span className="req">*</span></label>
                                <input id="roll_number" type="text" aria-invalid={errors.roll_number ? "true" : "false"} {...register('roll_number', { required: 'Roll number is required' })} />
                                {errors.roll_number && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.roll_number.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="admission_number">Admission Number <span className="req">*</span></label>
                                <input id="admission_number" type="text" aria-invalid={errors.admission_number ? "true" : "false"} {...register('admission_number', { required: 'Admission number is required' })} />
                                {errors.admission_number && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.admission_number.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="admission_date">Admission Date</label>
                                <input id="admission_date" type="date" {...register('admission_date')} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status <span className="req">*</span></label>
                                <select id="status" {...register('status', { required: true })}>
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
                                <label htmlFor="parent_name">Parent Name <span className="req">*</span></label>
                                <input id="parent_name" type="text" aria-invalid={errors.parent_name ? "true" : "false"} {...register('parent_name', { required: 'Parent name is required' })} />
                                {errors.parent_name && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.parent_name.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="parent_email">Parent Email <span className="req">*</span></label>
                                <input id="parent_email" type="email" aria-invalid={errors.parent_email ? "true" : "false"} {...register('parent_email', { required: 'Parent email is required' })} />
                                {errors.parent_email && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.parent_email.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="parent_phone">Parent Phone <span className="req">*</span></label>
                                <input id="parent_phone" type="tel" aria-invalid={errors.parent_phone ? "true" : "false"} {...register('parent_phone', { required: 'Parent phone is required' })} />
                                {errors.parent_phone && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.parent_phone.message}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="parent_relationship">Relationship <span className="req">*</span></label>
                                <select id="parent_relationship" {...register('parent_relationship', { required: true })}>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-right-col">
                    <div className="form-section photo-upload-section">
                        <h3 className="form-section-title">Student Photo URL</h3>
                        <div className="form-group full-width">
                            <label htmlFor="photo">Image Link</label>
                            <input 
                                id="photo"
                                type="url" 
                                placeholder="https://example.com/image.jpg"
                                {...register('photo')}
                            />
                        </div>
                        {photoUrl && (
                            <div className="upload-box" style={{ marginTop: '16px', padding: 0, overflow: 'hidden', border: 'none' }}>
                                <img 
                                    src={getDirectImageUrl(photoUrl)} 
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
                        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/students')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Student'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
