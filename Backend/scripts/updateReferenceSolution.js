import 'dotenv/config';
import { connectDB } from '../database/db.js';
import Problem from '../models/problemModel.js';

const PROBLEM_ID = '69822e933ae09729f5a9c141'; // change if needed

const newCppRef = `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  vector<string> tokens;
  string t;
  while (cin >> t) tokens.push_back(t);
  if (tokens.empty()) return 0;

  // If first token is an integer and following tokens provide characters, handle that format
  bool firstIsInt = all_of(tokens[0].begin(), tokens[0].end(), ::isdigit);
  if (firstIsInt) {
    int n = stoi(tokens[0]);
    if ((int)tokens.size() - 1 >= n) {
      vector<string> s(tokens.begin() + 1, tokens.begin() + 1 + n);
      reverse(s.begin(), s.end());
      for (int i = 0; i < n; ++i) {
        if (i) cout << ' ';
        cout << s[i];
      }
      return 0;
    }
  }

  // Otherwise treat first token as a single string and reverse its characters
  string s = tokens[0];
  reverse(s.begin(), s.end());
  for (size_t i = 0; i < s.size(); ++i) {
    if (i) cout << ' ';
    cout << s[i];
  }
  return 0;
}
`;

const run = async () => {
  await connectDB();
  const problem = await Problem.findById(PROBLEM_ID);
  if (!problem) {
    console.error('Problem not found', PROBLEM_ID);
    process.exit(1);
  }

  problem.referenceSolutions = [
    {
      language: 'cpp',
      code: newCppRef,
    },
  ];

  await problem.save();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
