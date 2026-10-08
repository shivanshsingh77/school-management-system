import { useState } from "react";

const emptyForm = { name: "", phone: "", email: "", address: "", qualification: "", subject: "", joiningDate: "" };

export default function TeacherForm({ initialData, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(() =>
    initialData ? { ...emptyForm, ...initialData, joiningDate: initialData.joiningDate ? initialData.joiningDate.slice(0, 10) : "" } : emptyForm
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email address";
    if (!form.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!form.subject.trim()) newErrors.subject = "Subject is required";
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) newErrors.phone = "Phone must be exactly 10 digits";
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
        <label>Full Name *</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
      <div className="form-field">
        <label>Email *</label>
        <input name="email" value={form.email} onChange={handleChange} />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div className="form-field">
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="10 digit number" />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>
      <div className="form-field">
        <label>Qualification *</label>
        <input name="qualification" value={form.qualification} onChange={handleChange} />
        {errors.qualification && <span className="field-error">{errors.qualification}</span>}
      </div>
      <div className="form-field">
        <label>Subject *</label>
        <input name="subject" value={form.subject} onChange={handleChange} />
        {errors.subject && <span className="field-error">{errors.subject}</span>}
      </div>
      <div className="form-field">
        <label>Joining Date</label>
        <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} />
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
