import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getProblemById,
  updateProblem,
  getTestCasesByProblemId,
  updateTestCase,
  createManyTestCases,
} from '../services/api';

export default function UpdateProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Problem state
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [constraints, setConstraints] = useState('');
  const [timeLimit, setTimeLimit] = useState(1000);
  const [memoryLimit, setMemoryLimit] = useState(256);

  // Test cases state
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        const problemRes = await getProblemById(id);
        const problem = problemRes.data.problem;
        setTitle(problem.title);
        setStatement(problem.statement);
        setDifficulty(problem.difficulty);
        setConstraints(problem.constraints || '');
        setTimeLimit(problem.timeLimit);
        setMemoryLimit(problem.memoryLimit);

        const testCaseRes = await getTestCasesByProblemId(id);
        setTestCases(testCaseRes.data); // all test cases
      } catch (err) {
        console.error(err);
        alert('Error fetching problem data');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [id]);

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };

  const addTestCase = () => {
    setTestCases([
      ...testCases,
      {
        stdin: '',
        stdout: '',
        visibility: true,
        executionNum: testCases.length + 1,
      },
    ]);
  };

  const removeTestCase = (index) => {
    const newTestCases = [...testCases];
    newTestCases.splice(index, 1);
    setTestCases(newTestCases);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update problem
      await updateProblem(id, {
        title,
        statement,
        difficulty,
        constraints,
        timeLimit,
        memoryLimit,
      });

      // Update or create test cases
      const existing = testCases.filter((tc) => tc._id);
      const newTCs = testCases.filter((tc) => !tc._id);

      // Update existing test cases
      await Promise.all(existing.map((tc) => updateTestCase(tc._id, tc)));

      // Create new test cases
      if (newTCs.length > 0) {
        await createManyTestCases({
          problemId: id,
          testCases: newTCs,
        });
      }

      alert('Problem updated successfully!');
      navigate(`/problems/${id}`);
    } catch (err) {
      console.error(err);
      alert('Error updating problem');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading problem...</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-24 bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Update Problem</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Problem fields same as create page */}
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Problem Statement</label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              required
              rows={6}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Constraints</label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={3}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block font-medium mb-1">Time Limit (ms)</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Memory Limit (MB)
              </label>
              <input
                type="number"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(Number(e.target.value))}
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Test Cases */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Test Cases</h2>
            {testCases.map((tc, index) => (
              <div
                key={index}
                className="mb-4 p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Test Case {index + 1}</span>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block font-medium mb-1">Input</label>
                  <input
                    type="text"
                    value={tc.stdin}
                    onChange={(e) =>
                      handleTestCaseChange(index, 'stdin', e.target.value)
                    }
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Output</label>
                  <input
                    type="text"
                    value={tc.stdout}
                    onChange={(e) =>
                      handleTestCaseChange(index, 'stdout', e.target.value)
                    }
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTestCase}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              + Add Test Case
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Update Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
