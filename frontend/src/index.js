// import 'bootstrap/dist/css/bootstrap.min.css';
// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import App from './App';
// import ResumePage from './pages/ResumePage';

// // import './index.css';

// const root = createRoot(document.getElementById('root'));

// root.render(
//   <React.StrictMode>
//     <Router>
//       <Routes>
//         <Route path="/" element={<App />} />
//         <Route path="/resume" element={<ResumePage />} />
//       </Routes>
//     </Router>
//   </React.StrictMode>
// );

import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Register first */}
        <Route path="/" element={<Signup />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Main dashboard */}
        <Route path="/dashboard" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
