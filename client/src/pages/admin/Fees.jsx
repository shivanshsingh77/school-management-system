import { useEffect, useState } from "react";
import { Plus, Wallet, Trash2, Search } from "lucide-react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useNotify } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function Fees() {
  const { notify } = useNotify();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ student: "", totalFees: "" });
  const [addError, setAddError] = useState("");
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async (searchTerm = "") => {
    setLoading(true);
    try {
      const [feesRes, studentsRes] = await Promise.all([
        api.get("/fees", { params: searchTerm ? { search: searchTerm } : {} }),
        api.get("/students"),
      ]);
      setFees(feesRes.data.fees);
      setStudents(studentsRes.data.students);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to load fee records"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => load(search), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleAddFee = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!addForm.student || !addForm.totalFees || Number(addForm.totalFees) <= 0) { setAddError("Select a student and enter a valid fee amount"); return; }
    setSubmitting(true);
    try {
      await api.post("/fees", { student: addForm.student, totalFees: Number(addForm.totalFees) });
      notify("Fee record created successfully");
      setShowAddForm(false);
      setAddForm({ student: "", totalFees: "" });
      load(search);
    } catch (err) {
      setAddError(getErrorMessage(err, "Failed to create fee record"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPaymentError("");
    if (!paymentAmount || Number(paymentAmount) <= 0) { setPaymentError("Enter a valid payment amount"); return; }
    setSubmitting(true);
    try {
      await api.post(`/fees/${paymentTarget._id}/payments`, { amount: Number(paymentAmount) });
      notify("Payment recorded successfully");
      setPaymentTarget(null);
      setPaymentAmount("");
      load(search);
    } catch (err) {
      setPaymentError(getErrorMessage(err, "Failed to record payment"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/fees/${deleteTarget._id}`);
      notify("Fee record deleted successfully");
      setDeleteTarget(null);
      load(search);
    } catch (err) {
      notify(getErrorMessage(err, "Failed to delete fee record"), "error");
    }
  };

  return (
    <div>
      <header className="page-header">
        <div><h1>Fees</h1><p className="page-subtitle">{fees.length} fee record(s)</p></div>
        <button className="btn btn-primary btn-inline" onClick={() => setShowAddForm(true)}><Plus size={16} /> Add Fee Record</button>
      </header>

      <div className="toolbar">
        <div className="search-box"><Search size={16} /><input placeholder="Search by student name or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      <div className="table-card">
        {loading ? (
          <p className="muted" style={{ padding: 20 }}>Loading...</p>
        ) : fees.length === 0 ? (
          <p className="muted" style={{ padding: 20 }}>No fee records yet.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Student</th><th>Class</th><th>Total Fees</th><th>Paid</th><th>Pending</th><th>Actions</th></tr></thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f._id}>
                  <td>{f.student?.name} ({f.student?.rollNumber})</td>
                  <td>{f.student?.class?.name || "—"}</td>
                  <td>₹{f.totalFees.toLocaleString("en-IN")}</td>
                  <td>₹{f.paidAmount.toLocaleString("en-IN")}</td>
                  <td><span className={`badge ${f.pendingAmount > 0 ? "badge-orange" : "badge-green"}`}>₹{f.pendingAmount.toLocaleString("en-IN")}</span></td>
                  <td>
                    <button className="icon-btn" title="Record payment" disabled={f.pendingAmount <= 0} onClick={() => setPaymentTarget(f)}><Wallet size={16} /></button>
                    <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => setDeleteTarget(f)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddForm && (
        <Modal title="Add Fee Record" onClose={() => setShowAddForm(false)} width={420}>
          <form onSubmit={handleAddFee} className="form-grid">
            {addError && <div className="auth-error form-field-full">{addError}</div>}
            <div className="form-field form-field-full">
              <label>Student *</label>
              <select value={addForm.student} onChange={(e) => setAddForm({ ...addForm, student: e.target.value })}>
                <option value="">Select student</option>
                {students.map((s) => (<option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>))}
              </select>
            </div>
            <div className="form-field form-field-full">
              <label>Total Fees (₹) *</label>
              <input type="number" min="1" value={addForm.totalFees} onChange={(e) => setAddForm({ ...addForm, totalFees: e.target.value })} />
            </div>
            <div className="auth-actions form-field-full">
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {paymentTarget && (
        <Modal title={`Record Payment — ${paymentTarget.student?.name}`} onClose={() => setPaymentTarget(null)} width={380}>
          <form onSubmit={handleRecordPayment} className="form-grid">
            {paymentError && <div className="auth-error form-field-full">{paymentError}</div>}
            <p className="muted form-field-full" style={{ marginTop: 0 }}>Pending amount: ₹{paymentTarget.pendingAmount.toLocaleString("en-IN")}</p>
            <div className="form-field form-field-full">
              <label>Payment Amount (₹) *</label>
              <input type="number" min="1" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            </div>
            <div className="auth-actions form-field-full">
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Record Payment"}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setPaymentTarget(null)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog message={`Delete fee record for "${deleteTarget.student?.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
