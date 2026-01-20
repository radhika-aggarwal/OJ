import React from 'react';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
      </Routes>
    </>
  );
}

export default App;
