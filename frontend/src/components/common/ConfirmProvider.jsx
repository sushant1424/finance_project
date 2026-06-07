import { createContext, useCallback, useContext, useState } from 'react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const close = (result) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && close(false)}
          title={state.title}
          description={state.description}
          confirmLabel={state.confirmLabel ?? 'Confirm'}
          cancelLabel={state.cancelLabel ?? 'Cancel'}
          variant={state.variant ?? 'default'}
          requireText={state.requireText}
          onConfirm={() => close(true)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

export default ConfirmProvider;
