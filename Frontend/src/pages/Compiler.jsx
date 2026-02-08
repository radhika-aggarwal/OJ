import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { compiler } from '../services/api';

export default function Compiler() {
  const [code, setCode] = useState('// Write your code here\n');
  const [language, setLanguage] = useState('cpp');
  const [customInput, setCustomInput] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [output, setOutput] = useState('');

  const handleRunCode = async () => {
    setIsProcessing(true);
    setIsOutputOpen(true);
    setErrorMessage('');
    setOutput('');

    try {
      const response = await compiler({
        language,
        code,
        input: customInput, 
      });

      setOutput(response.output || '');
    } catch (err) {
      setErrorMessage(err.message || 'Compilation error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex pt-20">
        {/* LEFT: CODE EDITOR */}
        <div className="w-1/2 h-full flex flex-col border-r border-gray-200 bg-white">
          {/* Header */}
          <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Compiler
            </span>

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

          {/* Custom Input */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-500 uppercase mb-2">
              Custom Input (stdin)
            </div>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter input here (optional)"
              className="w-full h-24 p-3 font-mono text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="p-3 bg-white border-t border-gray-200 flex justify-end">
            <button
              onClick={handleRunCode}
              disabled={isProcessing}
              className="px-6 py-2 rounded bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isProcessing ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>

        {/* RIGHT: OUTPUT PANEL */}
        <div className="w-1/2 h-full flex flex-col bg-white">
          <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Output
            </span>

            {isOutputOpen && (
              <button
                onClick={() => setIsOutputOpen(false)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex-1 p-4 overflow-auto">
            {!isOutputOpen && (
              <div className="text-gray-400 text-sm">
                Run code to see output.
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 text-red-600 font-mono bg-red-50 p-3 rounded border border-red-200">
                {errorMessage}
              </div>
            )}

            {output && (
              <pre className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap">
                {output}
              </pre>
            )}

            {isProcessing && (
              <div className="animate-pulse text-gray-500">
                Executing code...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
