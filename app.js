/* OmniLang IDE — Main Application with Auth, Settings, Admin */
/* global require, monaco */

(function () {
  "use strict";

  // ========== AUTH SYSTEM ==========
  var AuthDB = {
    users: [
      {
        id: 1,
        name: "Admin",
        email: "jgelet@macrotechtitan.com",
        password: "admin123",
        role: "admin",
        plan: "team",
        createdAt: "2025-01-15T08:00:00Z",
        lastActive: "2026-03-08T06:50:00Z",
        projects: 12,
        bio: "Platform administrator",
        settings: { fontSize: 14, tabSize: 2, theme: "dark", minimap: true, wordWrap: false, lineNumbers: true, autoSave: true, fontFamily: "JetBrains Mono", aiModel: "gpt-4o", apiKey: "", temperature: 0.7, maxTokens: 4096, aiAutocomplete: true },
      },
      {
        id: 2,
        name: "Demo User",
        email: "demo@omnilang.dev",
        password: "demo123",
        role: "user",
        plan: "pro",
        createdAt: "2025-06-20T10:00:00Z",
        lastActive: "2026-03-07T22:30:00Z",
        projects: 5,
        bio: "OmniLang enthusiast",
        settings: { fontSize: 14, tabSize: 2, theme: "dark", minimap: true, wordWrap: false, lineNumbers: true, autoSave: true, fontFamily: "JetBrains Mono", aiModel: "claude-3.5-sonnet", apiKey: "", temperature: 0.7, maxTokens: 4096, aiAutocomplete: true },
      },
    ],
    nextId: 3,
    currentUser: null,

    findByEmail: function (email) {
      return this.users.find(function (u) { return u.email === email; }) || null;
    },

    createUser: function (name, email, password) {
      if (this.findByEmail(email)) return null;
      var user = {
        id: this.nextId++,
        name: name,
        email: email,
        password: password,
        role: "user",
        plan: "free",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        projects: 0,
        bio: "",
        settings: { fontSize: 14, tabSize: 2, theme: "dark", minimap: true, wordWrap: false, lineNumbers: true, autoSave: true, fontFamily: "JetBrains Mono", aiModel: "gpt-4o", apiKey: "", temperature: 0.7, maxTokens: 4096, aiAutocomplete: true },
      };
      this.users.push(user);
      return user;
    },

    authenticate: function (email, password) {
      var user = this.findByEmail(email);
      if (user && user.password === password) {
        user.lastActive = new Date().toISOString();
        this.currentUser = user;
        return user;
      }
      return null;
    },

    isAdmin: function () {
      return this.currentUser && this.currentUser.email === "jgelet@macrotechtitan.com";
    },
  };

  // ========== ADMIN DEMO DATA ==========
  var AdminData = {
    stats: { totalUsers: 127, activeUsers: 43, totalProjects: 312, totalDeployments: 89, mrr: 4230, aiTokens: 1200000 },
    recentActivity: [
      { dot: "var(--accent-green)", text: "Sarah Chen deployed \"weather-app\" to Vercel", time: "2m ago" },
      { dot: "var(--accent-blue)", text: "Mike Johnson created new project \"api-gateway\"", time: "8m ago" },
      { dot: "var(--accent-purple)", text: "Admin updated feature flags", time: "15m ago" },
      { dot: "var(--accent-orange)", text: "Lisa Park upgraded to Pro plan", time: "22m ago" },
      { dot: "var(--accent-green)", text: "Alex Rivera deployed \"e-commerce\" to DigitalOcean", time: "34m ago" },
      { dot: "var(--accent-blue)", text: "Emma Wilson signed up", time: "45m ago" },
      { dot: "var(--accent-red)", text: "Build failed for \"data-pipeline\" on AWS", time: "52m ago" },
      { dot: "var(--accent-green)", text: "Tom Anderson completed security audit", time: "1h ago" },
      { dot: "var(--accent-purple)", text: "System: AI API rate limit threshold at 80%", time: "1.5h ago" },
      { dot: "var(--accent-blue)", text: "Raj Patel created new agent \"Code Optimizer\"", time: "2h ago" },
      { dot: "var(--accent-green)", text: "Julia Martinez deployed \"portfolio\" to Netlify", time: "2.5h ago" },
      { dot: "var(--accent-orange)", text: "3 users exported their data", time: "3h ago" },
    ],
    demoUsers: [
      { id: 3, name: "Sarah Chen", email: "sarah@techcorp.io", role: "user", plan: "pro", projects: 8, lastActive: "2m ago", status: "active" },
      { id: 4, name: "Mike Johnson", email: "mike@devstudio.com", role: "user", plan: "team", projects: 15, lastActive: "8m ago", status: "active" },
      { id: 5, name: "Lisa Park", email: "lisa@startup.io", role: "user", plan: "pro", projects: 6, lastActive: "22m ago", status: "active" },
      { id: 6, name: "Alex Rivera", email: "alex@agency.dev", role: "user", plan: "pro", projects: 11, lastActive: "34m ago", status: "active" },
      { id: 7, name: "Emma Wilson", email: "emma@design.co", role: "user", plan: "free", projects: 1, lastActive: "45m ago", status: "active" },
      { id: 8, name: "Tom Anderson", email: "tom@security.io", role: "user", plan: "team", projects: 9, lastActive: "1h ago", status: "active" },
      { id: 9, name: "Raj Patel", email: "raj@ml-labs.com", role: "user", plan: "pro", projects: 7, lastActive: "2h ago", status: "active" },
      { id: 10, name: "Julia Martinez", email: "julia@creative.dev", role: "user", plan: "free", projects: 3, lastActive: "2.5h ago", status: "active" },
      { id: 11, name: "David Kim", email: "david@fintech.io", role: "user", plan: "team", projects: 14, lastActive: "3h ago", status: "active" },
      { id: 12, name: "Ana Silva", email: "ana@edtech.com", role: "user", plan: "pro", projects: 5, lastActive: "5h ago", status: "active" },
      { id: 13, name: "Chris Brown", email: "chris@gaming.dev", role: "user", plan: "free", projects: 2, lastActive: "8h ago", status: "inactive" },
      { id: 14, name: "Mia Zhang", email: "mia@robotics.ai", role: "user", plan: "pro", projects: 10, lastActive: "12h ago", status: "inactive" },
      { id: 15, name: "James O'Brien", email: "james@cloud.io", role: "user", plan: "team", projects: 18, lastActive: "1d ago", status: "inactive" },
      { id: 16, name: "Priya Sharma", email: "priya@data.dev", role: "user", plan: "free", projects: 1, lastActive: "2d ago", status: "suspended" },
      { id: 17, name: "Lucas Dubois", email: "lucas@web3.fr", role: "user", plan: "pro", projects: 4, lastActive: "3d ago", status: "inactive" },
    ],
    deployments: [
      { project: "weather-app", user: "Sarah Chen", platform: "Vercel", region: "US East", status: "live", url: "weather-app.vercel.app", deployedAt: "2m ago" },
      { project: "e-commerce", user: "Alex Rivera", platform: "DigitalOcean", region: "EU Frankfurt", status: "live", url: "e-commerce.do-app.com", deployedAt: "34m ago" },
      { project: "portfolio", user: "Julia Martinez", platform: "Netlify", region: "US West", status: "live", url: "julia-portfolio.netlify.app", deployedAt: "2.5h ago" },
      { project: "data-pipeline", user: "David Kim", platform: "AWS", region: "US East", status: "failed", url: "-", deployedAt: "52m ago" },
      { project: "api-gateway", user: "Mike Johnson", platform: "Railway", region: "US West", status: "deploying", url: "-", deployedAt: "8m ago" },
      { project: "ml-service", user: "Raj Patel", platform: "Fly.io", region: "Asia Singapore", status: "live", url: "ml-service.fly.dev", deployedAt: "4h ago" },
      { project: "blog-engine", user: "Tom Anderson", platform: "Vercel", region: "EU Frankfurt", status: "live", url: "blog-engine.vercel.app", deployedAt: "6h ago" },
      { project: "chat-app", user: "Mia Zhang", platform: "DigitalOcean", region: "US East", status: "live", url: "chat-app.do-app.com", deployedAt: "12h ago" },
    ],
    featureFlags: [
      { name: "AI Autocomplete", key: "ai_autocomplete", enabled: true, desc: "AI-powered code completion suggestions" },
      { name: "Agents", key: "agents", enabled: true, desc: "AI agent workflows for automated tasks" },
      { name: "Deployment", key: "deployment", enabled: true, desc: "One-click deployment to cloud providers" },
      { name: "Collaboration", key: "collaboration", enabled: false, desc: "Real-time collaborative editing" },
      { name: "Custom Themes", key: "custom_themes", enabled: true, desc: "User-created editor themes" },
      { name: "API Access", key: "api_access", enabled: false, desc: "REST API for programmatic access" },
    ],
    usersOverTime: [12, 18, 25, 32, 41, 48, 55, 63, 72, 85, 98, 127],
    deploymentsByPlatform: [
      { name: "Vercel", count: 28, color: "#000" },
      { name: "DO", count: 22, color: "#0080ff" },
      { name: "Netlify", count: 15, color: "#00c7b7" },
      { name: "AWS", count: 12, color: "#ff9900" },
      { name: "Railway", count: 7, color: "#a855f7" },
      { name: "Fly.io", count: 5, color: "#7c3aed" },
    ],
  };

  // ========== OMNILANG TRANSPILER ==========
  var Transpiler = {
    errors: [],
    warnings: [],

    transpile: function (code) {
      this.errors = [];
      this.warnings = [];

      var lines = code.split("\n");
      var result = [];
      var i = 0;

      while (i < lines.length) {
        var lineNum = i + 1;
        var line = lines[i];

        if (/^\s*match\s+.+\s*\{/.test(line)) {
          var matchResult = this._transpileMatch(lines, i);
          result.push.apply(result, matchResult.lines);
          i = matchResult.endIndex + 1;
          continue;
        }

        if (/^\s*impl\s+(\w+)\s*\{/.test(line)) {
          var implResult = this._transpileImpl(lines, i);
          result.push.apply(result, implResult.lines);
          i = implResult.endIndex + 1;
          continue;
        }

        if (/\[.*\bfor\b.*\bin\b.*\]/.test(line)) {
          line = this._transpileListComp(line, lineNum);
        }

        line = this._transpileLine(line, lineNum);
        result.push(line);
        i++;
      }

      return result.join("\n");
    },

    _transpileLine: function (line, lineNum) {
      var out = line;

      out = out.replace(
        /^(\s*)#(.*)$/,
        function (_m, indent, comment) { return indent + "//" + comment; }
      );
      out = out.replace(
        /^(.*[^'"\\])\s+#(.*)$/,
        function (_m, code, comment) { return code + " //" + comment; }
      );

      out = out.replace(/f"([^"]*)"/g, function (_m, content) {
        var replaced = content.replace(/\{([^}]+)\}/g, "${$1}");
        return "`" + replaced + "`";
      });
      out = out.replace(/f'([^']*)'/g, function (_m, content) {
        var replaced = content.replace(/\{([^}]+)\}/g, "${$1}");
        return "`" + replaced + "`";
      });

      out = out.replace(
        /^(\s*)(def|func|fn)\s+(\w+)\s*\(/,
        function (_m, indent, _kw, name) { return indent + "function " + name + "("; }
      );

      out = out.replace(
        /^(\s*)(\w+)\s*:=\s*(.+)/,
        function (_m, indent, varName, value) { return indent + "let " + varName + " = " + value; }
      );

      out = out.replace(/^(\s*)let\s+mut\s+/, "$1let ");
      out = out.replace(/\bprint\s*\(/g, "console.log(");
      out = out.replace(/\bprintln!\s*\(/g, "console.log(");
      out = out.replace(/\bfmt\.Println\s*\(/g, "console.log(");
      out = out.replace(/\bConsole\.WriteLine\s*\(/g, "console.log(");
      out = out.replace(/\bSystem\.out\.println\s*\(/g, "console.log(");
      out = out.replace(/\belif\b/g, "else if");
      out = out.replace(/\band\b/g, "&&");
      out = out.replace(/\bor\b/g, "||");
      out = out.replace(/\bnot\s+/g, "!");
      out = out.replace(/\bNone\b/g, "null");
      out = out.replace(/\bnil\b/g, "null");
      out = out.replace(/\bTrue\b/g, "true");
      out = out.replace(/\bFalse\b/g, "false");

      out = out.replace(
        /\blen\(([^)]+)\)/g,
        function (_m, arg) { return arg.trim() + ".length"; }
      );

      out = out.replace(
        /\brange\((\d+)\)/g,
        function (_m, n) { return "Array.from({length: " + n + "}, (_, i) => i)"; }
      );
      out = out.replace(
        /\brange\((\d+),\s*(\d+)\)/g,
        function (_m, start, end) { return "Array.from({length: " + end + " - " + start + "}, (_, i) => i + " + start + ")"; }
      );

      out = out.replace(
        /^(\s*)var\s+(\w+)\s*=/,
        function (_m, indent, name) { return indent + "let " + name + " ="; }
      );

      this._validateLine(out, lineNum);
      return out;
    },

    _transpileListComp: function (line, _lineNum) {
      var match = line.match(/\[([^\]]+)\s+for\s+(\w+)\s+in\s+range\((\d+)\)\]/);
      if (match) {
        var expr = match[1].trim();
        var varName = match[2];
        var n = match[3];
        return line.replace(match[0], "Array.from({length: " + n + "}, (_, " + varName + ") => " + expr + ")");
      }

      var match2 = line.match(/\[([^\]]+)\s+for\s+(\w+)\s+in\s+([^\]]+)\]/);
      if (match2) {
        var expr2 = match2[1].trim();
        var varName2 = match2[2];
        var iterable = match2[3].trim();
        return line.replace(match2[0], iterable + ".map(" + varName2 + " => " + expr2 + ")");
      }

      return line;
    },

    _transpileMatch: function (lines, startIdx) {
      var header = lines[startIdx];
      var matchVar = header.match(/match\s+(\S+)/);
      var varName = matchVar ? matchVar[1].replace(/\s*\{$/, "") : "value";
      var result = [header.replace(/match\s+\S+\s*\{/, "switch (" + varName + ") {")];

      var i = startIdx + 1;
      while (i < lines.length) {
        var line = lines[i];
        if (/^\s*\}/.test(line)) {
          result.push(line);
          return { lines: result, endIndex: i };
        }

        var armMatch = line.match(/^(\s*)(\S+)\s*=>\s*(.+?)(?:,?\s*)$/);
        if (armMatch) {
          var indent = armMatch[1];
          var pattern = armMatch[2];
          var body = armMatch[3];
          if (pattern === "_") {
            result.push(indent + "default: " + body + "; break;");
          } else {
            result.push(indent + "case " + pattern + ": " + body + "; break;");
          }
        } else {
          result.push(line);
        }
        i++;
      }

      return { lines: result, endIndex: i - 1 };
    },

    _transpileImpl: function (lines, startIdx) {
      var header = lines[startIdx];
      var implMatch = header.match(/impl\s+(\w+)\s*\{/);
      var className = implMatch ? implMatch[1] : "MyClass";
      var result = [];
      var i = startIdx + 1;
      var self = this;

      while (i < lines.length) {
        var line = lines[i];
        if (/^\s*\}$/.test(line) && self._isBlockEnd(lines, startIdx, i)) {
          return { lines: result, endIndex: i };
        }

        var converted = line.replace(
          /^(\s*)(fn|def|func)\s+(\w+)\s*\(/,
          function (_m, ind, _kw, name) { return ind + className + ".prototype." + name + " = function("; }
        );

        converted = converted.replace(/\bself\./g, "this.");
        result.push(converted);
        i++;
      }

      return { lines: result, endIndex: i - 1 };
    },

    _isBlockEnd: function (lines, startIdx, currentIdx) {
      var depth = 0;
      for (var i = startIdx; i <= currentIdx; i++) {
        var opens = (lines[i].match(/\{/g) || []).length;
        var closes = (lines[i].match(/\}/g) || []).length;
        depth += opens - closes;
      }
      return depth === 0;
    },

    _validateLine: function (line, lineNum) {
      var stripped = line.replace(/\\['"]/g, "");
      var singles = (stripped.match(/'/g) || []).length;
      var doubles = (stripped.match(/"/g) || []).length;
      if (singles % 2 !== 0) {
        this.warnings.push({ line: lineNum, message: "Possibly unclosed string", severity: "warning" });
      }
      if (doubles % 2 !== 0) {
        this.warnings.push({ line: lineNum, message: "Possibly unclosed string", severity: "warning" });
      }
    },
  };

  // ========== VIRTUAL FILESYSTEM ==========
  var FileSystem = {
    files: {},
    init: function (projectFiles) {
      this.files = {};
      var self = this;
      Object.keys(projectFiles).forEach(function (path) {
        self.files[path] = { content: projectFiles[path], type: self._getType(path) };
      });
    },
    _getType: function (path) { return path.endsWith("/") ? "folder" : "file"; },
    getFile: function (path) { return this.files[path] || null; },
    setFile: function (path, content) { this.files[path] = { content: content, type: "file" }; },
    deleteFile: function (path) {
      delete this.files[path];
      var prefix = path.endsWith("/") ? path : path + "/";
      var self = this;
      Object.keys(self.files).forEach(function (key) { if (key.indexOf(prefix) === 0) delete self.files[key]; });
    },
    createFolder: function (path) {
      if (!path.endsWith("/")) path += "/";
      this.files[path] = { content: "", type: "folder" };
    },
    listDir: function (dirPath) {
      if (dirPath && !dirPath.endsWith("/")) dirPath += "/";
      var items = new Set();
      var self = this;
      Object.keys(self.files).forEach(function (path) {
        if (dirPath && path.indexOf(dirPath) !== 0) return;
        if (path === dirPath) return;
        var relative = dirPath ? path.slice(dirPath.length) : path;
        var parts = relative.split("/");
        if (parts.length === 1 || (parts.length === 2 && parts[1] === "")) items.add(path);
      });
      return Array.from(items).sort(function (a, b) {
        var aIsDir = a.endsWith("/");
        var bIsDir = b.endsWith("/");
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
      });
    },
    getFileName: function (path) {
      var clean = path.replace(/\/$/, "");
      var parts = clean.split("/");
      return parts[parts.length - 1];
    },
    getExtension: function (path) {
      var name = this.getFileName(path);
      var idx = name.lastIndexOf(".");
      return idx >= 0 ? name.slice(idx) : "";
    },
  };

  // ========== SAMPLE PROJECTS ==========
  var SampleProjects = {
    "hello-world": {
      name: "Hello World",
      emoji: "\u{1F44B}",
      description: "Basic OmniLang demo showing syntax from Python, Go, Rust, and more",
      files: {
        "main.ol": '# OmniLang Hello World\n# This demonstrates syntax from multiple languages\n\n# Python-style function\ndef greet(name) {\n  print(f"Hello, {name}!")\n}\n\n# Go-style short declaration\nresult := 42\nprint(f"The answer is {result}")\n\n# Rust-style function\nfn add(a, b) {\n  return a + b\n}\n\n# Python booleans and None\nlet active = True\nlet data = None\n\nif active and data == None {\n  print("Active but no data yet")\n}\n\n# List comprehension\nlet squares = [x * x for x in range(10)]\nprint("Squares:")\nprint(squares)\n\n# Go-style function\nfunc multiply(a, b) {\n  return a * b\n}\n\n# Call our functions\ngreet("OmniLang")\nprint(f"3 + 4 = {add(3, 4)}")\nprint(f"6 * 7 = {multiply(6, 7)}")\nprint(f"Length of squares: {len(squares)}")\n\n# Match expression (Rust-style)\nlet status = "success"\nmatch status {\n  "success" => print("Operation completed!"),\n  "error" => print("Something went wrong"),\n  _ => print("Unknown status"),\n}\n',
        "utils.ol": "# Utility functions for OmniLang\n\ndef capitalize(str) {\n  return str.charAt(0).toUpperCase() + str.slice(1)\n}\n\ndef repeat(str, times) {\n  let result := \"\"\n  for (let i = 0; i < times; i++) {\n    result += str\n  }\n  return result\n}\n\nfn max(a, b) {\n  if a > b { return a }\n  return b\n}\n\nfn min(a, b) {\n  if a < b { return a }\n  return b\n}\n",
        "styles.css": "/* OmniLang Project Styles */\nbody {\n  font-family: sans-serif;\n  padding: 20px;\n  background: #0d1117;\n  color: #e6edf3;\n}\n\n.container {\n  max-width: 800px;\n  margin: 0 auto;\n}\n",
        "index.html": '<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello OmniLang</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div class="container">\n    <h1>Hello OmniLang!</h1>\n    <p>This project demonstrates the OmniLang superset language.</p>\n  </div>\n</body>\n</html>\n',
      },
    },
    "todo-app": {
      name: "Todo App", emoji: "\u{2705}", description: "A todo list app demonstrating Python-like syntax in OmniLang",
      files: { "main.ol": '# Todo App in OmniLang\n\nlet todos = []\nlet nextId := 1\n\ndef addTodo(text) {\n  let todo := { id: nextId, text: text, done: False }\n  nextId += 1\n  todos.push(todo)\n  print(f"Added: {text}")\n  return todo\n}\n\ndef completeTodo(id) {\n  for (let i = 0; i < len(todos); i++) {\n    if todos[i].id == id {\n      todos[i].done = True\n      print(f"Completed: {todos[i].text}")\n      return True\n    }\n  }\n  return False\n}\n\naddTodo("Learn OmniLang")\naddTodo("Build a web app")\naddTodo("Deploy to production")\ncompleteTodo(1)\n' },
    },
    "api-client": {
      name: "API Client", emoji: "\u{1F310}", description: "HTTP client demo using Go-like syntax",
      files: { "main.ol": '# API Client in OmniLang\nbaseUrl := "https://jsonplaceholder.typicode.com"\n\nfunc getUsers() {\n  url := f"{baseUrl}/users"\n  fmt.Println(f"[GET] {url}")\n  let users := [\n    { id: 1, name: "Alice", email: "alice@example.com" },\n    { id: 2, name: "Bob", email: "bob@example.com" },\n  ]\n  fmt.Println(f"Fetched {len(users)} users")\n  return users\n}\n\nlet users = getUsers()\nfor (let i = 0; i < len(users); i++) {\n  fmt.Println(f"  {users[i].name} <{users[i].email}>")\n}\n' },
    },
    "data-processing": {
      name: "Data Processing", emoji: "\u{1F4CA}", description: "Pattern matching and data operations using Rust-like syntax",
      files: { "main.ol": '# Data Processing in OmniLang\n\nfn parseStatus(code) {\n  match code {\n    200 => return "OK",\n    404 => return "Not Found",\n    500 => return "Server Error",\n    _ => return "Unknown",\n  }\n}\n\nlet codes = [200, 404, 500, 418]\nfor (let i = 0; i < len(codes); i++) {\n  println!(f"HTTP {codes[i]}: {parseStatus(codes[i])}")\n}\n' },
    },
    blank: {
      name: "Blank Project", emoji: "\u{1F4DD}", description: "Start from scratch with an empty OmniLang file",
      files: { "main.ol": "# Your OmniLang code here\n\n" },
    },
  };

  // ========== AI ASSISTANT ==========
  var AIAssistant = {
    responses: {
      explain: ['This code defines a function using OmniLang\'s multi-language syntax. The <code>def</code> keyword (from Python) creates a function declaration, which transpiles to JavaScript\'s <code>function</code> keyword.\n\nThe <code>:=</code> operator (from Go) is a short variable declaration that transpiles to <code>let</code>.'],
      fix: ['I found the issue. It looks like there\'s a missing closing brace. Make sure every <code>{</code> has a matching <code>}</code>.'],
      generate: ['Here\'s a sorting function in OmniLang:\n\n<pre><code># Bubble sort in OmniLang\ndef bubbleSort(arr) {\n  n := len(arr)\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if arr[j] > arr[j + 1] {\n        let temp = arr[j]\n        arr[j] = arr[j + 1]\n        arr[j + 1] = temp\n      }\n    }\n  }\n  return arr\n}</code></pre>'],
      refactor: ["Here are some suggestions to improve this code:\n\n1. <strong>Use descriptive variable names</strong>\n2. <strong>Extract repeated logic</strong> into helper functions\n3. <strong>Use list comprehensions</strong> where possible"],
      document: ['Here\'s documentation for your code:\n\n<pre><code># Module: main.ol\n# Description: Main entry point\n#\n# Functions:\n#   greet(name) - Prints a greeting\n#   add(a, b) - Returns sum\n</code></pre>'],
    },
    getResponse: function (type, context) {
      var pool = this.responses[type] || this.responses.explain;
      var response = pool[Math.floor(Math.random() * pool.length)];
      if (context && context.length > 0) {
        var firstLine = context.split("\n")[0].trim();
        if (firstLine.length > 0) {
          response = "Analyzing your code starting with <code>" + this._escapeHtml(firstLine.substring(0, 50)) + "</code>...\n\n" + response;
        }
      }
      return response;
    },
    getChatResponse: function (message) {
      var lower = message.toLowerCase();
      if (lower.indexOf("how") !== -1 && lower.indexOf("function") !== -1) {
        return 'In OmniLang, you can define functions using any of these keywords:\n\n<pre><code># Python-style\ndef myFunc(a, b) { return a + b }\n\n# Go-style\nfunc myFunc(a, b) { return a + b }\n\n# Rust-style\nfn myFunc(a, b) { return a + b }</code></pre>';
      }
      if (lower.indexOf("variable") !== -1 || lower.indexOf("declare") !== -1) {
        return "OmniLang offers several ways to declare variables:\n\n<pre><code># Go-style\nx := 5\n\n# Rust-style\nlet immutable = 10\nlet mut mutable = 20\n\n# C#/Java style\nvar count = 0</code></pre>";
      }
      return 'OmniLang is designed to let you write in whichever style you\'re most comfortable with. Key features: <code>def</code>/<code>func</code>/<code>fn</code> for functions, <code>:=</code> for short declarations, <code>print()</code> for output, list comprehensions, and pattern matching with <code>match</code>.';
    },
    _escapeHtml: function (str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
  };

  // ========== HOSTING & DATABASE CONFIG ==========
  var HostingServices = [
    { name: "DigitalOcean", icon: "\u25CF", color: "#0080ff", textColor: "#fff", connected: false },
    { name: "Vercel", icon: "\u25B2", color: "#000", textColor: "#fff", connected: false },
    { name: "Netlify", icon: "\u25C6", color: "#00c7b7", textColor: "#fff", connected: false },
    { name: "AWS", icon: "\u2601", color: "#ff9900", textColor: "#000", connected: false },
    { name: "Railway", icon: "\u25A0", color: "#a855f7", textColor: "#fff", connected: false },
    { name: "Render", icon: "\u25C8", color: "#46e3b7", textColor: "#000", connected: false },
    { name: "Fly.io", icon: "\u2708", color: "#7c3aed", textColor: "#fff", connected: false },
    { name: "GitHub Pages", icon: "\u2B22", color: "#333", textColor: "#fff", connected: false },
  ];

  var DatabaseServices = [
    { name: "PostgreSQL", icon: "\u{1F418}", placeholder: "postgresql://user:pass@host/db", connected: false },
    { name: "MongoDB", icon: "\u{1F343}", placeholder: "mongodb+srv://user:pass@cluster.net/db", connected: false },
    { name: "MySQL", icon: "\u{1F42C}", placeholder: "mysql://user:pass@host/db", connected: false },
    { name: "Redis", icon: "\u{1F534}", placeholder: "redis://default:pass@host:6379", connected: false },
    { name: "SQLite", icon: "\u{1F4E6}", placeholder: "./data/app.sqlite", connected: false },
    { name: "Firebase", icon: "\u{1F525}", placeholder: "https://project.firebaseio.com", connected: false },
  ];

  var AIAgents = [
    { name: "Code Review Agent", icon: "\u{1F50D}", desc: "Analyzes code quality and best practices", status: "idle" },
    { name: "Testing Agent", icon: "\u{1F9EA}", desc: "Generates and runs test cases", status: "idle" },
    { name: "Documentation Agent", icon: "\u{1F4DD}", desc: "Auto-generates documentation", status: "idle" },
    { name: "Optimization Agent", icon: "\u26A1", desc: "Finds performance improvements", status: "idle" },
    { name: "Security Audit Agent", icon: "\u{1F6E1}", desc: "Scans for security vulnerabilities", status: "idle" },
    { name: "Refactor Agent", icon: "\u{1F527}", desc: "Suggests code restructuring", status: "idle" },
  ];

  // ========== STATE ==========
  var State = {
    currentMode: "coding",
    currentFile: "main.ol",
    openFiles: ["main.ol"],
    monacoEditor: null,
    monacoReady: false,
    theme: "dark",
    terminalHistory: [],
    terminalHistoryIndex: -1,
    outputLines: [],
    problems: [],
    chatMessages: [],
    selectedAgent: null,
    selectedHosting: null,
    rightCodingTab: "transpiled",
    editorSettings: { fontSize: 14, tabSize: 2, minimap: true, wordWrap: false },
    envVars: [{ key: "NODE_ENV", value: "production" }, { key: "", value: "" }],
    buildLogs: [],
    deployUrl: null,
    currentView: "login",
    adminSection: "dashboard",
    confirmCallback: null,
  };

  // ========== MAIN APP ==========
  var App = {
    init: function () {
      FileSystem.init(SampleProjects["hello-world"].files);

      // Setup login form enter keys
      var self = this;
      setTimeout(function () {
        var signinEmail = document.getElementById("signinEmail");
        var signinPassword = document.getElementById("signinPassword");
        var signupConfirm = document.getElementById("signupConfirm");
        if (signinEmail) signinEmail.addEventListener("keydown", function (e) { if (e.key === "Enter") self.handleSignIn(); });
        if (signinPassword) signinPassword.addEventListener("keydown", function (e) { if (e.key === "Enter") self.handleSignIn(); });
        if (signupConfirm) signupConfirm.addEventListener("keydown", function (e) { if (e.key === "Enter") self.handleSignUp(); });
      }, 100);

      // Hide loading splash
      setTimeout(function () {
        var splash = document.getElementById("loadingSplash");
        if (splash) splash.classList.add("hidden");
        setTimeout(function () { if (splash && splash.parentNode) splash.parentNode.removeChild(splash); }, 500);
      }, 800);
    },

    // ===== AUTH =====
    switchLoginTab: function (tab) {
      document.querySelectorAll(".login-tab").forEach(function (t) {
        t.classList.toggle("active", t.dataset.loginTab === tab);
      });
      document.getElementById("signinForm").classList.toggle("active", tab === "signin");
      document.getElementById("signupForm").classList.toggle("active", tab === "signup");
      this.clearLoginMessage();
    },

    showLoginMessage: function (msg, type) {
      var el = document.getElementById("loginMessage");
      if (el) {
        el.textContent = msg;
        el.className = "login-message " + type;
      }
    },

    clearLoginMessage: function () {
      var el = document.getElementById("loginMessage");
      if (el) { el.textContent = ""; el.className = "login-message"; }
    },

    handleSignIn: function () {
      var email = (document.getElementById("signinEmail").value || "").trim();
      var password = document.getElementById("signinPassword").value || "";
      if (!email || !password) { this.showLoginMessage("Please enter email and password", "error"); return; }
      var user = AuthDB.authenticate(email, password);
      if (!user) { this.showLoginMessage("Invalid email or password", "error"); return; }
      this._onLogin(user);
    },

    handleSignUp: function () {
      var name = (document.getElementById("signupName").value || "").trim();
      var email = (document.getElementById("signupEmail").value || "").trim();
      var password = document.getElementById("signupPassword").value || "";
      var confirm = document.getElementById("signupConfirm").value || "";
      if (!name || !email || !password) { this.showLoginMessage("Please fill all fields", "error"); return; }
      if (password !== confirm) { this.showLoginMessage("Passwords do not match", "error"); return; }
      if (password.length < 4) { this.showLoginMessage("Password must be at least 4 characters", "error"); return; }
      var user = AuthDB.createUser(name, email, password);
      if (!user) { this.showLoginMessage("An account with this email already exists", "error"); return; }
      AuthDB.currentUser = user;
      this._onLogin(user);
    },

    _onLogin: function (user) {
      document.getElementById("loginPage").classList.add("hidden");
      setTimeout(function () { document.getElementById("loginPage").style.display = "none"; }, 300);
      document.getElementById("ideRoot").style.display = "grid";

      // Update header
      var avatarEl = document.getElementById("userAvatar");
      if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
      document.getElementById("avatarUserName").textContent = user.name;
      document.getElementById("avatarUserEmail").textContent = user.email;

      // Show admin elements if admin
      var isAdmin = AuthDB.isAdmin();
      document.getElementById("adminBadge").style.display = isAdmin ? "inline-flex" : "none";
      document.getElementById("avatarAdminLink").style.display = isAdmin ? "flex" : "none";

      // Init IDE
      this.renderFileTree();
      this.renderEditorTabs();
      this.initMonaco();
      this.initConsoleResize();
      this.initPanelResize();
      this.initConsoleInput();
      this.initKeyboard();
      this.renderProjectGrid();
      this.renderNewDropdown();
      this.renderRefPanel();
      this.renderAgentsList();
      this.renderDeployServicesList();
      this.initQuestionInput();

      this._addConsoleLine("info", "Welcome to OmniLang IDE v1.0");
      this._addConsoleLine("info", "Logged in as " + user.name + " (" + user.email + ")");

      State.currentView = "ide";
    },

    signOut: function () {
      AuthDB.currentUser = null;
      State.currentView = "login";
      document.getElementById("ideRoot").style.display = "none";
      document.getElementById("settingsPage").classList.remove("active");
      document.getElementById("adminPage").classList.remove("active");
      var loginPage = document.getElementById("loginPage");
      loginPage.style.display = "flex";
      loginPage.classList.remove("hidden");
      document.getElementById("signinEmail").value = "";
      document.getElementById("signinPassword").value = "";
      this.clearLoginMessage();
      this.toggleAvatarDropdown();
    },

    // ===== NAVIGATION =====
    navigateTo: function (view) {
      if (view === "settings") {
        this.renderSettingsPage();
        document.getElementById("settingsPage").classList.add("active");
        document.getElementById("adminPage").classList.remove("active");
        State.currentView = "settings";
      } else if (view === "admin" && AuthDB.isAdmin()) {
        this.renderAdminPage();
        document.getElementById("adminPage").classList.add("active");
        document.getElementById("settingsPage").classList.remove("active");
        State.currentView = "admin";
      } else if (view === "ide") {
        document.getElementById("settingsPage").classList.remove("active");
        document.getElementById("adminPage").classList.remove("active");
        State.currentView = "ide";
        if (State.monacoEditor) setTimeout(function () { State.monacoEditor.layout(); }, 50);
      }
    },

    toggleAvatarDropdown: function () {
      var dd = document.getElementById("avatarDropdown");
      if (dd) dd.classList.toggle("open");
      if (dd && dd.classList.contains("open")) {
        setTimeout(function () {
          function close(e) { if (!dd.contains(e.target) && !e.target.closest("#userAvatar")) { dd.classList.remove("open"); document.removeEventListener("click", close); } }
          document.addEventListener("click", close);
        }, 10);
      }
    },

    // ===== CONFIRMATION =====
    showConfirm: function (title, text, callback) {
      document.getElementById("confirmTitle").textContent = title;
      document.getElementById("confirmText").textContent = text;
      document.getElementById("confirmModal").classList.add("open");
      State.confirmCallback = callback;
    },

    closeConfirm: function () { document.getElementById("confirmModal").classList.remove("open"); State.confirmCallback = null; },
    confirmOk: function () { if (State.confirmCallback) State.confirmCallback(); this.closeConfirm(); },

    // ===== SETTINGS PAGE =====
    renderSettingsPage: function () {
      var user = AuthDB.currentUser;
      if (!user) return;
      var s = user.settings;
      var initials = user.name.split(" ").map(function (w) { return w.charAt(0); }).join("").toUpperCase();

      var html = '<div class="settings-header"><h2>Settings</h2><button class="settings-back-btn" onclick="window.OmniLang.navigateTo(\'ide\')">Back to IDE</button></div>';
      html += '<div class="settings-container">';

      // Profile
      html += '<div class="settings-section"><div class="settings-section-title">Profile</div>';
      html += '<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px"><div class="profile-avatar">' + initials + '</div>';
      html += '<div><div style="font-size:14px;font-weight:600">' + user.name + '</div><div style="font-size:12px;color:var(--text-secondary)">' + user.email + '</div><div style="font-size:11px;color:var(--text-muted);margin-top:2px">Click avatar to change (simulated)</div></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Display Name</div><div class="settings-row-control"><input type="text" value="' + user.name + '" id="settingsName"></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Email<div class="settings-row-desc">Cannot be changed</div></div><div class="settings-row-control"><input type="text" value="' + user.email + '" readonly style="opacity:0.6"></div></div>';
      html += '<div class="settings-row" style="flex-direction:column;align-items:flex-start"><div class="settings-row-label">Bio</div><div class="settings-row-control" style="width:100%;margin-top:6px"><textarea id="settingsBio">' + (user.bio || "") + '</textarea></div></div>';
      html += '<div style="margin-top:12px"><button class="btn-sm primary" onclick="window.OmniLang.saveProfile()">Save Changes</button></div></div>';

      // Editor Preferences
      html += '<div class="settings-section"><div class="settings-section-title">Editor Preferences</div>';
      html += '<div class="settings-row"><div class="settings-row-label">Font Size</div><div class="settings-row-control"><input type="range" min="12" max="24" value="' + s.fontSize + '" id="settingsFontSize" oninput="this.nextElementSibling.textContent=this.value+\'px\'"> <span>' + s.fontSize + 'px</span></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Tab Size</div><div class="settings-row-control"><select id="settingsTabSize"><option value="2"' + (s.tabSize === 2 ? " selected" : "") + '>2 spaces</option><option value="4"' + (s.tabSize === 4 ? " selected" : "") + '>4 spaces</option></select></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Theme</div><div class="settings-row-control"><select id="settingsTheme"><option value="dark"' + (s.theme === "dark" ? " selected" : "") + '>Dark</option><option value="light"' + (s.theme === "light" ? " selected" : "") + '>Light</option><option value="system">System</option></select></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Minimap</div><div class="settings-row-control"><div class="toggle-switch' + (s.minimap ? " on" : "") + '" onclick="this.classList.toggle(\'on\')"></div></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Word Wrap</div><div class="settings-row-control"><div class="toggle-switch' + (s.wordWrap ? " on" : "") + '" onclick="this.classList.toggle(\'on\')"></div></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Line Numbers</div><div class="settings-row-control"><div class="toggle-switch' + (s.lineNumbers ? " on" : "") + '" onclick="this.classList.toggle(\'on\')"></div></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Auto-Save</div><div class="settings-row-control"><div class="toggle-switch' + (s.autoSave ? " on" : "") + '" onclick="this.classList.toggle(\'on\')"></div></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Font Family</div><div class="settings-row-control"><select id="settingsFont"><option value="JetBrains Mono"' + (s.fontFamily === "JetBrains Mono" ? " selected" : "") + '>JetBrains Mono</option><option value="Fira Code"' + (s.fontFamily === "Fira Code" ? " selected" : "") + '>Fira Code</option><option value="Source Code Pro"' + (s.fontFamily === "Source Code Pro" ? " selected" : "") + '>Source Code Pro</option><option value="Cascadia Code"' + (s.fontFamily === "Cascadia Code" ? " selected" : "") + '>Cascadia Code</option></select></div></div>';
      html += '</div>';

      // AI Settings
      html += '<div class="settings-section"><div class="settings-section-title">AI Settings</div>';
      html += '<div class="settings-row"><div class="settings-row-label">AI Model</div><div class="settings-row-control"><select id="settingsAiModel"><option value="gpt-4o"' + (s.aiModel === "gpt-4o" ? " selected" : "") + '>GPT-4o</option><option value="claude-3.5-sonnet"' + (s.aiModel === "claude-3.5-sonnet" ? " selected" : "") + '>Claude 3.5 Sonnet</option><option value="gemini-pro"' + (s.aiModel === "gemini-pro" ? " selected" : "") + '>Gemini Pro</option><option value="local-ollama"' + (s.aiModel === "local-ollama" ? " selected" : "") + '>Local/Ollama</option></select></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">API Key</div><div class="settings-row-control"><input type="password" value="' + (s.apiKey || "") + '" placeholder="sk-..." id="settingsApiKey"></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Temperature</div><div class="settings-row-control"><input type="range" min="0" max="10" value="' + Math.round(s.temperature * 10) + '" id="settingsTemp" oninput="this.nextElementSibling.textContent=(this.value/10).toFixed(1)"> <span>' + s.temperature.toFixed(1) + '</span></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">Max Tokens</div><div class="settings-row-control"><input type="number" value="' + s.maxTokens + '" id="settingsMaxTokens" style="width:80px"></div></div>';
      html += '<div class="settings-row"><div class="settings-row-label">AI Auto-complete</div><div class="settings-row-control"><div class="toggle-switch' + (s.aiAutocomplete ? " on" : "") + '" onclick="this.classList.toggle(\'on\')"></div></div></div>';
      html += '</div>';

      // Connected Services
      html += '<div class="settings-section"><div class="settings-section-title">Connected Services</div>';
      var services = [
        { name: "GitHub", icon: "\u2B22", connected: false, account: "" },
        { name: "DigitalOcean", icon: "\u25CF", connected: false, account: "" },
        { name: "Vercel", icon: "\u25B2", connected: false, account: "" },
      ];
      services.forEach(function (svc) {
        html += '<div class="service-card"><div class="service-card-icon">' + svc.icon + '</div><div class="service-card-info"><div class="service-card-name">' + svc.name + '</div><div class="service-card-status">' + (svc.connected ? "Connected as " + svc.account : "Not connected") + '</div></div><button class="btn-sm" onclick="alert(\'OAuth connection simulated for ' + svc.name + '\')">' + (svc.connected ? "Disconnect" : "Connect") + '</button></div>';
      });
      html += '</div>';

      // Billing
      html += '<div class="settings-section"><div class="settings-section-title">Billing &amp; Plan</div>';
      html += '<div class="plan-grid">';
      var plans = [
        { name: "Free", price: "$0", features: ["1 project", "Basic AI", "Community support"], key: "free" },
        { name: "Pro", price: "$19/mo", features: ["Unlimited projects", "GPT-4o access", "Priority support", "Custom domains"], key: "pro" },
        { name: "Team", price: "$49/mo/seat", features: ["Everything in Pro", "Collaboration", "Shared deployments", "Admin controls"], key: "team" },
      ];
      plans.forEach(function (p) {
        var isCurrent = user.plan === p.key;
        html += '<div class="plan-card' + (isCurrent ? " current" : "") + '"><div class="plan-card-name">' + p.name + '</div><div class="plan-card-price">' + p.price + '</div>';
        p.features.forEach(function (f) { html += '<div class="plan-card-feature">' + f + '</div>'; });
        html += '<button class="plan-card-btn' + (isCurrent ? " active" : "") + '">' + (isCurrent ? "Current Plan" : "Upgrade") + '</button></div>';
      });
      html += '</div></div>';

      // Keyboard Shortcuts
      html += '<div class="settings-section"><div class="settings-section-title">Keyboard Shortcuts</div>';
      html += '<table class="shortcuts-table"><thead><tr><th>Action</th><th>Shortcut</th></tr></thead><tbody>';
      var shortcuts = [
        ["Run Code", "Ctrl + Enter"], ["Save File", "Ctrl + S"], ["New File", "Ctrl + N"], ["Toggle Theme", "Ctrl + Shift + T"],
        ["Find", "Ctrl + F"], ["Replace", "Ctrl + H"], ["Command Palette", "Ctrl + Shift + P"], ["Toggle Terminal", "Ctrl + `"],
      ];
      shortcuts.forEach(function (s) { html += '<tr><td>' + s[0] + '</td><td><span class="kbd">' + s[1] + '</span></td></tr>'; });
      html += '</tbody></table><div style="margin-top:8px"><button class="btn-sm" onclick="alert(\'Shortcuts reset to defaults\')">Reset to Defaults</button></div></div>';

      // Danger Zone
      html += '<div class="settings-section"><div class="settings-section-title" style="color:var(--accent-red)">Danger Zone</div>';
      html += '<div class="danger-zone"><div style="margin-bottom:8px;font-size:12px;color:var(--text-secondary)">These actions are irreversible.</div>';
      html += '<button class="danger-btn" onclick="alert(\'Data export started (simulated)\')">Export All Data</button>';
      html += '<button class="danger-btn" onclick="window.OmniLang.showConfirm(\'Delete Account\',\'This will permanently delete your account and all data. This cannot be undone.\',function(){alert(\'Account deleted (simulated)\');window.OmniLang.signOut()})">Delete Account</button>';
      html += '</div></div>';

      html += '</div>';
      document.getElementById("settingsPage").innerHTML = html;
    },

    saveProfile: function () {
      var user = AuthDB.currentUser;
      if (!user) return;
      var nameInput = document.getElementById("settingsName");
      var bioInput = document.getElementById("settingsBio");
      if (nameInput) user.name = nameInput.value;
      if (bioInput) user.bio = bioInput.value;

      var avatarEl = document.getElementById("userAvatar");
      if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
      document.getElementById("avatarUserName").textContent = user.name;

      this.showConfirm("Saved", "Your profile has been updated.", function () {});
      document.getElementById("confirmModal").classList.add("open");
    },

    // ===== ADMIN PAGE =====
    renderAdminPage: function () {
      if (!AuthDB.isAdmin()) return;

      var html = '<div class="admin-sidebar">';
      html += '<div class="admin-sidebar-header"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg><div><span>OmniLang</span><div class="admin-label">Admin</div></div></div>';

      var navItems = [
        { key: "dashboard", icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 1.75a.25.25 0 00-.25.25v3c0 .138.112.25.25.25h3a.25.25 0 00.25-.25v-3a.25.25 0 00-.25-.25h-3zM6.5 7.75a.25.25 0 00-.25.25v3c0 .138.112.25.25.25h3a.25.25 0 00.25-.25v-3a.25.25 0 00-.25-.25h-3z"/></svg>', label: "Dashboard" },
        { key: "users", icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM2 13c0-2.76 2.24-5 5-5h2c2.76 0 5 2.24 5 5v1H2v-1z"/></svg>', label: "Users" },
        { key: "projects", icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"/></svg>', label: "Projects" },
        { key: "deployments", icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a.75.75 0 01.53.22l2.5 2.5a.75.75 0 01-1.06 1.06L8.75 3.56V8a.75.75 0 01-1.5 0V3.56L6.03 4.78A.75.75 0 014.97 3.72l2.5-2.5A.75.75 0 018 1z"/></svg>', label: "Deployments" },
        { key: "settings", icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a1.5 1.5 0 00-1.5 1.5v.17A6.98 6.98 0 004.2 2.87l-.12-.12a1.5 1.5 0 00-2.12 2.12l.12.12c-.37.71-.63 1.49-.76 2.31H1.5a1.5 1.5 0 000 3h.17c.13.82.39 1.6.76 2.31l-.13.13a1.5 1.5 0 002.12 2.12l.13-.13c.71.37 1.49.63 2.31.76v.01a1.5 1.5 0 003 0v-.01a6.98 6.98 0 002.31-.76l.13.13a1.5 1.5 0 002.12-2.12l-.13-.13c.37-.71.63-1.49.76-2.31h.01a1.5 1.5 0 000-3h-.01a6.98 6.98 0 00-.76-2.31l.13-.13a1.5 1.5 0 00-2.12-2.12l-.13.13A6.98 6.98 0 009.5 1.67V1.5A1.5 1.5 0 008 0z"/></svg>', label: "Platform Settings" },
        { key: "billing", icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M10.75 8a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 01.75-.75zm-3.75.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zM5.25 10.5a.75.75 0 01.75.75v2a.75.75 0 01-1.5 0v-2a.75.75 0 01.75-.75z"/></svg>', label: "Billing" },
        { key: "features", icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.752 1.752 0 011 7.775zM6 5a1 1 0 10-2 0 1 1 0 002 0z"/></svg>', label: "Feature Flags" },
        { key: "system", icon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0113.25 12H2.75A1.75 1.75 0 011 10.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25H2.75zM5.25 15h5.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5z"/></svg>', label: "System" },
      ];

      navItems.forEach(function (item) {
        html += '<button class="admin-nav-item' + (State.adminSection === item.key ? " active" : "") + '" onclick="window.OmniLang.switchAdminSection(\'' + item.key + '\')">' + item.icon + item.label + '</button>';
      });

      html += '<div class="admin-nav-divider"></div>';
      html += '<button class="admin-nav-item" onclick="window.OmniLang.navigateTo(\'ide\')"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"/></svg>Back to IDE</button>';
      html += '</div>';

      html += '<div class="admin-content" id="adminContent"></div>';
      document.getElementById("adminPage").innerHTML = html;
      this.renderAdminSection(State.adminSection);
    },

    switchAdminSection: function (section) {
      State.adminSection = section;
      document.querySelectorAll(".admin-nav-item").forEach(function (el) { el.classList.remove("active"); });
      var btns = document.querySelectorAll(".admin-nav-item");
      var keys = ["dashboard", "users", "projects", "deployments", "settings", "billing", "features", "system"];
      var idx = keys.indexOf(section);
      if (idx >= 0 && btns[idx]) btns[idx].classList.add("active");
      this.renderAdminSection(section);
    },

    renderAdminSection: function (section) {
      var content = document.getElementById("adminContent");
      if (!content) return;
      var d = AdminData;
      var html = "";

      if (section === "dashboard") {
        html += '<div class="admin-page-title">Dashboard</div>';
        html += '<div class="kpi-grid">';
        html += '<div class="kpi-card"><div class="kpi-label">Total Users</div><div class="kpi-value">' + d.stats.totalUsers + '</div><div class="kpi-change up">+12% this month</div></div>';
        html += '<div class="kpi-card"><div class="kpi-label">Active Users (24h)</div><div class="kpi-value">' + d.stats.activeUsers + '</div><div class="kpi-change up">+8% vs yesterday</div></div>';
        html += '<div class="kpi-card"><div class="kpi-label">Total Projects</div><div class="kpi-value">' + d.stats.totalProjects + '</div><div class="kpi-change up">+15 this week</div></div>';
        html += '<div class="kpi-card"><div class="kpi-label">Deployments</div><div class="kpi-value">' + d.stats.totalDeployments + '</div><div class="kpi-change up">+23% this month</div></div>';
        html += '<div class="kpi-card"><div class="kpi-label">Revenue (MRR)</div><div class="kpi-value">$' + d.stats.mrr.toLocaleString() + '</div><div class="kpi-change up">+$380 vs last month</div></div>';
        html += '<div class="kpi-card"><div class="kpi-label">AI Tokens Used</div><div class="kpi-value">1.2M</div><div class="kpi-change down">78% of limit</div></div>';
        html += '</div>';

        // Charts
        html += '<div class="admin-chart-grid">';
        html += '<div class="admin-chart-card"><div class="admin-chart-title">Users Over Time</div><div class="line-chart-area"><svg viewBox="0 0 300 120" preserveAspectRatio="none">';
        var points = d.usersOverTime;
        var maxVal = Math.max.apply(null, points);
        var pathD = "M";
        points.forEach(function (v, i) {
          var x = (i / (points.length - 1)) * 300;
          var y = 120 - (v / maxVal) * 110;
          pathD += (i === 0 ? "" : " L") + x.toFixed(1) + " " + y.toFixed(1);
        });
        var areaD = pathD + " L300 120 L0 120 Z";
        html += '<path d="' + areaD + '" fill="rgba(88,166,255,0.1)" />';
        html += '<path d="' + pathD + '" fill="none" stroke="#58a6ff" stroke-width="2" />';
        html += '</svg></div></div>';

        html += '<div class="admin-chart-card"><div class="admin-chart-title">Deployments by Platform</div><div class="bar-chart">';
        var maxDeploy = Math.max.apply(null, d.deploymentsByPlatform.map(function (p) { return p.count; }));
        d.deploymentsByPlatform.forEach(function (p) {
          var h = Math.max(4, (p.count / maxDeploy) * 100);
          html += '<div class="bar-chart-col"><div class="bar-chart-bar" style="height:' + h + 'px;background:' + p.color + '"></div><div class="bar-chart-label">' + p.name + '</div></div>';
        });
        html += '</div></div></div>';

        // Activity Feed
        html += '<div class="activity-feed"><div class="activity-feed-title">Recent Activity</div>';
        d.recentActivity.forEach(function (a) {
          html += '<div class="activity-item"><div class="activity-dot" style="background:' + a.dot + '"></div><div class="activity-text">' + a.text + '</div><div class="activity-time">' + a.time + '</div></div>';
        });
        html += '</div>';

      } else if (section === "users") {
        html += '<div class="admin-page-title">User Management</div>';
        html += '<div class="admin-filter-bar"><input class="admin-search" placeholder="Search users by name or email..." id="adminUserSearch" oninput="window.OmniLang.filterAdminUsers()"><select class="admin-filter-select" id="adminRoleFilter" onchange="window.OmniLang.filterAdminUsers()"><option value="">All Roles</option><option value="admin">Admin</option><option value="user">User</option></select><select class="admin-filter-select" id="adminPlanFilter" onchange="window.OmniLang.filterAdminUsers()"><option value="">All Plans</option><option value="free">Free</option><option value="pro">Pro</option><option value="team">Team</option></select></div>';
        html += '<div class="admin-table-wrap" id="adminUsersTable">';
        html += this._renderUsersTable(d.demoUsers);
        html += '</div>';

      } else if (section === "projects") {
        html += '<div class="admin-page-title">Projects</div>';
        html += '<div class="admin-filter-bar"><input class="admin-search" placeholder="Search projects..."></div>';
        html += '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Project</th><th>Owner</th><th>Files</th><th>Last Modified</th><th>Deployments</th><th>Status</th></tr></thead><tbody>';
        var projects = [
          ["weather-app", "Sarah Chen", 8, "2m ago", 3, "active"], ["e-commerce", "Alex Rivera", 24, "34m ago", 5, "active"],
          ["portfolio", "Julia Martinez", 6, "2.5h ago", 2, "active"], ["api-gateway", "Mike Johnson", 15, "8m ago", 1, "active"],
          ["data-pipeline", "David Kim", 18, "52m ago", 4, "active"], ["ml-service", "Raj Patel", 12, "4h ago", 2, "active"],
          ["blog-engine", "Tom Anderson", 10, "6h ago", 3, "active"], ["chat-app", "Mia Zhang", 20, "12h ago", 2, "inactive"],
        ];
        projects.forEach(function (p) {
          html += '<tr><td style="font-weight:600">' + p[0] + '</td><td>' + p[1] + '</td><td>' + p[2] + '</td><td>' + p[3] + '</td><td>' + p[4] + '</td><td><span class="badge badge-live">' + p[5] + '</span></td></tr>';
        });
        html += '</tbody></table></div>';

      } else if (section === "deployments") {
        html += '<div class="admin-page-title">Deployments</div>';
        html += '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Project</th><th>User</th><th>Platform</th><th>Region</th><th>Status</th><th>URL</th><th>Deployed</th></tr></thead><tbody>';
        d.deployments.forEach(function (dep) {
          var badgeClass = dep.status === "live" ? "badge-live" : dep.status === "failed" ? "badge-failed" : "badge-deploying";
          html += '<tr><td style="font-weight:600">' + dep.project + '</td><td>' + dep.user + '</td><td>' + dep.platform + '</td><td>' + dep.region + '</td><td><span class="badge ' + badgeClass + '">' + dep.status + '</span></td><td style="font-family:var(--font-mono);font-size:11px;color:var(--accent-blue)">' + dep.url + '</td><td>' + dep.deployedAt + '</td></tr>';
        });
        html += '</tbody></table></div>';

      } else if (section === "settings") {
        html += '<div class="admin-page-title">Platform Settings</div>';
        html += '<div class="admin-form-row"><div class="admin-form-group"><label>Site Name</label><input type="text" value="OmniLang IDE"></div><div class="admin-form-group"><label>Site URL</label><input type="text" value="https://omnilang.dev"></div></div>';
        html += '<div class="admin-form-group"><label>Registration</label><select><option selected>Open Registration</option><option>Invite Only</option><option>Disabled</option></select></div>';
        html += '<div class="admin-form-group"><label>Default User Plan</label><select><option selected>Free</option><option>Pro</option><option>Team</option></select></div>';
        html += '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><div style="font-size:13px;font-weight:600;margin-bottom:12px">AI Provider Settings</div>';
        html += '<div class="admin-form-row"><div class="admin-form-group"><label>Default Model</label><select><option selected>GPT-4o</option><option>Claude 3.5 Sonnet</option><option>Gemini Pro</option></select></div><div class="admin-form-group"><label>Rate Limit (req/min)</label><input type="number" value="60"></div></div>';
        html += '<div class="admin-form-group"><label>OpenAI API Key</label><input type="password" value="sk-...redacted" placeholder="sk-..."></div></div>';
        html += '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><div style="font-size:13px;font-weight:600;margin-bottom:12px">Email Settings (SMTP)</div>';
        html += '<div class="admin-form-row"><div class="admin-form-group"><label>SMTP Host</label><input type="text" value="smtp.sendgrid.net"></div><div class="admin-form-group"><label>SMTP Port</label><input type="number" value="587"></div></div>';
        html += '<div class="admin-form-row"><div class="admin-form-group"><label>Username</label><input type="text" value="apikey"></div><div class="admin-form-group"><label>Password</label><input type="password" value="SG.xxxx"></div></div></div>';
        html += '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><div style="font-size:13px;font-weight:600;margin-bottom:12px">Maintenance Mode</div>';
        html += '<div class="feature-flag-row"><div><div class="feature-flag-name">Enable Maintenance Mode</div><div class="feature-flag-desc">Shows a maintenance page to all non-admin users</div></div><div class="toggle-switch" onclick="this.classList.toggle(\'on\')"></div></div>';
        html += '<div class="admin-form-group" style="margin-top:8px"><label>Maintenance Message</label><textarea>We\'re performing scheduled maintenance. Please check back soon.</textarea></div></div>';
        html += '<div style="margin-top:16px"><button class="btn-sm primary">Save Settings</button></div>';

      } else if (section === "billing") {
        html += '<div class="admin-page-title">Billing &amp; Plans</div>';
        html += '<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">';
        html += '<div class="kpi-card"><div class="kpi-label">MRR</div><div class="kpi-value">$4,230</div></div>';
        html += '<div class="kpi-card"><div class="kpi-label">Free Users</div><div class="kpi-value">78</div></div>';
        html += '<div class="kpi-card"><div class="kpi-label">Pro Users</div><div class="kpi-value">35</div></div>';
        html += '<div class="kpi-card"><div class="kpi-label">Team Users</div><div class="kpi-value">14</div></div>';
        html += '</div>';
        html += '<div style="font-size:13px;font-weight:600;margin-bottom:12px">Recent Transactions</div>';
        html += '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>User</th><th>Plan</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>';
        var txns = [
          ["Lisa Park", "Pro", "$19.00", "Paid", "Mar 8, 2026"], ["Mike Johnson", "Team", "$49.00", "Paid", "Mar 7, 2026"],
          ["David Kim", "Team", "$49.00", "Paid", "Mar 6, 2026"], ["Raj Patel", "Pro", "$19.00", "Paid", "Mar 5, 2026"],
          ["Ana Silva", "Pro", "$19.00", "Paid", "Mar 4, 2026"], ["Mia Zhang", "Pro", "$19.00", "Failed", "Mar 3, 2026"],
        ];
        txns.forEach(function (t) {
          var statusClass = t[3] === "Paid" ? "badge-live" : "badge-failed";
          html += '<tr><td>' + t[0] + '</td><td><span class="badge badge-' + t[1].toLowerCase() + '">' + t[1] + '</span></td><td>' + t[2] + '</td><td><span class="badge ' + statusClass + '">' + t[3] + '</span></td><td>' + t[4] + '</td></tr>';
        });
        html += '</tbody></table></div>';
        html += '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><div style="font-size:13px;font-weight:600;margin-bottom:12px">Stripe Integration</div>';
        html += '<div class="admin-form-row"><div class="admin-form-group"><label>Stripe Public Key</label><input type="text" value="pk_live_..."></div><div class="admin-form-group"><label>Stripe Secret Key</label><input type="password" value="sk_live_..."></div></div></div>';

      } else if (section === "features") {
        html += '<div class="admin-page-title">Feature Flags</div>';
        d.featureFlags.forEach(function (f) {
          html += '<div class="feature-flag-row"><div><div class="feature-flag-name">' + f.name + '</div><div class="feature-flag-desc">' + f.desc + '</div></div><div class="toggle-switch' + (f.enabled ? " on" : "") + '" onclick="this.classList.toggle(\'on\')"></div></div>';
        });
        html += '<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border)"><div style="font-size:13px;font-weight:600;margin-bottom:12px">Per-Plan Feature Matrix</div>';
        html += '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Feature</th><th>Free</th><th>Pro</th><th>Team</th></tr></thead><tbody>';
        d.featureFlags.forEach(function (f) {
          html += '<tr><td>' + f.name + '</td><td>' + (f.enabled ? "\u2713" : "\u2717") + '</td><td>\u2713</td><td>\u2713</td></tr>';
        });
        html += '</tbody></table></div></div>';

      } else if (section === "system") {
        html += '<div class="admin-page-title">System Health</div>';
        var systems = [
          { name: "API Server", status: "healthy", detail: "99.9% uptime, 12ms avg response" },
          { name: "Database (PostgreSQL)", status: "healthy", detail: "Connected, 847 queries/min" },
          { name: "AI Service (OpenAI)", status: "degraded", detail: "Elevated latency, 2.1s avg" },
          { name: "Deployment Pipeline", status: "healthy", detail: "All regions operational" },
          { name: "Redis Cache", status: "healthy", detail: "Hit rate 94%, 2.1GB used" },
          { name: "File Storage (S3)", status: "healthy", detail: "128GB used of 1TB" },
        ];
        systems.forEach(function (s) {
          html += '<div class="health-indicator"><div class="health-dot ' + s.status + '"></div><div class="health-name">' + s.name + '</div><div class="health-status">' + s.detail + '</div></div>';
        });

        html += '<div style="margin-top:20px"><div style="font-size:13px;font-weight:600;margin-bottom:12px">Error Log (Last 24h)</div>';
        html += '<div class="build-log" style="max-height:200px">';
        var errors = [
          "[06:45:12] WARN: AI rate limit approaching 80% threshold",
          "[06:32:08] ERROR: Deployment failed for data-pipeline (build timeout)",
          "[05:15:33] WARN: Slow query detected (users table, 450ms)",
          "[04:22:17] INFO: Automated backup completed successfully",
          "[03:10:05] ERROR: Stripe webhook failed for user #16 (retry scheduled)",
          "[02:45:22] INFO: SSL certificate renewed for omnilang.dev",
          "[01:30:18] WARN: Memory usage at 75% on worker-3",
        ];
        html += errors.join("\n");
        html += '</div></div>';

        html += '<div style="margin-top:20px"><div style="font-size:13px;font-weight:600;margin-bottom:12px">Actions</div>';
        html += '<button class="btn-sm" style="margin-right:8px" onclick="alert(\'Backup initiated (simulated)\')">Create Backup</button>';
        html += '<button class="btn-sm" onclick="alert(\'Cache cleared (simulated)\')">Clear Cache</button></div>';
      }

      content.innerHTML = html;
    },

    _renderUsersTable: function (users) {
      var colors = ["#1f6feb", "#8250df", "#d29922", "#cf222e", "#1a7f37", "#0550ae", "#7c3aed", "#0080ff"];
      var html = '<table class="admin-table"><thead><tr><th></th><th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Projects</th><th>Last Active</th><th>Actions</th></tr></thead><tbody>';
      users.forEach(function (u, i) {
        var initials = u.name.split(" ").map(function (w) { return w.charAt(0); }).join("").toUpperCase();
        var color = colors[i % colors.length];
        html += '<tr><td><div class="mini-avatar" style="background:' + color + '">' + initials + '</div></td>';
        html += '<td style="font-weight:600">' + u.name + '</td>';
        html += '<td style="color:var(--text-secondary)">' + u.email + '</td>';
        html += '<td><span class="badge badge-' + u.role + '">' + u.role + '</span></td>';
        html += '<td><span class="badge badge-' + u.plan + '">' + u.plan + '</span></td>';
        html += '<td>' + u.projects + '</td>';
        html += '<td style="color:var(--text-secondary)">' + u.lastActive + '</td>';
        html += '<td><button class="admin-action-btn">View</button><button class="admin-action-btn danger">Suspend</button></td></tr>';
      });
      html += '</tbody></table>';
      return html;
    },

    filterAdminUsers: function () {
      var search = (document.getElementById("adminUserSearch").value || "").toLowerCase();
      var roleFilter = document.getElementById("adminRoleFilter").value;
      var planFilter = document.getElementById("adminPlanFilter").value;
      var filtered = AdminData.demoUsers.filter(function (u) {
        var matchSearch = !search || u.name.toLowerCase().indexOf(search) !== -1 || u.email.toLowerCase().indexOf(search) !== -1;
        var matchRole = !roleFilter || u.role === roleFilter;
        var matchPlan = !planFilter || u.plan === planFilter;
        return matchSearch && matchRole && matchPlan;
      });
      var tableWrap = document.getElementById("adminUsersTable");
      if (tableWrap) tableWrap.innerHTML = this._renderUsersTable(filtered);
    },

    // ===== MODE SWITCHING =====
    switchMode: function (mode) {
      State.currentMode = mode;
      document.querySelectorAll(".mode-tab").forEach(function (tab) { tab.classList.toggle("active", tab.dataset.mode === mode); });
      document.querySelectorAll(".left-mode-content").forEach(function (el) { el.classList.toggle("active", el.dataset.leftMode === mode); });
      document.querySelectorAll(".right-mode-content").forEach(function (el) { el.classList.toggle("active", el.dataset.rightMode === mode); });
      var modeNames = { question: "Question", coding: "Coding", agents: "Agents", deploy: "Deploy" };
      var footerMode = document.getElementById("footerMode");
      if (footerMode) footerMode.textContent = modeNames[mode] || mode;
      if (State.monacoEditor) setTimeout(function () { State.monacoEditor.layout(); }, 50);
    },

    // ===== FILE TREE =====
    renderFileTree: function () {
      var tree = document.getElementById("fileTree");
      if (!tree) return;
      tree.innerHTML = "";
      var items = FileSystem.listDir("");
      var self = this;
      items.forEach(function (path) { self._renderTreeItem(tree, path, 0); });
      var nameEl = document.getElementById("explorerProjectName");
      var projectInput = document.getElementById("projectName");
      if (nameEl && projectInput) nameEl.textContent = projectInput.value.toUpperCase();
    },

    _renderTreeItem: function (container, path, depth) {
      var isDir = path.endsWith("/");
      var name = FileSystem.getFileName(path);
      var ext = FileSystem.getExtension(path);
      var self = this;
      var item = document.createElement("div");
      item.className = "file-tree-item" + (path === State.currentFile ? " active" : "");
      item.style.paddingLeft = (8 + depth * 16) + "px";

      if (isDir) {
        item.innerHTML = '<div class="file-tree-toggle open"><svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l4 4-4 4z"/></svg></div><div class="file-tree-icon" style="color:var(--accent-blue)">\u{1F4C1}</div><span class="file-tree-name">' + name + "</span>";
        item.onclick = function (e) {
          e.stopPropagation();
          var toggle = item.querySelector(".file-tree-toggle");
          var children = item.nextElementSibling;
          if (toggle) toggle.classList.toggle("open");
          if (children && children.classList.contains("file-tree-children")) children.style.display = children.style.display === "none" ? "block" : "none";
        };
        container.appendChild(item);
        var childContainer = document.createElement("div");
        childContainer.className = "file-tree-children";
        var children = FileSystem.listDir(path);
        children.forEach(function (childPath) { self._renderTreeItem(childContainer, childPath, depth + 1); });
        container.appendChild(childContainer);
      } else {
        var icon = this._getFileIcon(ext);
        item.innerHTML = '<div class="file-tree-icon">' + icon + '</div><span class="file-tree-name">' + name + '</span><div class="file-tree-actions"><div class="file-tree-action" title="Delete"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 01-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg></div></div>';
        item.onclick = function (e) { e.stopPropagation(); self.openFile(path); };
        var deleteBtn = item.querySelector(".file-tree-action");
        if (deleteBtn) deleteBtn.onclick = function (e) { e.stopPropagation(); self.deleteFile(path); };
        container.appendChild(item);
      }
    },

    _getFileIcon: function (ext) {
      var icons = { ".ol": '<span style="color:#58a6ff">OL</span>', ".js": '<span style="color:#f1e05a">JS</span>', ".css": '<span style="color:#563d7c">C</span>', ".html": '<span style="color:#e34c26">H</span>', ".json": '<span style="color:#d29922">{}</span>', ".md": '<span style="color:#8b949e">M</span>' };
      return icons[ext] || '<span style="color:#8b949e">\u25CF</span>';
    },

    // ===== FILE OPERATIONS =====
    openFile: function (path) {
      if (State.openFiles.indexOf(path) === -1) State.openFiles.push(path);
      State.currentFile = path;
      this.renderEditorTabs();
      this.renderFileTree();
      this.loadFileInEditor(path);
    },

    closeFile: function (path) {
      var idx = State.openFiles.indexOf(path);
      if (idx !== -1) State.openFiles.splice(idx, 1);
      if (State.currentFile === path) State.currentFile = State.openFiles.length > 0 ? State.openFiles[State.openFiles.length - 1] : null;
      this.renderEditorTabs();
      this.renderFileTree();
      if (State.currentFile) this.loadFileInEditor(State.currentFile);
    },

    loadFileInEditor: function (path) {
      if (!State.monacoEditor) return;
      var file = FileSystem.getFile(path);
      if (!file) return;
      var ext = FileSystem.getExtension(path);
      var langMap = { ".ol": "omnilang", ".js": "javascript", ".css": "css", ".html": "html", ".json": "json", ".md": "markdown" };
      var lang = langMap[ext] || "plaintext";
      var model = State.monacoEditor.getModel();
      if (model) { monaco.editor.setModelLanguage(model, lang); model.setValue(file.content); }
      var langEl = document.getElementById("footerLang");
      if (langEl) langEl.textContent = ext === ".ol" ? "OmniLang" : lang;
    },

    saveCurrentFile: function () {
      if (!State.monacoEditor || !State.currentFile) return;
      FileSystem.setFile(State.currentFile, State.monacoEditor.getValue());
    },

    createFile: function () {
      var name = prompt("Enter file name (e.g., module.ol):");
      if (!name) return;
      FileSystem.setFile(name, "");
      this.renderFileTree();
      this.openFile(name);
    },

    createFolder: function () {
      var name = prompt("Enter folder name:");
      if (!name) return;
      FileSystem.createFolder(name);
      this.renderFileTree();
    },

    deleteFile: function (path) {
      if (confirm("Delete " + FileSystem.getFileName(path) + "?")) {
        FileSystem.deleteFile(path);
        this.closeFile(path);
        this.renderFileTree();
      }
    },

    // ===== EDITOR TABS =====
    renderEditorTabs: function () {
      var tabs = document.getElementById("editorTabs");
      if (!tabs) return;
      var self = this;
      tabs.innerHTML = "";
      State.openFiles.forEach(function (path) {
        var name = FileSystem.getFileName(path);
        var ext = FileSystem.getExtension(path);
        var icon = self._getFileIcon(ext);
        var isActive = path === State.currentFile;
        var tab = document.createElement("div");
        tab.className = "editor-tab" + (isActive ? " active" : "");
        tab.innerHTML = '<span class="editor-tab-icon">' + icon + "</span>" + name + '<div class="editor-tab-close">\u00D7</div>';
        tab.onclick = function () { self.openFile(path); };
        var close = tab.querySelector(".editor-tab-close");
        if (close) close.onclick = function (e) { e.stopPropagation(); self.closeFile(path); };
        tabs.appendChild(tab);
      });
    },

    // ===== MONACO EDITOR =====
    initMonaco: function () {
      var self = this;
      require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" } });
      require(["vs/editor/editor.main"], function () {
        self._registerOmniLang();
        self._createEditor();
        State.monacoReady = true;
        self.loadFileInEditor(State.currentFile);
      });
    },

    _registerOmniLang: function () {
      monaco.languages.register({ id: "omnilang" });
      monaco.languages.setMonarchTokensProvider("omnilang", {
        keywords: ["def", "func", "fn", "let", "mut", "var", "const", "if", "else", "elif", "for", "while", "return", "match", "impl", "class", "new", "this", "self", "import", "from", "export", "default", "try", "catch", "finally", "throw", "async", "await", "yield", "in", "of", "typeof", "instanceof", "delete", "void", "break", "continue", "switch", "case", "and", "or", "not"],
        builtins: ["True", "False", "None", "nil", "print", "println!", "fmt", "Console", "System", "len", "range"],
        typeKeywords: ["string", "number", "boolean", "object", "array", "function", "undefined", "null"],
        operators: [":=", "=>", "==", "===", "!=", "!==", "<=", ">=", "&&", "||", "**", "+=", "-=", "*=", "/="],
        symbols: /[=><!~?:&|+\-*/^%]+/,
        tokenizer: {
          root: [
            [/#.*$/, "comment"], [/\/\/.*$/, "comment"], [/\/\*/, "comment", "@comment"],
            [/f"/, "string", "@fstring_double"], [/f'/, "string", "@fstring_single"],
            [/"([^"\\]|\\.)*$/, "string.invalid"], [/'([^'\\]|\\.)*$/, "string.invalid"],
            [/"/, "string", "@string_double"], [/'/, "string", "@string_single"], [/`/, "string", "@string_backtick"],
            [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"], [/0[xX][0-9a-fA-F]+/, "number.hex"], [/\d+/, "number"],
            [/[a-zA-Z_]\w*/, { cases: { "@keywords": "keyword", "@builtins": "type.identifier", "@typeKeywords": "type", "@default": "identifier" } }],
            [/:=/, "operator"], [/=>/, "operator"],
            [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
            [/[{}()[\]]/, "@brackets"], [/[,;.]/, "delimiter"],
          ],
          comment: [[/[^/*]+/, "comment"], [/\*\//, "comment", "@pop"], [/[/*]/, "comment"]],
          string_double: [[/[^\\"]+/, "string"], [/\\./, "string.escape"], [/"/, "string", "@pop"]],
          string_single: [[/[^\\']+/, "string"], [/\\./, "string.escape"], [/'/, "string", "@pop"]],
          string_backtick: [[/\$\{/, "string", "@bracketCounting"], [/[^\\`$]+/, "string"], [/\\./, "string.escape"], [/`/, "string", "@pop"]],
          fstring_double: [[/\{/, "string", "@bracketCounting"], [/[^\\"{}]+/, "string"], [/\\./, "string.escape"], [/"/, "string", "@pop"]],
          fstring_single: [[/\{/, "string", "@bracketCounting"], [/[^\\'{}]+/, "string"], [/\\./, "string.escape"], [/'/, "string", "@pop"]],
          bracketCounting: [[/\{/, "string", "@bracketCounting"], [/\}/, "string", "@pop"], [/./, "identifier"]],
        },
      });

      monaco.languages.registerCompletionItemProvider("omnilang", {
        provideCompletionItems: function () {
          var suggestions = [
            { label: "def", kind: 14, insertText: "def ${1:name}(${2:params}) {\n\t$0\n}", insertTextRules: 4, documentation: "Define a function (Python-style)" },
            { label: "func", kind: 14, insertText: "func ${1:name}(${2:params}) {\n\t$0\n}", insertTextRules: 4, documentation: "Define a function (Go-style)" },
            { label: "fn", kind: 14, insertText: "fn ${1:name}(${2:params}) {\n\t$0\n}", insertTextRules: 4, documentation: "Define a function (Rust-style)" },
            { label: "print", kind: 1, insertText: "print(${1})", insertTextRules: 4, documentation: "Print to console" },
            { label: "match", kind: 14, insertText: "match ${1:value} {\n\t${2:pattern} => ${3:expr},\n\t_ => ${4:default},\n}", insertTextRules: 4, documentation: "Pattern matching" },
          ];
          return { suggestions: suggestions };
        },
      });

      monaco.editor.defineTheme("omnilang-dark", {
        base: "vs-dark", inherit: true,
        rules: [
          { token: "keyword", foreground: "bc8cff", fontStyle: "bold" }, { token: "type.identifier", foreground: "58a6ff" },
          { token: "type", foreground: "39d2c0" }, { token: "string", foreground: "3fb950" },
          { token: "string.escape", foreground: "79c0ff" }, { token: "number", foreground: "d29922" },
          { token: "number.float", foreground: "d29922" }, { token: "number.hex", foreground: "d29922" },
          { token: "comment", foreground: "484f58", fontStyle: "italic" }, { token: "operator", foreground: "79c0ff" },
          { token: "identifier", foreground: "e6edf3" }, { token: "delimiter", foreground: "8b949e" },
        ],
        colors: {
          "editor.background": "#0d1117", "editor.foreground": "#e6edf3",
          "editorLineNumber.foreground": "#484f58", "editorLineNumber.activeForeground": "#e6edf3",
          "editor.selectionBackground": "#264f78", "editor.lineHighlightBackground": "#161b2288",
          "editorCursor.foreground": "#58a6ff", "editorWhitespace.foreground": "#21262d",
          "editorIndentGuide.background1": "#21262d", "editorBracketMatch.background": "#17e5e633",
          "editorBracketMatch.border": "#17e5e6", "editor.selectionHighlightBackground": "#3fb95033",
          "minimap.background": "#0d1117", "scrollbar.shadow": "#00000000", "editorOverviewRuler.border": "#00000000",
        },
      });

      monaco.editor.defineTheme("omnilang-light", {
        base: "vs", inherit: true,
        rules: [
          { token: "keyword", foreground: "8250df", fontStyle: "bold" }, { token: "type.identifier", foreground: "0550ae" },
          { token: "type", foreground: "1b7c83" }, { token: "string", foreground: "0a3069" },
          { token: "number", foreground: "953800" }, { token: "comment", foreground: "6e7781", fontStyle: "italic" },
          { token: "operator", foreground: "0550ae" },
        ],
        colors: { "editor.background": "#ffffff", "editor.foreground": "#1f2328", "editorLineNumber.foreground": "#8b949e", "editor.lineHighlightBackground": "#f6f8fa88", "editorCursor.foreground": "#0969da" },
      });
    },

    _createEditor: function () {
      var container = document.getElementById("monaco-editor");
      if (!container) return;
      State.monacoEditor = monaco.editor.create(container, {
        value: "", language: "omnilang", theme: "omnilang-dark",
        fontSize: State.editorSettings.fontSize, tabSize: State.editorSettings.tabSize,
        minimap: { enabled: State.editorSettings.minimap }, wordWrap: State.editorSettings.wordWrap ? "on" : "off",
        automaticLayout: true, scrollBeyondLastLine: false, renderWhitespace: "selection",
        bracketPairColorization: { enabled: true }, guides: { bracketPairs: true },
        smoothScrolling: true, cursorBlinking: "smooth", cursorSmoothCaretAnimation: "on",
        padding: { top: 8 }, fontFamily: "'JetBrains Mono', monospace", fontLigatures: true,
        lineHeight: 22, suggestOnTriggerCharacters: true, acceptSuggestionOnCommitCharacter: true,
      });
      var self = this;
      State.monacoEditor.onDidChangeModelContent(function () { self.saveCurrentFile(); self._updateTranspiled(); });
      State.monacoEditor.onDidChangeCursorPosition(function (e) {
        var cursorEl = document.getElementById("footerCursor");
        if (cursorEl) cursorEl.textContent = "Ln " + e.position.lineNumber + ", Col " + e.position.column;
      });
    },

    _updateTranspiled: function () {
      if (!State.monacoEditor) return;
      var code = State.monacoEditor.getValue();
      var ext = FileSystem.getExtension(State.currentFile || "");
      if (ext !== ".ol") return;
      var transpiled = Transpiler.transpile(code);
      var transpiledEl = document.getElementById("transpiledOutput");
      if (transpiledEl) transpiledEl.textContent = transpiled;
      State.problems = Transpiler.errors.concat(Transpiler.warnings);
      this._renderProblems();
    },

    // ===== CODE EXECUTION =====
    runCode: function () {
      this.saveCurrentFile();
      var allCode = "";
      if (State.currentFile && FileSystem.getExtension(State.currentFile) === ".ol") {
        var current = FileSystem.getFile(State.currentFile);
        if (current) allCode = current.content;
      }
      var transpiled = Transpiler.transpile(allCode);
      var transpiledEl = document.getElementById("transpiledOutput");
      if (transpiledEl) transpiledEl.textContent = transpiled;
      State.problems = [];
      var output = [];
      var origLog = console.log;
      var origWarn = console.warn;
      var origError = console.error;
      console.log = function () { var args = Array.from(arguments); output.push({ type: "log", text: args.map(function (a) { return typeof a === "object" ? JSON.stringify(a, null, 2) : String(a); }).join(" ") }); };
      console.warn = function () { output.push({ type: "warn", text: Array.from(arguments).map(String).join(" ") }); };
      console.error = function () { output.push({ type: "error", text: Array.from(arguments).map(String).join(" ") }); };
      var statusEl = document.getElementById("footerStatus");
      var self = this;
      try {
        if (statusEl) statusEl.textContent = "Running...";
        var run = new Function(transpiled);
        run();
        if (statusEl) statusEl.textContent = "Done";
        if (output.length === 0) output.push({ type: "log", text: "(No output)" });
      } catch (err) {
        output.push({ type: "error", text: "Error: " + err.message });
        State.problems.push({ line: self._extractLineNumber(err), message: err.message, severity: "error" });
        if (statusEl) statusEl.textContent = "Error";
      }
      console.log = origLog; console.warn = origWarn; console.error = origError;
      this._addConsoleLine("cmd", "$ run " + (State.currentFile || "main.ol"));
      output.forEach(function (item) { self._addConsoleLine(item.type, item.text); });
      State.problems = State.problems.concat(Transpiler.errors).concat(Transpiler.warnings);
      this._renderProblems();
    },

    _extractLineNumber: function (err) {
      if (err.stack) { var match = err.stack.match(/:(\d+):\d+/); if (match) return parseInt(match[1], 10); }
      return 0;
    },

    _renderProblems: function () {
      var panel = document.getElementById("problemsPanel");
      if (!panel) return;
      panel.innerHTML = "";
      if (State.problems.length === 0) { panel.innerHTML = '<div style="color:var(--text-muted);font-size:12px">No problems detected.</div>'; return; }
      State.problems.forEach(function (problem) {
        var item = document.createElement("div");
        item.className = "problem-item";
        var iconColor = problem.severity === "error" ? "var(--accent-red)" : "var(--accent-orange)";
        item.innerHTML = '<span class="problem-icon" style="color:' + iconColor + '">' + (problem.severity === "error" ? "\u2716" : "\u26A0") + '</span><span class="problem-message">' + problem.message + '</span><span class="problem-location">Line ' + problem.line + "</span>";
        panel.appendChild(item);
      });
    },

    // ===== CONSOLE =====
    _addConsoleLine: function (type, text) {
      var outputEl = document.getElementById("consoleOutput");
      if (!outputEl) return;
      var div = document.createElement("div");
      div.className = "console-line " + type;
      div.textContent = text;
      outputEl.appendChild(div);
      outputEl.scrollTop = outputEl.scrollHeight;
    },

    initConsoleInput: function () {
      var input = document.getElementById("consoleInput");
      if (!input) return;
      var self = this;
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var code = input.value.trim();
          if (!code) return;
          State.terminalHistory.push(code);
          State.terminalHistoryIndex = State.terminalHistory.length;
          self._addConsoleLine("cmd", "omnilang> " + code);
          if (code === "help") { self._addConsoleLine("info", "Commands: run, clear, help, theme"); input.value = ""; return; }
          if (code === "clear") { var outputEl = document.getElementById("consoleOutput"); if (outputEl) outputEl.innerHTML = ""; self._addConsoleLine("info", "Console cleared"); input.value = ""; return; }
          if (code === "run") { self.runCode(); input.value = ""; return; }
          if (code === "theme") { self.toggleTheme(); self._addConsoleLine("info", "Switched to " + State.theme + " mode"); input.value = ""; return; }
          if (State.currentMode === "question") {
            self._addAIMessage("user", code);
            var response = AIAssistant.getChatResponse(code);
            setTimeout(function () { self._addAIMessage("assistant", response); }, 400 + Math.random() * 800);
            input.value = ""; return;
          }
          var transpiled = Transpiler.transpile(code);
          try {
            var origLog = console.log; var logs = [];
            console.log = function () { logs.push(Array.from(arguments).map(function (a) { return typeof a === "object" ? JSON.stringify(a, null, 2) : String(a); }).join(" ")); };
            var result = eval(transpiled);
            console.log = origLog;
            if (logs.length > 0) logs.forEach(function (log) { self._addConsoleLine("success", log); });
            if (result !== undefined) self._addConsoleLine("log", typeof result === "object" ? JSON.stringify(result, null, 2) : String(result));
          } catch (err) { self._addConsoleLine("error", "Error: " + err.message); }
          input.value = "";
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (State.terminalHistoryIndex > 0) { State.terminalHistoryIndex--; input.value = State.terminalHistory[State.terminalHistoryIndex]; }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (State.terminalHistoryIndex < State.terminalHistory.length - 1) { State.terminalHistoryIndex++; input.value = State.terminalHistory[State.terminalHistoryIndex]; } else { State.terminalHistoryIndex = State.terminalHistory.length; input.value = ""; }
        }
      });
    },

    // ===== RESIZE =====
    initConsoleResize: function () {
      var handle = document.getElementById("consoleResize");
      var consoleArea = document.getElementById("consoleArea");
      if (!handle || !consoleArea) return;
      var startY = 0, startH = 0;
      function onMouseMove(e) { var delta = startY - e.clientY; var newH = Math.max(80, Math.min(window.innerHeight * 0.6, startH + delta)); consoleArea.style.height = newH + "px"; if (State.monacoEditor) State.monacoEditor.layout(); }
      function onMouseUp() { document.removeEventListener("mousemove", onMouseMove); document.removeEventListener("mouseup", onMouseUp); document.body.style.cursor = ""; document.body.style.userSelect = ""; }
      handle.addEventListener("mousedown", function (e) { e.preventDefault(); startY = e.clientY; startH = consoleArea.offsetHeight; document.body.style.cursor = "ns-resize"; document.body.style.userSelect = "none"; document.addEventListener("mousemove", onMouseMove); document.addEventListener("mouseup", onMouseUp); });
      handle.addEventListener("dblclick", function () { consoleArea.style.height = "220px"; if (State.monacoEditor) State.monacoEditor.layout(); });
    },

    initPanelResize: function () {
      var self = this;
      var leftHandle = document.getElementById("leftResizeHandle");
      var leftPanel = document.getElementById("leftPanel");
      if (leftHandle && leftPanel) {
        var leftStartX = 0, leftStartW = 0;
        function onLeftMove(e) { var delta = e.clientX - leftStartX; var newW = Math.max(180, Math.min(400, leftStartW + delta)); leftPanel.style.width = newW + "px"; document.documentElement.style.setProperty("--left-w", newW + "px"); if (State.monacoEditor) State.monacoEditor.layout(); }
        function onLeftUp() { document.removeEventListener("mousemove", onLeftMove); document.removeEventListener("mouseup", onLeftUp); document.body.style.cursor = ""; document.body.style.userSelect = ""; }
        leftHandle.addEventListener("mousedown", function (e) { e.preventDefault(); leftStartX = e.clientX; leftStartW = leftPanel.offsetWidth; document.body.style.cursor = "ew-resize"; document.body.style.userSelect = "none"; document.addEventListener("mousemove", onLeftMove); document.addEventListener("mouseup", onLeftUp); });
        leftHandle.addEventListener("dblclick", function () { if (leftPanel.offsetWidth > 40) { leftPanel.style.width = "0px"; document.documentElement.style.setProperty("--left-w", "0px"); } else { leftPanel.style.width = "220px"; document.documentElement.style.setProperty("--left-w", "220px"); } if (State.monacoEditor) State.monacoEditor.layout(); });
      }
      var rightHandle = document.getElementById("rightResizeHandle");
      var rightPanel = document.getElementById("rightPanel");
      if (rightHandle && rightPanel) {
        var rightStartX = 0, rightStartW = 0;
        function onRightMove(e) { var delta = rightStartX - e.clientX; var newW = Math.max(200, Math.min(500, rightStartW + delta)); rightPanel.style.width = newW + "px"; document.documentElement.style.setProperty("--right-w", newW + "px"); if (State.monacoEditor) self._layoutEditor(); }
        function onRightUp() { document.removeEventListener("mousemove", onRightMove); document.removeEventListener("mouseup", onRightUp); document.body.style.cursor = ""; document.body.style.userSelect = ""; }
        rightHandle.addEventListener("mousedown", function (e) { e.preventDefault(); rightStartX = e.clientX; rightStartW = rightPanel.offsetWidth; document.body.style.cursor = "ew-resize"; document.body.style.userSelect = "none"; document.addEventListener("mousemove", onRightMove); document.addEventListener("mouseup", onRightUp); });
        rightHandle.addEventListener("dblclick", function () { if (rightPanel.offsetWidth > 40) { rightPanel.style.width = "0px"; document.documentElement.style.setProperty("--right-w", "0px"); } else { rightPanel.style.width = "300px"; document.documentElement.style.setProperty("--right-w", "300px"); } if (State.monacoEditor) self._layoutEditor(); });
      }
    },

    _layoutEditor: function () { if (State.monacoEditor) State.monacoEditor.layout(); },

    // ===== KEYBOARD =====
    initKeyboard: function () {
      var self = this;
      document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); self.runCode(); }
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault(); self.saveCurrentFile();
          var statusEl = document.getElementById("footerStatus");
          if (statusEl) { statusEl.textContent = "Saved"; setTimeout(function () { statusEl.textContent = "Ready"; }, 1500); }
        }
      });
    },

    // ===== THEME =====
    toggleTheme: function () {
      State.theme = State.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", State.theme);
      if (State.monacoEditor) monaco.editor.setTheme(State.theme === "dark" ? "omnilang-dark" : "omnilang-light");
    },

    // ===== RIGHT PANEL TABS =====
    switchRightTab: function (tab) {
      State.rightCodingTab = tab;
      document.querySelectorAll("[data-rtab]").forEach(function (t) { t.classList.toggle("active", t.dataset.rtab === tab); });
      document.querySelectorAll("[data-rtab-content]").forEach(function (el) { el.classList.toggle("active", el.dataset.rtabContent === tab); });
    },

    // ===== LANGUAGE REFERENCE =====
    renderRefPanel: function () {
      var content = document.getElementById("refContent");
      if (!content) return;
      content.innerHTML = '<div class="ref-section"><h4>Function Declarations</h4><table class="ref-table"><thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead><tbody><tr><td>def greet(name) { }</td><td>function greet(name) { }</td><td>Python</td></tr><tr><td>func add(a, b) { }</td><td>function add(a, b) { }</td><td>Go</td></tr><tr><td>fn multiply(a, b) { }</td><td>function multiply(a, b) { }</td><td>Rust</td></tr></tbody></table></div><div class="ref-section"><h4>Variables</h4><table class="ref-table"><thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead><tbody><tr><td>x := 5</td><td>let x = 5</td><td>Go</td></tr><tr><td>let mut x = 5</td><td>let x = 5</td><td>Rust</td></tr></tbody></table></div><div class="ref-section"><h4>Output</h4><table class="ref-table"><thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead><tbody><tr><td>print("hi")</td><td>console.log("hi")</td><td>Python</td></tr><tr><td>println!("hi")</td><td>console.log("hi")</td><td>Rust</td></tr><tr><td>fmt.Println("hi")</td><td>console.log("hi")</td><td>Go</td></tr></tbody></table></div>';
    },

    // ===== AI =====
    initQuestionInput: function () {
      var searchInput = document.getElementById("questionSearchInput");
      if (!searchInput) return;
      var self = this;
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var msg = searchInput.value.trim();
          if (!msg) return;
          self._addAIMessage("user", msg);
          searchInput.value = "";
          var response = AIAssistant.getChatResponse(msg);
          setTimeout(function () { self._addAIMessage("assistant", response); }, 400 + Math.random() * 800);
        }
      });
    },

    quickPrompt: function (type) {
      var code = "";
      if (State.monacoEditor) {
        var selection = State.monacoEditor.getSelection();
        var model = State.monacoEditor.getModel();
        if (selection && model && !selection.isEmpty()) code = model.getValueInRange(selection);
        else if (model) code = model.getValue();
      }
      var labels = { explain: "Explain this code", fix: "Fix errors in this code", generate: "Generate a code snippet", refactor: "Suggest refactoring improvements", document: "Generate documentation" };
      this._addAIMessage("user", labels[type] || "Help me");
      var response = AIAssistant.getResponse(type, code);
      var self = this;
      setTimeout(function () { self._addAIMessage("assistant", response); }, 400 + Math.random() * 800);
      this.switchMode("question");
    },

    _addAIMessage: function (role, content) {
      var container = document.getElementById("aiMessages");
      if (!container) return;
      var msg = document.createElement("div");
      msg.className = "ai-message fade-in";
      var avatarClass = role === "assistant" ? "assistant" : "user";
      var avatarText = role === "assistant" ? "AI" : (AuthDB.currentUser ? AuthDB.currentUser.name.charAt(0).toUpperCase() : "U");
      var nameText = role === "assistant" ? "OmniLang Assistant" : "You";
      msg.innerHTML = '<div class="ai-message-header"><div class="ai-avatar ' + avatarClass + '">' + avatarText + '</div><span>' + nameText + '</span></div><div class="ai-message-content">' + content + '</div>';
      container.appendChild(msg);
      container.scrollTop = container.scrollHeight;
      if (role === "user") {
        var historyEl = document.getElementById("chatHistory");
        if (historyEl) { var item = document.createElement("div"); item.className = "chat-history-item"; item.textContent = content.substring(0, 60); historyEl.insertBefore(item, historyEl.firstChild); }
      }
    },

    // ===== AGENTS =====
    renderAgentsList: function () {
      var list = document.getElementById("agentsList");
      if (!list) return;
      list.innerHTML = "";
      var self = this;
      AIAgents.forEach(function (agent, idx) {
        var card = document.createElement("div");
        card.className = "agent-card" + (State.selectedAgent === idx ? " selected" : "");
        card.innerHTML = '<div class="agent-icon">' + agent.icon + '</div><div class="agent-info"><div class="agent-name">' + agent.name + '</div><div class="agent-desc">' + agent.desc + '</div><div class="agent-status"><span class="status-dot ' + agent.status + '"></span>' + agent.status + '</div></div>';
        card.onclick = function () { State.selectedAgent = idx; self.renderAgentsList(); self.renderAgentDetail(idx); };
        list.appendChild(card);
      });
    },

    renderAgentDetail: function (idx) {
      var agent = AIAgents[idx];
      var panel = document.getElementById("agentDetailPanel");
      if (!panel || !agent) return;
      var self = this;
      panel.innerHTML = '<div class="agent-detail-header"><div class="agent-detail-icon">' + agent.icon + '</div><div><div class="agent-detail-name">' + agent.name + '</div><div class="agent-status"><span class="status-dot ' + agent.status + '"></span>' + agent.status + '</div></div></div><div class="agent-config-section"><h5>Description</h5><div style="font-size:12px;color:var(--text-primary);line-height:1.5">' + agent.desc + '</div></div><div class="agent-config-section"><h5>Configuration</h5><div style="font-size:11px;color:var(--text-secondary)">Scope: Current file</div><div style="font-size:11px;color:var(--text-secondary)">Depth: Standard</div></div><button class="agent-run-btn" id="agentRunBtn"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6z"/></svg>Run Agent</button><div class="agent-config-section" style="margin-top:12px"><h5>Activity Log</h5><div id="agentLog" style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary)">No activity yet</div></div>';
      var runBtn = document.getElementById("agentRunBtn");
      if (runBtn) runBtn.onclick = function () { self.runAgent(idx); };
    },

    runAgent: function (idx) {
      var agent = AIAgents[idx];
      agent.status = "running";
      this.renderAgentsList();
      this.renderAgentDetail(idx);
      var self = this;
      var logEl = document.getElementById("agentLog");
      if (logEl) logEl.innerHTML = '<div class="agent-log-entry">[' + new Date().toLocaleTimeString() + "] Starting " + agent.name + "...</div>";
      setTimeout(function () { if (logEl) logEl.innerHTML += '<div class="agent-log-entry">[' + new Date().toLocaleTimeString() + "] Analyzing code...</div>"; }, 800);
      setTimeout(function () { if (logEl) logEl.innerHTML += '<div class="agent-log-entry">[' + new Date().toLocaleTimeString() + "] Analysis complete. Found 0 issues.</div>"; agent.status = "complete"; self.renderAgentsList(); self.renderAgentDetail(idx); self._addConsoleLine("info", agent.name + " completed successfully"); }, 2500);
    },

    createCustomAgent: function () {
      var name = prompt("Enter agent name:");
      if (!name) return;
      AIAgents.push({ name: name, icon: "\u{1F916}", desc: "Custom agent", status: "idle" });
      this.renderAgentsList();
    },

    // ===== DEPLOY =====
    renderDeployServicesList: function () {
      var list = document.getElementById("deployServicesList");
      if (!list) return;
      list.innerHTML = "";
      var self = this;
      HostingServices.forEach(function (svc, idx) {
        var item = document.createElement("div");
        item.className = "deploy-service-item" + (State.selectedHosting === idx ? " selected" : "");
        item.innerHTML = '<div class="deploy-svc-icon" style="background:' + svc.color + ";color:" + svc.textColor + '">' + svc.icon + '</div><div class="deploy-svc-info"><div class="deploy-svc-name">' + svc.name + '</div><div class="deploy-svc-status"><span class="status-dot ' + (svc.connected ? "connected" : "disconnected") + '"></span>' + (svc.connected ? "Connected" : "Not connected") + '</div></div>';
        item.onclick = function () { State.selectedHosting = idx; self.renderDeployServicesList(); self.renderDeployConfig(idx); };
        list.appendChild(item);
      });
    },

    renderDeployConfig: function (idx) {
      var svc = HostingServices[idx];
      var panel = document.getElementById("deployConfigPanel");
      if (!panel || !svc) return;
      var self = this;
      var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border-subtle)"><div class="deploy-svc-icon" style="background:' + svc.color + ";color:" + svc.textColor + '">' + svc.icon + '</div><div><div style="font-weight:700;font-size:14px">' + svc.name + '</div><div class="deploy-svc-status"><span class="status-dot ' + (svc.connected ? "connected" : "disconnected") + '"></span>' + (svc.connected ? "Connected" : "Not connected") + '</div></div></div>';
      html += '<div style="display:flex;gap:6px;margin-bottom:14px"><button class="btn-sm" id="deployConnectBtn">' + (svc.connected ? "Disconnect" : "Connect") + '</button><button class="btn-sm primary" id="deployDeployBtn" ' + (svc.connected ? "" : "disabled") + '>Deploy</button></div>';
      html += '<div class="deploy-field"><label>Region</label><select><option>US East (N. Virginia)</option><option>US West (Oregon)</option><option>EU (Frankfurt)</option><option>Asia (Singapore)</option></select></div>';
      html += '<div class="deploy-field"><label>Environment Variables</label><div id="deployEnvVars">';
      State.envVars.forEach(function (ev, i) {
        html += '<div class="env-var-row"><input placeholder="KEY" value="' + (ev.key || "") + '" data-env-idx="' + i + '" data-env-field="key"><input placeholder="value" value="' + (ev.value || "") + '" type="password" data-env-idx="' + i + '" data-env-field="value"><button class="btn-sm" onclick="window.OmniLang.removeEnvVar(' + i + ')">Remove</button></div>';
      });
      html += '</div><button class="btn-sm" onclick="window.OmniLang.addEnvVar()" style="margin-top:4px">+ Add Variable</button></div>';
      html += '<div class="db-section"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-secondary);margin-bottom:8px">Database Connections</div>';
      DatabaseServices.forEach(function (db, i) {
        html += '<div class="db-card"><div class="db-card-header"><span style="font-size:16px">' + db.icon + '</span><div class="db-card-name">' + db.name + '</div><div class="db-card-status" style="margin-left:auto"><span class="status-dot ' + (db.connected ? "connected" : "disconnected") + '"></span>' + (db.connected ? "Connected" : "Not connected") + '</div></div><input class="db-input" placeholder="' + db.placeholder + '" type="password"><div class="db-actions"><button class="btn-sm" onclick="window.OmniLang.testDbConnection(' + i + ')">Test</button><button class="btn-sm primary" onclick="window.OmniLang.connectDb(' + i + ')">Connect</button></div></div>';
      });
      html += '</div>';
      html += '<div class="deploy-field" style="margin-top:12px"><label>Build Logs</label><div class="build-log" id="buildLog">' + (State.buildLogs.length > 0 ? State.buildLogs.join("\n") : "No build logs yet") + '</div></div>';
      if (State.deployUrl) html += '<div class="deploy-field"><label>Live URL</label><div class="deploy-url">' + State.deployUrl + '</div></div>';
      panel.innerHTML = html;
      var connectBtn = document.getElementById("deployConnectBtn");
      if (connectBtn) connectBtn.onclick = function () { self.connectService(idx); };
      var deployBtn = document.getElementById("deployDeployBtn");
      if (deployBtn) deployBtn.onclick = function () { self.deployTo(idx); };
    },

    connectService: function (index) {
      var svc = HostingServices[index];
      svc.connected = !svc.connected;
      this.renderDeployServicesList();
      this.renderDeployConfig(index);
      if (svc.connected) this._addConsoleLine("log", "Connected to " + svc.name + " successfully.");
    },

    deployTo: function (index) {
      var svc = HostingServices[index];
      var self = this;
      var projectName = document.getElementById("projectName") ? document.getElementById("projectName").value : "project";
      State.buildLogs = [];
      State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Starting deployment to " + svc.name + "...");
      this.renderDeployConfig(index);
      this._addConsoleLine("log", "Deploying to " + svc.name + "...");
      setTimeout(function () { State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Building project..."); self._updateBuildLog(); }, 500);
      setTimeout(function () { State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Transpiling OmniLang files..."); self._updateBuildLog(); }, 1200);
      setTimeout(function () { State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Uploading bundle (12.4kb)..."); self._updateBuildLog(); }, 2000);
      setTimeout(function () {
        State.deployUrl = "https://" + projectName + "." + svc.name.toLowerCase().replace(/\s/g, "") + ".app";
        State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Deployment successful!");
        self.renderDeployConfig(index);
        self._addConsoleLine("success", "Deployed to " + State.deployUrl);
        var statusEl = document.getElementById("footerStatus");
        if (statusEl) statusEl.textContent = "Deployed";
      }, 3000);
    },

    _updateBuildLog: function () { var logEl = document.getElementById("buildLog"); if (logEl) logEl.textContent = State.buildLogs.join("\n"); },

    testDbConnection: function (index) {
      var db = DatabaseServices[index];
      this._addConsoleLine("log", "Testing connection to " + db.name + "...");
      var self = this;
      setTimeout(function () { self._addConsoleLine("success", db.name + " connection test successful."); }, 1000);
    },

    connectDb: function (index) {
      var db = DatabaseServices[index];
      db.connected = !db.connected;
      if (State.selectedHosting !== null) this.renderDeployConfig(State.selectedHosting);
      this._addConsoleLine("log", (db.connected ? "Connected to " : "Disconnected from ") + db.name);
    },

    addEnvVar: function () { State.envVars.push({ key: "", value: "" }); if (State.selectedHosting !== null) this.renderDeployConfig(State.selectedHosting); },
    removeEnvVar: function (idx) { State.envVars.splice(idx, 1); if (State.selectedHosting !== null) this.renderDeployConfig(State.selectedHosting); },

    // ===== SETTINGS (old modal-based) =====
    showSettings: function () { this.navigateTo("settings"); },
    updateSetting: function (key, value) {
      if (key === "fontSize") { State.editorSettings.fontSize = parseInt(value, 10); if (State.monacoEditor) State.monacoEditor.updateOptions({ fontSize: State.editorSettings.fontSize }); }
      else if (key === "tabSize") { State.editorSettings.tabSize = parseInt(value, 10); if (State.monacoEditor) State.monacoEditor.updateOptions({ tabSize: State.editorSettings.tabSize }); }
    },
    toggleSetting: function (key, element) {
      element.classList.toggle("on");
      var isOn = element.classList.contains("on");
      if (key === "minimap") { State.editorSettings.minimap = isOn; if (State.monacoEditor) State.monacoEditor.updateOptions({ minimap: { enabled: isOn } }); }
      else if (key === "wordWrap") { State.editorSettings.wordWrap = isOn; if (State.monacoEditor) State.monacoEditor.updateOptions({ wordWrap: isOn ? "on" : "off" }); }
    },

    // ===== NEW PROJECT =====
    toggleNewDropdown: function () {
      var dd = document.getElementById("newDropdown");
      if (dd) dd.classList.toggle("open");
      if (dd && dd.classList.contains("open")) {
        setTimeout(function () {
          function closeDropdown(e) { if (!dd.contains(e.target) && !e.target.closest(".new-btn")) { dd.classList.remove("open"); document.removeEventListener("click", closeDropdown); } }
          document.addEventListener("click", closeDropdown);
        }, 10);
      }
    },

    renderNewDropdown: function () {
      var dd = document.getElementById("newDropdown");
      if (!dd) return;
      var self = this;
      dd.innerHTML = "";
      Object.keys(SampleProjects).forEach(function (key) {
        var project = SampleProjects[key];
        var item = document.createElement("div");
        item.className = "new-dropdown-item";
        item.innerHTML = '<span class="emoji">' + project.emoji + '</span><div><div>' + project.name + '</div><div class="desc">' + project.description.substring(0, 50) + '</div></div>';
        item.onclick = function () { self.loadProject(key); dd.classList.remove("open"); };
        dd.appendChild(item);
      });
    },

    renderProjectGrid: function () {
      var grid = document.getElementById("projectGrid");
      if (!grid) return;
      grid.innerHTML = "";
      var self = this;
      Object.keys(SampleProjects).forEach(function (key) {
        var project = SampleProjects[key];
        var card = document.createElement("div");
        card.className = "project-card";
        card.innerHTML = '<div class="project-card-emoji">' + project.emoji + '</div><h4>' + project.name + '</h4><p>' + project.description + '</p>';
        card.onclick = function () { self.loadProject(key); var modal = document.getElementById("newProjectModal"); if (modal) modal.classList.remove("open"); };
        grid.appendChild(card);
      });
    },

    loadProject: function (key) {
      var project = SampleProjects[key];
      if (!project) return;
      FileSystem.init(project.files);
      State.openFiles = Object.keys(project.files).filter(function (f) { return !f.endsWith("/"); });
      State.currentFile = State.openFiles[0] || null;
      var nameInput = document.getElementById("projectName");
      if (nameInput) nameInput.value = key;
      this.renderFileTree();
      this.renderEditorTabs();
      if (State.currentFile) this.loadFileInEditor(State.currentFile);
      State.problems = [];
      this._renderProblems();
      var outputEl = document.getElementById("consoleOutput");
      if (outputEl) outputEl.innerHTML = "";
      this._addConsoleLine("info", "Loaded project: " + project.name);
      var statusEl = document.getElementById("footerStatus");
      if (statusEl) statusEl.textContent = "Project loaded";
    },
  };

  // ===== PUBLIC API =====
  window.OmniLang = App;

  // ===== INITIALIZE =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { App.init(); });
  } else {
    App.init();
  }
})();
