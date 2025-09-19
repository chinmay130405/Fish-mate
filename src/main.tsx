import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './setupCanvas'
import './i18n'
import i18n from './i18n'
import { I18nextProvider } from 'react-i18next'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nextProvider>
  </StrictMode>,
)
