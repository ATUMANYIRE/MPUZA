import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CreateCompanyPage } from './routes/CreateCompanyPage';
import { CompanyPage } from './routes/CompanyPage';
import { StyleGuide } from './routes/StyleGuide';
import { OverlayProvider } from './lib/overlay';

export const App = () => (
  <OverlayProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<CreateCompanyPage />} />
      <Route path="/company" element={<CompanyPage />} />
      {/* Dev-only: the style guide is not part of the shipped app. */}
      {import.meta.env.DEV && <Route path="/styleguide" element={<StyleGuide />} />}
    </Routes>
    </BrowserRouter>
  </OverlayProvider>
);
