export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${t.type !== 'success' ? t.type : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
