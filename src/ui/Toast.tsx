import { toastMessage } from './toastStore';

export default function Toast() {
  const message = toastMessage.value;
  return (
    <div class={message ? 'toast on' : 'toast'} role="status" aria-live="polite">
      {message}
    </div>
  );
}
