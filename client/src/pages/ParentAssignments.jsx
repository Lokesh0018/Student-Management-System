import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ParentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/homework/my-children');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHomework = async (id) => {
    try {
      const res = await api.post('/homework', { assignment_id: id });
      if (res.data.success) {
        alert('Added to homework');
        fetchAssignments();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding to homework');
    }
  };

  const handleUpdateStatus = async (homework_id, status) => {
    try {
      const res = await api.put(`/homework/${homework_id}/status`, { status });
      if (res.data.success) {
        fetchAssignments();
      }
    } catch (error) {
      alert('Error updating status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Assignments</h1>
      </div>

      <div className="card">
        {assignments.length === 0 ? (
          <p>No active assignments for your children.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {assignments.map(a => (
              <div key={a.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="badge badge-info">{a.subject_name}</span>
                  {a.priority === 'High' && <span className="badge badge-danger">High Priority</span>}
                </div>
                <h3 style={{ marginTop: '10px' }}>{a.title}</h3>
                <p><strong>Student:</strong> {a.student_name}</p>
                <p>{a.description}</p>
                <p style={{ marginTop: '10px' }}>
                  <strong>Assigned:</strong> {new Date(a.assigned_date).toLocaleDateString()}
                  <br />
                  <strong>Due:</strong> {new Date(a.due_date).toLocaleDateString()}
                </p>

                <div style={{ marginTop: '15px' }}>
                  {!a.homework_status ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handleAddHomework(a.id)}>Mark as Homework</button>
                  ) : (
                    <div>
                      <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Status:</span>
                      <select 
                        className="form-control" 
                        style={{ display: 'inline-block', width: 'auto', padding: '5px' }}
                        value={a.homework_status} 
                        onChange={(e) => handleUpdateStatus(a.homework_id, e.target.value)}
                      >
                        <option value="TO_DO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentAssignments;
