const ERROR_FLAG_KEY = "__GLOBAL_FATAL_ERROR__";

function renderGenericError(): void {
  document.body.innerHTML = `
    <div class="global-error-boundary">
      <div class="global-error-content">
        <h1>Something went wrong</h1>
        <p>Please check the link and try again.</p>
      </div>
    </div>
  `;

  (window as any)[ERROR_FLAG_KEY] = true;
}

export function hasGlobalErrorOccurred(): boolean {
  return Boolean((window as any)[ERROR_FLAG_KEY]);
}

export function registerGlobalErrorBoundary(): void {
  window.onerror = () => {
    renderGenericError();
    return true;
  };

  window.onunhandledrejection = () => {
    renderGenericError();
  };
}
