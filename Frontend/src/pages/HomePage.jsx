import React, { useEffect, useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import { getAllProblems } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { deleteProblem } from '../services/api';

export default function HomePage() {
  const [problems, setProblems] = useState([]);
  const { user, loading: authLoading } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await getAllProblems();
        setProblems(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (authLoading) {
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  const handleDelete = async (problemId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this problem?',
    );
    if (confirmed) {
      try {
        await deleteProblem(problemId);
        setProblems((prev) => prev.filter((p) => p._id !== problemId));
        alert('Problem deleted successfully!');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-24 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Problem List</h1>
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/create-problem')}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Problem
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-lg">Loading problems...</p>
        ) : problems.length === 0 ? (
          <p className="text-center text-lg">No problems available</p>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-100 font-semibold">
              <span>Title</span>
              <span>Difficulty</span>
              <span>Actions</span>
            </div>

            {/* Problem Rows */}
            {problems.map((problem) => (
              <div
                key={problem._id}
                className="grid grid-cols-3 gap-4 px-6 py-4 border-t hover:bg-gray-50"
              >
                <span className="font-medium">{problem.title}</span>
                <span
                  className={`font-semibold ${
                    problem.difficulty === 'Easy'
                      ? 'text-green-600'
                      : problem.difficulty === 'Medium'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {problem.difficulty}
                </span>
                <div className="flex space-x-16">
                  <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => navigate(`/problems/${problem._id}`)}
                  >
                    Solve
                  </button>
                  {user?.role === 'admin' && (
                    <div className="flex gap-12">
                      <button
                        className="text-blue-600 hover:underline font-medium"
                        onClick={() =>
                          navigate(`/updateproblem/${problem._id}`)
                        }
                      >
                        Update
                      </button>
                      <button
                        className="text-red-600 hover:underline font-medium"
                        onClick={() => handleDelete(problem._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
