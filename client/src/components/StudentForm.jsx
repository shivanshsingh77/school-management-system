import { useState } from "react";

const emptyForm = { rollNumber: "", name: "", dateOfBirth: "", gender: "Male", class: "", phone: "", email: "", address: "", parentName: "" };

export default function StudentForm({ initialData, classes, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() =>
    initialData
      ? { ...emptyForm, ...initialData, class: initialData.class?._id || initialData.class || "", dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.slice(0, 10) : "" }
      : emptyForm
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    const newErrors = {};
    if (!form.rollNumber.trim()) newErrors.rollNumber = "Roll number is required";
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!form.class) newErrors.class = "Class is required";
    if (!form.parentName.trim()) newErrors.parentName = "Parent/Guardian name is required";
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) newErrors.phone = "Phone must be exactly 10 digits";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label>Roll Number *</label>
        <input name="rollNumber" value={form.rollNumber} onChange={handleChange} />
        {errors.rollNumber && <span className="field-error">{errors.rollNumber}</span>}
      </div>
      <div className="form-field">
        <label>Full Name *</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
      <div className="form-field">
        <label>Date of Birth *</label>
        <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
        {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth}</span>}
      </div>
      <div className="form-field">
        <label>Gender *</label>
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
      </div>
      <div className="form-field">
        <label>Class *</label>
        <select name="class" value={form.class} onChange={handleChange}>
          <option value="">Select class</option>
          {classes.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
        </select>
        {errors.class && <span className="field-error">{errors.class}</span>}
        {classes.length === 0 && <span className="field-hint">No classes yet — add one under Classes first.</span>}
      </div>
      <div className="form-field">
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="10 digit number" />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>
      <div className="form-field">
        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div className="form-field">
        <label>Parent/Guardian Name *</label>
        <input name="parentName" value={form.parentName} onChange={handleChange} />
        {errors.parentName && <span className="field-error">{errors.parentName}</span>}
      </div>
      <div className="form-field form-field-full">
        <label>Address</label>
        <textarea name="address" value={form.address} onChange={handleChange} rows={2} />
      </div>
      <div className="auth-actions form-field-full">
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>Cancel</button>
      </div>
    </form>
  );
}
