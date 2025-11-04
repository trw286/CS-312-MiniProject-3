// variables, file setups, import
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// create React root hooked to #root div
const root = ReactDOM.createRoot(document.getElementById('root'));

// render app
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

