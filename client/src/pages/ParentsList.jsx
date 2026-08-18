import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import api from '../utils/api';
import './css/StudentList.css'; // Reusing for consistency

const ParentsList = () => {
    const [parents, setParents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [parentToDelete, setParentToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchParents = async () => {
        try {
            const res = await api.get('/parents');
            setParents(res.data.data);
        } catch (error) {
            console.error('Error fetching parents', error);
        }
    };

    useEffect(() => {
        fetchParents();
    }, []);

    const openDeleteModal = (e, id) => {
        e.stopPropagation();
        setParentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!parentToDelete) return;
        try {
            await api.delete(`/parents/${parentToDelete}`);
            fetchParents();
            setIsDeleteModalOpen(false);
            setParentToDelete(null);
        } catch (error) {
            console.error('Error deleting parent', error);
            alert("Failed to delete parent");
        }
    };

    const filteredParents = parents.filter(parent => {
        return parent.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
               parent.email?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleRowClick = (parentId) => {
        navigate(`/admin/parents/${parentId}`);
    };

    const getParentAvatar = (name) => {
        const names = String(name || '').trim().split(" ");
        if(names.length > 1){
            return names[0].charAt(0) + names[1].charAt(0);
        }else if(names.length === 1 && names[0]){
            return names[0].charAt(0);
        }else{
            return "P";
        }
    };

    return (
        <div className="student-list-page">
            <div className="page-header-row">
                <div className="page-header-left">
                    <h1 className="page-title">Parents</h1>
                    <div className="breadcrumbs">
                        <Link to="/admin/dashboard" className="crumb-link">Dashboard</Link>
                        <span className="crumb-separator">&gt;</span>
                        <span className="current-crumb">Parents</span>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => navigate('/admin/parents/add')}>
                    <FaPlus /> Add Parent
                </button>
            </div>

            <div className="filter-card">
                <div className="search-input-wrap">
                    <FaSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search parents by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NAME</th>
                            <th>EMAIL</th>
                            <th>PHONE</th>
                            <th>CHILDREN</th>
                            <th className="text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParents.map(parent => (
                            <tr key={parent.id} onClick={() => handleRowClick(parent.id)} className="clickable-row">
                                <td className="text-secondary">{parent.id}</td>
                                <td>
                                    <div className="student-name-cell">
                                        <div className="table-avatar-placeholder" style={{ backgroundColor: '#2dd4bf' }}>
                                            {getParentAvatar(parent.name)}
                                        </div>
                                        <span className="fw-500">{parent.name}</span>
                                    </div>
                                </td>
                                <td>{parent.email}</td>
                                <td>{parent.phone || '-'}</td>
                                <td>{parent.children_names || '-'}</td>
                                <td className="text-right">
                                    <div className="action-buttons-group">
                                        <button className="action-btn-icon text-blue" onClick={(e) => { e.stopPropagation(); navigate(`/admin/parents/${parent.id}`); }}>
                                            <FaEye />
                                        </button>
                                        <button className="action-btn-icon text-gray" onClick={(e) => { e.stopPropagation(); navigate(`/admin/parents/${parent.id}/edit`); }}>
                                            <FaPen />
                                        </button>
                                        <button className="action-btn-icon text-red" onClick={(e) => openDeleteModal(e, parent.id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="pagination-footer">
                    <span className="pagination-info">Showing {filteredParents.length} results</span>
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this parent? This action cannot be undone and will also remove their user account.</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" style={{backgroundColor: '#ef4444', borderColor: '#ef4444'}} onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentsList;
