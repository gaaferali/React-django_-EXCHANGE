export default function LoadingSpinner({ fullScreen = false, message = 'Loading' }: { fullScreen?: boolean; message?: string }) {
  return (
    <div className={fullScreen ? 'page-loader full' : 'page-loader'} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
