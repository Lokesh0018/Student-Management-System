import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import api from '../utils/api';
import { getDirectImageUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';
import './css/AddStudent.css';

const AddStudent = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
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
        }
    });

    const photoUrl = watch('photo');

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes');
                if (res.data.success) {
                    setClasses(res.data.data);
                    if (user?.role === 'CLASS_TEACHER' && res.data.data.length > 0) {
                        setValue('class_id', res.data.data[0].id.toString());
                    }
                }
            } catch (err) {
                console.error("Failed to fetch classes", err);
                toast.error('Failed to load classes.');
            }
        };
        fetchClasses();
    }, [user, setValue]);

    const onSubmit = async (data) => {
        try {
            await api.post('/students', data);
            toast.success('Student added successfully!');
            navigate(user?.role === 'CLASS_TEACHER' ? '/teacher/students' : '/admin/students');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to add student.');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const toastId = toast.loading('Uploading image...');
            const res = await api.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setValue('photo', res.data.url, { shouldValidate: true });
                toast.success('Image uploaded successfully!', { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to upload image');
        }
    };

    return (
        <div className="add-student-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Add Student</h1>
                </div>
            </div>

            <form className="form-container" onSubmit={handleSubmit(onSubmit)} aria-label="Add Student Form">
                <div className="form-left-col">
                    <div className="form-section">
                        <h3 className="form-section-title">Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>First Name <span className="req">*</span></label>
                                <input type="text" {...register('first_name', { required: 'First name is required' })} />
                                {errors.first_name && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.first_name.message}</span>}
                            </div>
                            <div className="form-group">
                                <label>Last Name <span className="req">*</span></label>
                                <input type="text" {...register('last_name', { required: 'Last name is required' })} />
                                {errors.last_name && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.last_name.message}</span>}
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input type="date" {...register('dob')} />
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
                                <label htmlFor="blood_group">Blood Group</label>
                                <select id="blood_group" {...register('blood_group')}>
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
                                <input type="email" {...register('email')} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="tel" {...register('phone')} />
                            </div>
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea rows="2" {...register('address')}></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title">Academic Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Class <span className="req">*</span></label>
                                <select 
                                    {...register('class_id', { required: 'Class is required' })}
                                    style={user?.role === 'CLASS_TEACHER' ? { pointerEvents: 'none', backgroundColor: '#f1f5f9' } : {}}
                                >
                                    {user?.role !== 'CLASS_TEACHER' && <option value="">Select class</option>}
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.class_name} - {c.section}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.class_id.message}</span>}
                            </div>
                            <div className="form-group">
                                <label>Roll Number <span className="req">*</span></label>
                                <input type="text" {...register('roll_number', { required: 'Roll number is required' })} />
                                {errors.roll_number && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.roll_number.message}</span>}
                            </div>
                            <div className="form-group">
                                <label>Admission Number <span className="req">*</span></label>
                                <input type="text" {...register('admission_number', { required: 'Admission number is required' })} />
                                {errors.admission_number && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.admission_number.message}</span>}
                            </div>
                            <div className="form-group">
                                <label>Admission Date</label>
                                <input type="date" {...register('admission_date')} />
                            </div>
                            <div className="form-group">
                                <label>Status <span className="req">*</span></label>
                                <select {...register('status', { required: true })}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="form-section-title">Parent Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Parent Name <span className="req">*</span></label>
                                <input type="text" {...register('parent_name', { required: 'Parent name is required' })} />
                                {errors.parent_name && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.parent_name.message}</span>}
                            </div>
                            <div className="form-group">
                                <label>Parent Email <span className="req">*</span></label>
                                <input type="email" {...register('parent_email', { required: 'Parent email is required' })} />
                                {errors.parent_email && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.parent_email.message}</span>}
                            </div>
                            <div className="form-group">
                                <label>Parent Phone <span className="req">*</span></label>
                                <input type="tel" {...register('parent_phone', { required: 'Parent phone is required' })} />
                                {errors.parent_phone && <span className="error-text" style={{color:'red', fontSize:'12px'}}>{errors.parent_phone.message}</span>}
                            </div>
                            <div className="form-group">
                                <label>Relationship <span className="req">*</span></label>
                                <select {...register('parent_relationship', { required: true })}>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Guardian">Guardian</option>
                                </select>
                            </div>
                            <div className="form-group full-width">
                                <label>Parent Login Password (Optional)</label>
                                <input 
                                    type="text" 
                                    placeholder="Default: parent123" 
                                    {...register('parent_password')} 
                                />
                                <span style={{fontSize: '11px', color: 'var(--text-secondary)'}}>
                                    If left empty, 'parent123' will be used for the parent account.
                                </span>
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
                            <input type="url" placeholder="https://example.com/image.jpg" {...register('photo')} />
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
                        <button type="button" className="btn-secondary" onClick={() => navigate(user?.role === 'CLASS_TEACHER' ? '/teacher/students' : '/admin/students')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <><FaSpinner className="spinner-icon" /> Adding...</>
                            ) : (
                                'Add Student'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
