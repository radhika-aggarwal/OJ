import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { compiler } from '../services/api';

{
  /* Boilerplate Templates*/
}
const BOILERPLATES = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);

    string line;
    while(getline(cin, line)) {
        cout << line << endl;
    }

    return 0;
}
`,
  python: `import sys

for line in sys.stdin:
    print(line.strip())
`,
  js: `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

rl.on('line', (line) => {
    console.log(line);
});
`,
};

export default function Compiler() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(BOILERPLATES.cpp);
  const [customInput, setCustomInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [output, setOutput] = useState('');
  const [hasUserEdited, setHasUserEdited] = useState(false);

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

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);

    if (!hasUserEdited) {
      setCode(BOILERPLATES[newLang]);
    }
  };

  const resetCode = () => {
    setCode(BOILERPLATES[language]);
    setHasUserEdited(false);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <div className="flex-1 pt-20 px-6 pb-6">
        <div className="h-full grid grid-cols-2 gap-6">
          {/* LEFT: CODE EDITOR */}
          <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden">
            {/* Toolbar */}
            <div className="h-12 px-4 flex items-center justify-between border-b bg-gray-50">
              <span className="text-xs font-semibold tracking-widest text-gray-500">
                CODE
              </span>

              <div className="flex items-center gap-3">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="text-sm border rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="cpp">C++</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>

                <button
                  onClick={resetCode}
                  className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  Reset
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
                >
                  {isProcessing ? 'Running…' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* Editor */}
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setHasUserEdited(true);
              }}
              spellCheck="false"
              placeholder="// Write your code here..."
              className="flex-1 p-4 font-mono text-sm bg-gray-50 focus:outline-none resize-none"
            />
          </div>

          {/* RIGHT: INPUT + OUTPUT */}
          <div className="flex flex-col gap-6">
            {/* Input */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-xs font-semibold text-gray-500 tracking-widest mb-2">
                INPUT
              </div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Custom input (stdin)"
                className="w-full h-28 p-3 font-mono text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Output */}
            <div className="flex-1 bg-gray-900 rounded-xl shadow-md overflow-hidden">
              <div className="h-12 px-4 flex items-center border-b border-gray-700">
                <span className="text-xs font-semibold tracking-widest text-gray-400">
                  OUTPUT
                </span>

                {isOutputOpen && (
                  <button
                    onClick={() => setIsOutputOpen(false)}
                    className="ml-auto text-gray-400 hover:text-gray-200"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="p-4 text-sm font-mono overflow-auto h-full">
                {!isOutputOpen && (
                  <div className="text-gray-500">Run code to see output.</div>
                )}

                {isProcessing && (
                  <div className="text-yellow-400 animate-pulse">
                    Executing...
                  </div>
                )}

                {errorMessage && (
                  <pre className="text-red-400 bg-red-900/30 p-3 rounded">
                    {errorMessage}
                  </pre>
                )}

                {output && (
                  <pre className="text-green-400 whitespace-pre-wrap">
                    {output}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
