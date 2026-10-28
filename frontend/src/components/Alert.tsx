import { CheckCircle2, CircleAlert, X } from 'lucide-react';

export default function Alert({ type = 'error', message, onClose }: { type?: 'error' | 'success' | 'info'; message: string; onClose?: () => void }) {
  return (
    <div className={`notice notice-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {type === 'success' ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
      <span>{message}</span>
      {onClose && <button type="button" onClick={onClose} aria-label="Dismiss"><X size={17} /></button>}
    </div>
  );
}
