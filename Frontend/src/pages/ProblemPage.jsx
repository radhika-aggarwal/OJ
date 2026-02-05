import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  getProblemById,
  getTestCasesByProblemId,
  submitCode,
  runCode,
} from '../services/api';

export default function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('cpp');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('testcases');
  const [errorMessage, setErrorMessage] = useState('');

  const [runResults, setRunResults] = useState([]);
  const [activeRunCaseId, setActiveRunCaseId] = useState(0);
  const [submissionData, setSubmissionData] = useState(null);

  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        const problemRes = await getProblemById(id);
        setProblem(problemRes.data.problem);

        const testCaseRes = await getTestCasesByProblemId(id);
        setTestCases(testCaseRes.data.filter((tc) => tc.visibility === true));
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [id]);

  const handleRun = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setIsOutputOpen(true);
    setActiveTab('testcases');
    setErrorMessage('');
    setRunResults([]);
    setActiveRunCaseId(0);

    try {
      const response = await runCode({ language, code, problemId: id });
      setRunResults(response.results || []);
    } catch (err) {
      setErrorMessage(err.message || 'Error executing code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setIsOutputOpen(true);
    setActiveTab('verdict');
    setErrorMessage('');
    setSubmissionData(null);

    try {
      const response = await submitCode({ language, code, problemId: id });
      setSubmissionData(response);
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed');
      setSubmissionData({ verdict: 'Error', results: [] });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!problem)
    return <div className="text-center mt-20">Problem not found</div>;

  const renderVerdictContent = () => {
    if (isProcessing)
      return <div className="animate-pulse text-gray-500">Submitting...</div>;
    if (!submissionData)
      return (
        <div className="text-gray-400 text-sm">Run submit to see verdict.</div>
      );

    const tests = submissionData.results || submissionData.testResults || [];
    const verdict = submissionData.verdict || 'Unknown';

    if (tests.length === 0) {
      return (
        <div className="text-red-500 text-sm">
          No test cases found in database.
        </div>
      );
    }

    const gridBoxes = [];

    // Loop through results
    for (let i = 0; i < tests.length; i++) {
      const resultItem = tests[i];
      // Handle both object format and string format
      const status =
        typeof resultItem === 'object' ? resultItem.status : resultItem;
      const isPassed = status === 'Accepted';

      gridBoxes.push(
        <div
          key={i}
          className={`
            w-24 h-12 flex items-center justify-center rounded-lg text-white font-bold text-sm shadow-sm 
            transition-transform hover:scale-105 cursor-default
            ${isPassed ? 'bg-green-500' : 'bg-red-500'}
          `}
          title={`Test Case ${i + 1}: ${status}`}
        >
          Test Case {i + 1}
        </div>,
      );

      if (!isPassed) break;
    }

    return (
      <div className="space-y-4">
        <h3
          className={`text-xl font-bold ${verdict === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}
        >
          {verdict}
        </h3>

        <div className="flex flex-wrap gap-3">{gridBoxes}</div>

        {verdict !== 'Accepted' && (
          <p className="text-gray-500 text-sm mt-2">
            Execution stopped at the first failed test case.
          </p>
        )}
      </div>
    );
  };

  const renderTestCasesContent = () => {
    if (isProcessing)
      return <div className="animate-pulse text-gray-500">Running code...</div>;
    if (runResults.length === 0)
      return (
        <div className="text-gray-400 text-sm">
          Run code to see test results.
        </div>
      );

    const activeResult = runResults[activeRunCaseId];
    if (!activeResult) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          {runResults.map((result, i) => {
            const isPassed = result.status === 'Accepted';
            const isActive = activeRunCaseId === i;

            const textColor = isPassed ? 'text-green-600' : 'text-red-600';
            const borderColor = isPassed
              ? 'border-green-500'
              : 'border-red-500';
            const dotColor = isPassed ? 'bg-green-500' : 'bg-red-500';

            return (
              <button
                key={i}
                onClick={() => setActiveRunCaseId(i)}
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-2
                  ${
                    isActive
                      ? `bg-white ${textColor} ${borderColor}`
                      : `text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50`
                  }
                `}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isActive ? dotColor : isPassed ? 'bg-green-400' : 'bg-red-400'}`}
                ></span>
                Case {i + 1}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 font-mono text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Input</p>
            <div className="bg-white p-3 rounded border border-gray-200 text-gray-800 whitespace-pre-wrap">
              {activeResult.input}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Output</p>
            <div
              className={`p-3 rounded border border-gray-200 whitespace-pre-wrap
                   ${
                     activeResult.status === 'Accepted'
                       ? 'bg-white text-gray-800'
                       : 'bg-red-50 text-red-600 border-red-200'
                   }`}
            >
              {activeResult.output}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">Expected</p>
            <div className="bg-white p-3 rounded border border-gray-200 text-gray-800 whitespace-pre-wrap">
              {activeResult.expected}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex pt-20 h-full">
        <div className="w-1/2 h-full overflow-y-auto border-r border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {problem.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                ${
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

          <div className="prose max-w-none text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
            {problem.statement}
          </div>

          {problem.constraints && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase mb-2">
                Constraints
              </h3>
              <ul className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-600 space-y-1">
                {problem.constraints.split('\n').map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">
              Sample Input
            </h3>
            {testCases.map((tc, idx) => (
              <div
                key={idx}
                className="mb-4 bg-gray-50 rounded border border-gray-200 p-3"
              >
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  Input:
                </div>
                <div className="font-mono text-sm text-gray-800 mb-2">
                  {tc.stdin || tc.input}
                </div>
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  Output:
                </div>
                <div className="font-mono text-sm text-gray-800">
                  {tc.stdout || tc.expected}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL*/}
        <div className="w-1/2 h-full flex flex-col">
          {/* Header */}
          <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4">
            <div className="text-xs font-bold text-gray-500 uppercase">
              Solution
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="js">JavaScript</option>
            </select>
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 font-mono text-sm text-gray-800 resize-none focus:outline-none"
              spellCheck="false"
              placeholder="// Write your code here..."
            />
          </div>

          {/* Buttons */}
          <div className="p-3 bg-white border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={handleRun}
              disabled={isProcessing}
              className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm"
            >
              {isProcessing && activeTab === 'testcases'
                ? 'Running...'
                : 'Run Code'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-5 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isProcessing && activeTab === 'verdict'
                ? 'Submitting...'
                : 'Submit'}
            </button>
          </div>

          {/* OUTPUT PANEL */}
          <div
            className={`
            transition-all duration-300 ease-in-out bg-gray-50 border-t border-gray-300 flex flex-col
            ${isOutputOpen ? 'h-72' : 'h-0 overflow-hidden'} 
          `}
          >
            {/* Test Cases vs Verdict */}
            <div className="flex items-center px-4 pt-2 bg-gray-100 border-b border-gray-200 select-none">
              <button
                onClick={() => setActiveTab('testcases')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg mr-2 transition-all
                  ${
                    activeTab === 'testcases'
                      ? 'bg-white text-gray-800 border-t border-l border-r border-gray-200 -mb-px'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Test Cases Result
              </button>
              <button
                onClick={() => setActiveTab('verdict')}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all
                  ${
                    activeTab === 'verdict'
                      ? 'bg-white text-gray-800 border-t border-l border-r border-gray-200 -mb-px'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Verdict
              </button>

              <button
                onClick={() => setIsOutputOpen(false)}
                className="ml-auto text-gray-400 hover:text-gray-600 mb-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-white">
              {errorMessage && (
                <div className="text-red-600 font-mono bg-red-50 p-3 rounded border border-red-200 mb-3">
                  {errorMessage}
                </div>
              )}

              {activeTab === 'testcases' && renderTestCasesContent()}
              {activeTab === 'verdict' && renderVerdictContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
