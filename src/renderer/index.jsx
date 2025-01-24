import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/DiscoverMusic.css';
import './styles/UserPlaylists.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
