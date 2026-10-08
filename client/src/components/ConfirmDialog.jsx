export default function ConfirmDialog({ title = "Are you sure?", message, onConfirm, onCancel, confirmLabel = "Delete" }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h2>{title}</h2></div>
        <div className="modal-body">
          <p style={{ color: "#4b5563", marginBottom: 20 }}>{message}</p>
          <div className="auth-actions">
            <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
