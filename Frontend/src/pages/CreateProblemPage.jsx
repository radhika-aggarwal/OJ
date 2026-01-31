import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createProblem, createManyTestCases } from '../services/api';

export default function CreateProblemPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [constraints, setConstraints] = useState('');
  const [timeLimit, setTimeLimit] = useState(1000);
  const [memoryLimit, setMemoryLimit] = useState(256);

  const [testCases, setTestCases] = useState([
    { stdin: '', stdout: '', visibility: true, executionNum: 1 },
  ]);

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
      const problemRes = await createProblem({
        title,
        statement,
        difficulty,
        constraints,
        timeLimit,
        memoryLimit,
      });

      const problemId = problemRes.data.problem._id;

      await createManyTestCases({
        problemId,
        testCases,
      });

      alert('Problem created successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error creating problem');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-24 bg-gray-100 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Create New Problem</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
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

          {/* Statement */}
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

          {/* Difficulty */}
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

          {/* Constraints */}
          <div>
            <label className="block font-medium mb-1">Constraints</label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={3}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Time & Memory */}
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

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
