import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mount the React app at the root DOM node.
createRoot(document.getElementById('root')).render(
  // StrictMode enables additional development checks and warnings.
  <StrictMode>
    <App />
  </StrictMode>,
)
