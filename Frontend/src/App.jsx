import React from 'react';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import Navbar from './components/Navbar';
import UpdatePassword from './pages/UpdatePassword';
import ProblemPage from './pages/ProblemPage';
import CreateProblemPage from './pages/CreateProblemPage';
import UpdateProblemPage from './pages/UpdateProblemPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/email-verify" element={<EmailVerify />}></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>
        <Route path="/update-password" element={<UpdatePassword />}></Route>
        <Route path="/problems/:id" element={<ProblemPage />} />
        <Route path="/create-problem" element={<CreateProblemPage />} />
        <Route
          path="/updateproblem/:id"
          element={<UpdateProblemPage />}
        ></Route>
      </Routes>
    </>
  );
}

export default App;
