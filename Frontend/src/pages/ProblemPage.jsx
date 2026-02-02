import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getProblemById,
  getTestCasesByProblemId,
  submitCode,
} from '../services/api';

export default function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('cpp');
  const [finalOutput, setFinalOutput] = useState('');
  const [submit, setSubmit] = useState(false);

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

  if (!problem) {
    return <p className="text-center mt-10">Problem not found</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await submitCode({
        language,
        code,
      });
      setLoading(false);
      setFinalOutput(response.output);
      setSubmit(true);
    } catch (err) {
      console.error(err);
      setFinalOutput(err.message);
      setLoading(false);
      setSubmit(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="h-[calc(100vh-80px)] mt-20 flex">
        {/* Left Panel: Problem Details */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {problem.title}
              </h1>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
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
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Problem Statement
              </h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {problem.statement}
              </p>
            </section>

            {/* Constraints */}
            {problem.constraints && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                  Constraints
                </h2>
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-600 whitespace-pre-line font-mono text-sm">
                    {problem.constraints}
                  </p>
                </div>
              </section>
            )}

            {/* Sample Test Cases */}
            {testCases.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">
                  Sample Test Cases
                </h2>
                <div className="space-y-4">
                  {testCases.map((tc, index) => (
                    <div
                      key={tc._id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                        <p className="font-semibold text-gray-700">
                          Example {index + 1}
                        </p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Input
                          </span>
                          <pre className="mt-1 bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                            {tc.stdin}
                          </pre>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            Output
                          </span>
                          <pre className="mt-1 bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
                            {tc.stdout}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Code Editor
            </h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="js">JavaScript</option>
            </select>
          </div>

          {/* Code Textarea */}
          <div className="flex-1 p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 bg-white text-gray-800 font-mono text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300"
              placeholder="// Write your code here..."
              spellCheck="false"
            />
          </div>

          {/* Action Bar */}
          <div className="px-4 py-3 bg-gray-100 border-t border-gray-200">
            <button
              className="w-full bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Running...' : 'Run Code'}
            </button>
          </div>

          {/* Output Panel */}
          {submit && (
            <div className="border-t border-gray-200 bg-gray-100">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Output
                </h3>
              </div>
              <div className="p-4 max-h-48 overflow-y-auto">
                <pre className="bg-white text-gray-800 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap border border-gray-300">
                  {finalOutput}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
