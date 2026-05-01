import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStudentsAPI, addStudentAPI, updateStudentAPI, deleteStudentAPI
} from '../services/api';

const COURSES = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Electronics', 'Chemical'];
const YEARS = ['1st', '2nd', '3rd', '4th'];

const emptyForm = {
  name: '', rollNumber: '', email: '', course: '', year: '', password: ''
};

export default function StudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCourse) params.course = filterCourse;
      if (filterYear) params.year = filterYear;
      const res = await getStudentsAPI(params);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCourse, filterYear]);

  useEffect(() => {
    const timeout = setTimeout(loadStudents, 300);
    return () => clearTimeout(timeout);
  }, [loadStudents]);

  const openAdd = () => { setForm(emptyForm); setFormError(''); setModal('add'); };
  const openEdit = (s) => {
    setSelected(s);
    setForm({ name: s.name, rollNumber: s.rollNumber, email: s.email, course: s.course, year: s.year, password: '' });
    setFormError('');
    setModal('edit');
  };
  const openDelete = (s) => { setSelected(s); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setFormError(''); };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await addStudentAPI(form);
      closeModal();
      loadStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await updateStudentAPI(selected._id, form);
      closeModal();
      loadStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await deleteStudentAPI(selected._id);
      closeModal();
      loadStudents();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>👥 Student Directory</h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {students.length} student{students.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          ➕ Add Student
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ flex: '0 1 180px' }} value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
          <option value="">All Courses</option>
          {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-input" style={{ flex: '0 1 130px' }} value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="">All Years</option>
          {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
        {(search || filterCourse || filterYear) && (
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setFilterCourse(''); setFilterYear(''); }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...Array(5)].map((_, i) => <div key={i} style={{ height: '60px' }} className="skeleton" />)}
        </div>
      ) : students.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">👤</div>
          <h3>No Students Found</h3>
          <p style={{ marginTop: '0.5rem' }}>Try adjusting your search or add a new student.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={openAdd}>➕ Add Student</button>
        </div>
      ) : (
        <div className="table-wrapper animate-in">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Roll No.</th>
                <th>Course</th>
                <th>Year</th>
                <th>Streak</th>
                <th>Quizzes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ fontSize: '0.8rem' }}>
                        {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{s.name}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{s.rollNumber}</span></td>
                  <td>{s.course}</td>
                  <td><span className="badge badge-primary">Year {s.year}</span></td>
                  <td>
                    <span style={{ color: s.streak > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: 600 }}>
                      {s.streak > 0 ? `🔥 ${s.streak}` : '—'}
                    </span>
                  </td>
                  <td>{s.quizzesTaken}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-icon" title="View Profile" onClick={() => navigate(`/students/${s._id}`)}>👁️</button>
                      <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => openEdit(s)}>✏️</button>
                      <button className="btn btn-danger btn-icon" title="Delete" onClick={() => openDelete(s)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────── */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1.5rem' }}>
              {modal === 'add' ? '➕ Add New Student' : '✏️ Edit Student'}
            </h2>

            {formError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>⚠️ {formError}</div>}

            <form onSubmit={modal === 'add' ? handleAddSubmit : handleEditSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" name="name" placeholder="Alice Johnson" value={form.name} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input className="form-input" name="rollNumber" placeholder="CS2024001" value={form.rollNumber} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" name="email" type="email" placeholder="alice@college.edu" value={form.email} onChange={handleFormChange} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Course *</label>
                  <select className="form-input" name="course" value={form.course} onChange={handleFormChange} required>
                    <option value="">Select Course</option>
                    {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <select className="form-input" name="year" value={form.year} onChange={handleFormChange} required>
                    <option value="">Select Year</option>
                    {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {modal === 'add' ? 'Password *' : 'New Password (leave blank to keep current)'}
                </label>
                <input className="form-input" name="password" type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleFormChange} required={modal === 'add'} minLength={6} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Saving...' : modal === 'add' ? '✅ Add Student' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────── */}
      {modal === 'delete' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '400px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Delete Student?</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              This will permanently delete <strong style={{ color: 'var(--text-primary)' }}>{selected?.name}</strong> and all their quiz history.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" disabled={submitting} onClick={handleDelete}>
                {submitting ? '⏳ Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  searchIcon: {
    position: 'absolute', left: '0.85rem', top: '50%',
    transform: 'translateY(-50%)', fontSize: '0.9rem', pointerEvents: 'none',
  },
};
