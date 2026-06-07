import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import App from '@/App';
import ThemeProvider from '@/components/common/ThemeProvider';
import ConfirmProvider from '@/components/common/ConfirmProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import '@/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <ConfirmProvider>
            <App />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </ConfirmProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
