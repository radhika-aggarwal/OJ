import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProblemById, getTestCasesByProblemId } from '../services/api';

export default function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('cpp');

  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        const problemRes = await getProblemById(id);
        setProblem(problemRes.data.problem);

        const testCaseRes = await getTestCasesByProblemId(id);
        setTestCases(testCaseRes.data.filter((tc) => tc.visibility === true));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10">Loading problem...</p>;
  }

  if (!problem) {
    return <p className="text-center mt-10">Problem not found</p>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto mt-24 flex gap-6 px-4">
        {/* Left Panel: Problem Details */}
        <div className="w-2/3 bg-gray-100 rounded-xl shadow-lg p-6 overflow-y-auto max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                problem.difficulty === 'Easy'
                  ? 'bg-green-100 text-green-700'
                  : problem.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}
            >
              {problem.difficulty}
            </span>
          </div>

          {/* Problem Statement */}
          <section className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Problem Statement</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {problem.statement}
            </p>
          </section>

          {/* Constraints */}
          {problem.constraints && (
            <section className="mb-4">
              <h2 className="text-lg font-semibold mb-1">Constraints</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {problem.constraints}
              </p>
            </section>
          )}

          {/* Sample Test Cases */}
          {testCases.length > 0 && (
            <section className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Sample Test Cases</h2>
              <div className="space-y-3">
                {testCases.map((tc, index) => (
                  <div
                    key={tc._id}
                    className="bg-gray-50 border rounded-lg p-3"
                  >
                    <p className="font-medium mb-1">Example {index + 1}</p>
                    <p>
                      <span className="font-semibold">Input:</span>{' '}
                      <code className="bg-gray-200 px-1 rounded">
                        {tc.stdin}
                      </code>
                    </p>
                    <p>
                      <span className="font-semibold">Output:</span>{' '}
                      <code className="bg-gray-200 px-1 rounded">
                        {tc.stdout}
                      </code>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-1/3 bg-gray-100 rounded-xl shadow-lg p-6 flex flex-col">
          {/* Language Dropdown */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Select Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          <h2 className="text-lg font-semibold mb-3">Code Editor</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-3 border rounded-lg font-mono text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Run / Submit
          </button>
        </div>
      </div>
    </div>
  );
}
