import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
      <Toaster 
        position='top-center'
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#2A2A2A',   // dark background
            color: '#fff',            // white text
            border: '1px solid #3a3a3a',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          }
        }}
      />
    </BrowserRouter>
  </Provider>
)
