/* OmniLang IDE — Main Application (3-Column Layout) */
/* global require, monaco */

(function () {
  "use strict";

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

        // Handle multi-line match blocks
        if (/^\s*match\s+.+\s*\{/.test(line)) {
          var matchResult = this._transpileMatch(lines, i);
          result.push.apply(result, matchResult.lines);
          i = matchResult.endIndex + 1;
          continue;
        }

        // Handle impl blocks
        if (/^\s*impl\s+(\w+)\s*\{/.test(line)) {
          var implResult = this._transpileImpl(lines, i);
          result.push.apply(result, implResult.lines);
          i = implResult.endIndex + 1;
          continue;
        }

        // Handle list comprehensions
        if (/\[.*\bfor\b.*\bin\b.*\]/.test(line)) {
          line = this._transpileListComp(line, lineNum);
        }

        // Line-by-line transpilation
        line = this._transpileLine(line, lineNum);
        result.push(line);
        i++;
      }

      return result.join("\n");
    },

    _transpileLine: function (line, lineNum) {
      var out = line;

      // # comments to // comments (not inside strings)
      out = out.replace(
        /^(\s*)#(.*)$/,
        function (_m, indent, comment) {
          return indent + "//" + comment;
        }
      );
      // inline # comments (crude: after code)
      out = out.replace(
        /^(.*[^'"\\])\s+#(.*)$/,
        function (_m, code, comment) {
          return code + " //" + comment;
        }
      );

      // f-strings: f"Hello {name}" → `Hello ${name}`
      out = out.replace(/f"([^"]*)"/g, function (_m, content) {
        var replaced = content.replace(/\{([^}]+)\}/g, "${$1}");
        return "`" + replaced + "`";
      });
      out = out.replace(/f'([^']*)'/g, function (_m, content) {
        var replaced = content.replace(/\{([^}]+)\}/g, "${$1}");
        return "`" + replaced + "`";
      });

      // Function keywords: def/func/fn → function
      out = out.replace(
        /^(\s*)(def|func|fn)\s+(\w+)\s*\(/,
        function (_m, indent, _kw, name) {
          return indent + "function " + name + "(";
        }
      );

      // Short variable declaration: x := 5 → let x = 5
      out = out.replace(
        /^(\s*)(\w+)\s*:=\s*(.+)/,
        function (_m, indent, varName, value) {
          return indent + "let " + varName + " = " + value;
        }
      );

      // Rust let mut → let
      out = out.replace(/^(\s*)let\s+mut\s+/, "$1let ");

      // Print functions → console.log
      out = out.replace(
        /\bprint\s*\(/g,
        "console.log("
      );
      out = out.replace(
        /\bprintln!\s*\(/g,
        "console.log("
      );
      out = out.replace(
        /\bfmt\.Println\s*\(/g,
        "console.log("
      );
      out = out.replace(
        /\bConsole\.WriteLine\s*\(/g,
        "console.log("
      );
      out = out.replace(
        /\bSystem\.out\.println\s*\(/g,
        "console.log("
      );

      // elif → else if
      out = out.replace(/\belif\b/g, "else if");

      // Boolean operators: and/or/not → &&/||/!
      out = out.replace(/\band\b/g, "&&");
      out = out.replace(/\bor\b/g, "||");
      out = out.replace(/\bnot\s+/g, "!");

      // None → null
      out = out.replace(/\bNone\b/g, "null");

      // nil → null
      out = out.replace(/\bnil\b/g, "null");

      // True/False → true/false
      out = out.replace(/\bTrue\b/g, "true");
      out = out.replace(/\bFalse\b/g, "false");

      // len(x) → x.length
      out = out.replace(
        /\blen\(([^)]+)\)/g,
        function (_m, arg) {
          return arg.trim() + ".length";
        }
      );

      // range(n) → Array.from({length: n}, (_, i) => i)
      out = out.replace(
        /\brange\((\d+)\)/g,
        function (_m, n) {
          return "Array.from({length: " + n + "}, (_, i) => i)";
        }
      );
      // range(start, end)
      out = out.replace(
        /\brange\((\d+),\s*(\d+)\)/g,
        function (_m, start, end) {
          return "Array.from({length: " + end + " - " + start + "}, (_, i) => i + " + start + ")";
        }
      );

      // var x = ... → let x = ...
      out = out.replace(
        /^(\s*)var\s+(\w+)\s*=/,
        function (_m, indent, name) {
          return indent + "let " + name + " =";
        }
      );

      // Validate basic syntax
      this._validateLine(out, lineNum);

      return out;
    },

    _transpileListComp: function (line, _lineNum) {
      var match = line.match(
        /\[([^\]]+)\s+for\s+(\w+)\s+in\s+range\((\d+)\)\]/
      );
      if (match) {
        var expr = match[1].trim();
        var varName = match[2];
        var n = match[3];
        return line.replace(
          match[0],
          "Array.from({length: " + n + "}, (_, " + varName + ") => " + expr + ")"
        );
      }

      var match2 = line.match(
        /\[([^\]]+)\s+for\s+(\w+)\s+in\s+([^\]]+)\]/
      );
      if (match2) {
        var expr2 = match2[1].trim();
        var varName2 = match2[2];
        var iterable = match2[3].trim();
        return line.replace(
          match2[0],
          iterable + ".map(" + varName2 + " => " + expr2 + ")"
        );
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

        var armMatch = line.match(
          /^(\s*)(\S+)\s*=>\s*(.+?)(?:,?\s*)$/
        );
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
          function (_m, ind, _kw, name) {
            return ind + className + ".prototype." + name + " = function(";
          }
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
        this.warnings.push({
          line: lineNum,
          message: "Possibly unclosed string",
          severity: "warning",
        });
      }
      if (doubles % 2 !== 0) {
        this.warnings.push({
          line: lineNum,
          message: "Possibly unclosed string",
          severity: "warning",
        });
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
        self.files[path] = {
          content: projectFiles[path],
          type: self._getType(path),
        };
      });
    },

    _getType: function (path) {
      if (path.endsWith("/")) return "folder";
      return "file";
    },

    getFile: function (path) {
      return this.files[path] || null;
    },

    setFile: function (path, content) {
      this.files[path] = { content: content, type: "file" };
    },

    deleteFile: function (path) {
      delete this.files[path];
      var prefix = path.endsWith("/") ? path : path + "/";
      var self = this;
      Object.keys(self.files).forEach(function (key) {
        if (key.indexOf(prefix) === 0) {
          delete self.files[key];
        }
      });
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
        if (parts.length === 1 || (parts.length === 2 && parts[1] === "")) {
          items.add(path);
        }
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
        "main.ol":
          '# OmniLang Hello World\n# This demonstrates syntax from multiple languages\n\n# Python-style function\ndef greet(name) {\n  print(f"Hello, {name}!")\n}\n\n# Go-style short declaration\nresult := 42\nprint(f"The answer is {result}")\n\n# Rust-style function\nfn add(a, b) {\n  return a + b\n}\n\n# Python booleans and None\nlet active = True\nlet data = None\n\nif active and data == None {\n  print("Active but no data yet")\n}\n\n# List comprehension\nlet squares = [x * x for x in range(10)]\nprint("Squares:")\nprint(squares)\n\n# Go-style function\nfunc multiply(a, b) {\n  return a * b\n}\n\n# Call our functions\ngreet("OmniLang")\nprint(f"3 + 4 = {add(3, 4)}")\nprint(f"6 * 7 = {multiply(6, 7)}")\nprint(f"Length of squares: {len(squares)}")\n\n# Match expression (Rust-style)\nlet status = "success"\nmatch status {\n  "success" => print("Operation completed!"),\n  "error" => print("Something went wrong"),\n  _ => print("Unknown status"),\n}\n',
        "utils.ol":
          "# Utility functions for OmniLang\n\ndef capitalize(str) {\n  return str.charAt(0).toUpperCase() + str.slice(1)\n}\n\ndef repeat(str, times) {\n  let result := \"\"\n  for (let i = 0; i < times; i++) {\n    result += str\n  }\n  return result\n}\n\nfn max(a, b) {\n  if a > b { return a }\n  return b\n}\n\nfn min(a, b) {\n  if a < b { return a }\n  return b\n}\n",
        "styles.css":
          "/* OmniLang Project Styles */\nbody {\n  font-family: sans-serif;\n  padding: 20px;\n  background: #0d1117;\n  color: #e6edf3;\n}\n\n.container {\n  max-width: 800px;\n  margin: 0 auto;\n}\n",
        "index.html":
          '<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello OmniLang</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <div class="container">\n    <h1>Hello OmniLang!</h1>\n    <p>This project demonstrates the OmniLang superset language.</p>\n  </div>\n</body>\n</html>\n',
      },
    },
    "todo-app": {
      name: "Todo App",
      emoji: "\u{2705}",
      description: "A todo list app demonstrating Python-like syntax in OmniLang",
      files: {
        "main.ol":
          '# Todo App in OmniLang\n# Demonstrates Python-like syntax\n\nlet todos = []\nlet nextId := 1\n\n# Python-style function definitions\ndef addTodo(text) {\n  let todo := {\n    id: nextId,\n    text: text,\n    done: False\n  }\n  nextId += 1\n  todos.push(todo)\n  print(f"Added: {text}")\n  return todo\n}\n\ndef completeTodo(id) {\n  for (let i = 0; i < len(todos); i++) {\n    if todos[i].id == id {\n      todos[i].done = True\n      print(f"Completed: {todos[i].text}")\n      return True\n    }\n  }\n  print("Todo not found!")\n  return False\n}\n\ndef listTodos() {\n  if len(todos) == 0 {\n    print("No todos yet!")\n    return None\n  }\n  print("\\n--- Todo List ---")\n  for (let i = 0; i < len(todos); i++) {\n    let status = todos[i].done ? "[x]" : "[ ]"\n    print(f"{status} {todos[i].id}. {todos[i].text}")\n  }\n  print("---")\n}\n\n# Let\'s use our todo app\naddTodo("Learn OmniLang syntax")\naddTodo("Build a web app")\naddTodo("Deploy to production")\n\nlistTodos()\n\ncompleteTodo(1)\nprint("")\nlistTodos()\n\n# Filter with list-like operations\nlet pending = todos.filter(t => not t.done)\nprint(f"\\nPending items: {len(pending)}")\n',
      },
    },
    "api-client": {
      name: "API Client",
      emoji: "\u{1F310}",
      description: "HTTP client demo using Go-like syntax",
      files: {
        "main.ol":
          '# API Client in OmniLang\n# Demonstrates Go-like syntax\n\n# Go-style short variable declarations\nbaseUrl := "https://jsonplaceholder.typicode.com"\ntimeout := 5000\n\n# Go-style functions\nfunc buildUrl(endpoint) {\n  return f"{baseUrl}{endpoint}"\n}\n\nfunc logRequest(method, url) {\n  fmt.Println(f"[{method}] {url}")\n}\n\n# Simulate API responses\nfunc getUsers() {\n  url := buildUrl("/users")\n  logRequest("GET", url)\n\n  # Simulated response\n  let users := [\n    { id: 1, name: "Alice", email: "alice@example.com" },\n    { id: 2, name: "Bob", email: "bob@example.com" },\n    { id: 3, name: "Charlie", email: "charlie@example.com" },\n  ]\n\n  fmt.Println(f"Fetched {len(users)} users")\n  return users\n}\n\nfunc getUserById(id) {\n  url := buildUrl(f"/users/{id}")\n  logRequest("GET", url)\n\n  users := getUsers()\n  result := users.find(u => u.id == id)\n\n  if result == nil {\n    fmt.Println(f"User {id} not found")\n    return nil\n  }\n\n  fmt.Println(f"Found: {result.name}")\n  return result\n}\n\n# Main execution\nfmt.Println("=== OmniLang API Client ===")\nfmt.Println(f"Base URL: {baseUrl}")\nfmt.Println("")\n\nlet users = getUsers()\nfmt.Println("")\n\nfor (let i = 0; i < len(users); i++) {\n  fmt.Println(f"  {users[i].name} <{users[i].email}>")\n}\n\nfmt.Println("")\ngetUserById(2)\n',
      },
    },
    "data-processing": {
      name: "Data Processing",
      emoji: "\u{1F4CA}",
      description: "Pattern matching and data operations using Rust-like syntax",
      files: {
        "main.ol":
          '# Data Processing in OmniLang\n# Demonstrates Rust-like syntax\n\n# Rust-style function declarations\nfn parseStatus(code) {\n  match code {\n    200 => return "OK",\n    301 => return "Redirect",\n    404 => return "Not Found",\n    500 => return "Server Error",\n    _ => return "Unknown",\n  }\n}\n\nfn processData(items) {\n  println!("Processing data...")\n\n  let total := 0\n  let valid := 0\n  let invalid := 0\n\n  for (let i = 0; i < len(items); i++) {\n    let item = items[i]\n    if item.value != None and item.value > 0 {\n      total += item.value\n      valid += 1\n    } else {\n      invalid += 1\n      println!(f"  Warning: Invalid item at index {i}")\n    }\n  }\n\n  println!(f"  Total: {total}")\n  println!(f"  Valid: {valid}")\n  println!(f"  Invalid: {invalid}")\n\n  return { total: total, valid: valid, invalid: invalid }\n}\n\nfn categorize(value) {\n  if value > 100 {\n    return "high"\n  } elif value > 50 {\n    return "medium"\n  } elif value > 0 {\n    return "low"\n  }\n  return "none"\n}\n\n# Main\nprintln!("=== Data Processing Pipeline ===")\nprintln!("")\n\n# Test status parsing\nlet codes = [200, 301, 404, 500, 418]\nfor (let i = 0; i < len(codes); i++) {\n  println!(f"HTTP {codes[i]}: {parseStatus(codes[i])}")\n}\n\nprintln!("")\n\n# Process data\nlet data := [\n  { name: "A", value: 150 },\n  { name: "B", value: 75 },\n  { name: "C", value: None },\n  { name: "D", value: 30 },\n  { name: "E", value: -5 },\n]\n\nlet stats = processData(data)\nprintln!(f"\\nAverage (valid): {stats.total / stats.valid}")\n\n# Categorize\nprintln!("\\nCategories:")\nlet values = [150, 75, 30, 0]\nfor (let i = 0; i < len(values); i++) {\n  println!(f"  {values[i]} -> {categorize(values[i])}")\n}\n\n# List comprehension for data transform\nlet doubled = [data[i].value * 2 for i in range(3)]\nprintln!(f"\\nFirst 3 doubled: {doubled}")\n',
      },
    },
    blank: {
      name: "Blank Project",
      emoji: "\u{1F4DD}",
      description: "Start from scratch with an empty OmniLang file",
      files: {
        "main.ol": "# Your OmniLang code here\n\n",
      },
    },
  };

  // ========== AI ASSISTANT (SIMULATED) ==========
  var AIAssistant = {
    responses: {
      explain: [
        'This code defines a function using OmniLang\'s multi-language syntax. The <code>def</code> keyword (from Python) creates a function declaration, which transpiles to JavaScript\'s <code>function</code> keyword.\n\nThe <code>:=</code> operator (from Go) is a short variable declaration that transpiles to <code>let</code>. This makes variable declarations concise while maintaining JavaScript semantics.\n\nThe <code>print()</code> call maps to <code>console.log()</code>, and f-strings like <code>f"Hello {name}"</code> become JavaScript template literals.',
        "Looking at this code, I can see it uses several OmniLang features:\n\n1. <strong>Python-style functions</strong> (<code>def</code>) for readability\n2. <strong>Go-style declarations</strong> (<code>:=</code>) for conciseness\n3. <strong>List comprehensions</strong> for functional data transformation\n\nThe transpiler converts all of these to valid JavaScript while preserving the original logic.",
      ],
      fix: [
        'I found the issue. It looks like there\'s a missing closing brace. Here\'s the fix:\n\n<pre><code>def greet(name) {\n  print(f"Hello, {name}!")\n}</code></pre>\n\nMake sure every <code>{</code> has a matching <code>}</code>.',
        "The error is likely caused by using Python-style indentation without braces. OmniLang requires curly braces for blocks (like JavaScript), even though it supports Python keywords.\n\nTry wrapping your block in <code>{ }</code> and the error should resolve.",
      ],
      generate: [
        'Here\'s a sorting function in OmniLang:\n\n<pre><code># Bubble sort in OmniLang\ndef bubbleSort(arr) {\n  n := len(arr)\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if arr[j] > arr[j + 1] {\n        let temp = arr[j]\n        arr[j] = arr[j + 1]\n        arr[j + 1] = temp\n      }\n    }\n  }\n  return arr\n}\n\nlet nums = [64, 34, 25, 12, 22, 11, 90]\nprint(f"Sorted: {bubbleSort(nums)}")</code></pre>',
        'Here\'s a simple counter class using OmniLang:\n\n<pre><code># Counter using impl blocks\nfn Counter() {\n  this.count = 0\n}\n\nimpl Counter {\n  fn increment() {\n    self.count += 1\n  }\n  fn getCount() {\n    return self.count\n  }\n}\n\nlet c = new Counter()\nc.increment()\nc.increment()\nprint(f"Count: {c.getCount()}")</code></pre>',
      ],
      refactor: [
        "Here are some suggestions to improve this code:\n\n1. <strong>Use descriptive variable names</strong> \u2014 replace single-letter variables\n2. <strong>Extract repeated logic</strong> into helper functions\n3. <strong>Use list comprehensions</strong> instead of manual loops where possible\n4. <strong>Add error handling</strong> with try/catch blocks\n\nOmniLang supports all JavaScript error handling patterns while giving you cleaner syntax.",
      ],
      document: [
        "Here's documentation for your code:\n\n<pre><code># Module: main.ol\n# Description: Main entry point for the application\n#\n# Functions:\n#   greet(name) - Prints a greeting message\n#     @param name {string} - The name to greet\n#\n#   add(a, b) - Returns the sum of two numbers\n#     @param a {number}\n#     @param b {number}\n#     @returns {number}\n</code></pre>",
      ],
    },

    getResponse: function (type, context) {
      var pool = this.responses[type] || this.responses.explain;
      var response = pool[Math.floor(Math.random() * pool.length)];

      if (context && context.length > 0) {
        var firstLine = context.split("\n")[0].trim();
        if (firstLine.length > 0) {
          response =
            "Analyzing your code starting with <code>" +
            this._escapeHtml(firstLine.substring(0, 50)) +
            "</code>...\n\n" +
            response;
        }
      }

      return response;
    },

    getChatResponse: function (message) {
      var lower = message.toLowerCase();
      if (lower.indexOf("how") !== -1 && lower.indexOf("function") !== -1) {
        return 'In OmniLang, you can define functions using any of these keywords:\n\n<pre><code># Python-style\ndef myFunc(a, b) { return a + b }\n\n# Go-style\nfunc myFunc(a, b) { return a + b }\n\n# Rust-style\nfn myFunc(a, b) { return a + b }</code></pre>\n\nAll three transpile to JavaScript\'s <code>function</code> keyword.';
      }
      if (lower.indexOf("variable") !== -1 || lower.indexOf("declare") !== -1) {
        return "OmniLang offers several ways to declare variables:\n\n<pre><code># Go-style (transpiles to let)\nx := 5\n\n# Rust-style (let without mut = const)\nlet immutable = 10\nlet mut mutable = 20\n\n# C#/Java style\nvar count = 0  # transpiles to let</code></pre>";
      }
      if (lower.indexOf("loop") !== -1 || lower.indexOf("iterate") !== -1) {
        return "OmniLang supports standard JavaScript loops plus some extras:\n\n<pre><code># Standard for loop\nfor (let i = 0; i < 10; i++) {\n  print(i)\n}\n\n# List comprehension (Python-style)\nlet doubled = [x * 2 for x in range(10)]\n\n# For-of loop\nfor (let item of items) {\n  print(item)\n}</code></pre>";
      }
      if (lower.indexOf("match") !== -1 || lower.indexOf("switch") !== -1) {
        return 'OmniLang supports Rust-style match expressions:\n\n<pre><code>match status {\n  "ok" => print("All good!"),\n  "error" => print("Something broke"),\n  _ => print("Unknown status"),\n}</code></pre>\n\nThis transpiles to a JavaScript <code>switch</code> statement with <code>case</code> and <code>break</code>.';
      }
      return 'That\'s a great question! OmniLang is designed to let you write in whichever style you\'re most comfortable with. Since it\'s a JavaScript superset, anything valid in JS also works in OmniLang.\n\nKey features:\n- <code>def</code>/<code>func</code>/<code>fn</code> for functions\n- <code>:=</code> for short declarations\n- <code>print()</code> for output\n- List comprehensions\n- Pattern matching with <code>match</code>\n\nTry writing some code and I\'ll help you optimize it!';
    },

    _escapeHtml: function (str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

  // ========== AI AGENTS ==========
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
    editorSettings: {
      fontSize: 14,
      tabSize: 2,
      minimap: true,
      wordWrap: false,
    },
    envVars: [
      { key: "NODE_ENV", value: "production" },
      { key: "", value: "" },
    ],
    buildLogs: [],
    deployUrl: null,
  };

  // ========== MAIN APP ==========
  var App = {
    init: function () {
      FileSystem.init(SampleProjects["hello-world"].files);
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

      // Show welcome in console
      this._addConsoleLine("info", "Welcome to OmniLang IDE v1.0");
      this._addConsoleLine("info", 'Type OmniLang expressions or "help" for commands');

      // Hide loading
      setTimeout(function () {
        var splash = document.getElementById("loadingSplash");
        if (splash) splash.classList.add("hidden");
        setTimeout(function () {
          if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
        }, 500);
      }, 1200);
    },

    // ===== MODE SWITCHING =====
    switchMode: function (mode) {
      State.currentMode = mode;

      // Update mode tabs
      document.querySelectorAll(".mode-tab").forEach(function (tab) {
        tab.classList.toggle("active", tab.dataset.mode === mode);
      });

      // Update left panel
      document.querySelectorAll(".left-mode-content").forEach(function (el) {
        el.classList.toggle("active", el.dataset.leftMode === mode);
      });

      // Update right panel
      document.querySelectorAll(".right-mode-content").forEach(function (el) {
        el.classList.toggle("active", el.dataset.rightMode === mode);
      });

      // Update status bar mode indicator
      var modeNames = { question: "Question", coding: "Coding", agents: "Agents", deploy: "Deploy" };
      var footerMode = document.getElementById("footerMode");
      if (footerMode) footerMode.textContent = modeNames[mode] || mode;

      // Re-layout Monaco
      if (State.monacoEditor) {
        setTimeout(function () {
          State.monacoEditor.layout();
        }, 50);
      }
    },

    // ===== FILE TREE =====
    renderFileTree: function () {
      var tree = document.getElementById("fileTree");
      if (!tree) return;
      tree.innerHTML = "";
      var items = FileSystem.listDir("");
      var self = this;
      items.forEach(function (path) {
        self._renderTreeItem(tree, path, 0);
      });

      var nameEl = document.getElementById("explorerProjectName");
      var projectInput = document.getElementById("projectName");
      if (nameEl && projectInput) {
        nameEl.textContent = projectInput.value.toUpperCase();
      }
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
        item.innerHTML =
          '<div class="file-tree-toggle open"><svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l4 4-4 4z"/></svg></div>' +
          '<div class="file-tree-icon" style="color:var(--accent-blue)">\u{1F4C1}</div>' +
          '<span class="file-tree-name">' + name + "</span>";
        item.onclick = function (e) {
          e.stopPropagation();
          var toggle = item.querySelector(".file-tree-toggle");
          var children = item.nextElementSibling;
          if (toggle) toggle.classList.toggle("open");
          if (children && children.classList.contains("file-tree-children")) {
            children.style.display = children.style.display === "none" ? "block" : "none";
          }
        };
        container.appendChild(item);

        var childContainer = document.createElement("div");
        childContainer.className = "file-tree-children";
        var children = FileSystem.listDir(path);
        children.forEach(function (childPath) {
          self._renderTreeItem(childContainer, childPath, depth + 1);
        });
        container.appendChild(childContainer);
      } else {
        var icon = this._getFileIcon(ext);
        item.innerHTML =
          '<div class="file-tree-icon">' + icon + "</div>" +
          '<span class="file-tree-name">' + name + "</span>" +
          '<div class="file-tree-actions">' +
          '<div class="file-tree-action" title="Delete"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 01-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/></svg></div>' +
          "</div>";
        item.onclick = function (e) {
          e.stopPropagation();
          self.openFile(path);
        };
        var deleteBtn = item.querySelector(".file-tree-action");
        if (deleteBtn) {
          deleteBtn.onclick = function (e) {
            e.stopPropagation();
            self.deleteFile(path);
          };
        }
        container.appendChild(item);
      }
    },

    _getFileIcon: function (ext) {
      var icons = {
        ".ol": '<span style="color:#58a6ff">OL</span>',
        ".js": '<span style="color:#f1e05a">JS</span>',
        ".css": '<span style="color:#563d7c">C</span>',
        ".html": '<span style="color:#e34c26">H</span>',
        ".json": '<span style="color:#d29922">{}</span>',
        ".md": '<span style="color:#8b949e">M</span>',
      };
      return icons[ext] || '<span style="color:#8b949e">\u25CF</span>';
    },

    // ===== FILE OPERATIONS =====
    openFile: function (path) {
      if (State.openFiles.indexOf(path) === -1) {
        State.openFiles.push(path);
      }
      State.currentFile = path;
      this.renderEditorTabs();
      this.renderFileTree();
      this.loadFileInEditor(path);
    },

    closeFile: function (path) {
      var idx = State.openFiles.indexOf(path);
      if (idx !== -1) {
        State.openFiles.splice(idx, 1);
      }
      if (State.currentFile === path) {
        State.currentFile = State.openFiles.length > 0 ? State.openFiles[State.openFiles.length - 1] : null;
      }
      this.renderEditorTabs();
      this.renderFileTree();
      if (State.currentFile) {
        this.loadFileInEditor(State.currentFile);
      }
    },

    loadFileInEditor: function (path) {
      if (!State.monacoEditor) return;
      var file = FileSystem.getFile(path);
      if (!file) return;

      var ext = FileSystem.getExtension(path);
      var langMap = {
        ".ol": "omnilang",
        ".js": "javascript",
        ".css": "css",
        ".html": "html",
        ".json": "json",
        ".md": "markdown",
      };
      var lang = langMap[ext] || "plaintext";

      var model = State.monacoEditor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, lang);
        model.setValue(file.content);
      }

      var langEl = document.getElementById("footerLang");
      if (langEl) {
        langEl.textContent = ext === ".ol" ? "OmniLang" : lang;
      }
    },

    saveCurrentFile: function () {
      if (!State.monacoEditor || !State.currentFile) return;
      var content = State.monacoEditor.getValue();
      FileSystem.setFile(State.currentFile, content);
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
        tab.innerHTML =
          '<span class="editor-tab-icon">' + icon + "</span>" +
          name +
          '<div class="editor-tab-close">\u00D7</div>';
        tab.onclick = function () {
          self.openFile(path);
        };
        var close = tab.querySelector(".editor-tab-close");
        if (close) {
          close.onclick = function (e) {
            e.stopPropagation();
            self.closeFile(path);
          };
        }
        tabs.appendChild(tab);
      });
    },

    // ===== MONACO EDITOR =====
    initMonaco: function () {
      var self = this;
      require.config({
        paths: {
          vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
        },
      });

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
        keywords: [
          "def", "func", "fn", "let", "mut", "var", "const", "if", "else", "elif",
          "for", "while", "return", "match", "impl", "class", "new", "this", "self",
          "import", "from", "export", "default", "try", "catch", "finally", "throw",
          "async", "await", "yield", "in", "of", "typeof", "instanceof", "delete",
          "void", "break", "continue", "switch", "case", "and", "or", "not",
        ],
        builtins: [
          "True", "False", "None", "nil", "print", "println!", "fmt", "Console",
          "System", "len", "range",
        ],
        typeKeywords: [
          "string", "number", "boolean", "object", "array", "function", "undefined", "null",
        ],
        operators: [
          ":=", "=>", "==", "===", "!=", "!==", "<=", ">=", "&&", "||", "**", "+=", "-=", "*=", "/=",
        ],
        symbols: /[=><!~?:&|+\-*/^%]+/,

        tokenizer: {
          root: [
            [/#.*$/, "comment"],
            [/\/\/.*$/, "comment"],
            [/\/\*/, "comment", "@comment"],
            [/f"/, "string", "@fstring_double"],
            [/f'/, "string", "@fstring_single"],
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/'([^'\\]|\\.)*$/, "string.invalid"],
            [/"/, "string", "@string_double"],
            [/'/, "string", "@string_single"],
            [/`/, "string", "@string_backtick"],
            [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
            [/0[xX][0-9a-fA-F]+/, "number.hex"],
            [/\d+/, "number"],
            [
              /[a-zA-Z_]\w*/,
              {
                cases: {
                  "@keywords": "keyword",
                  "@builtins": "type.identifier",
                  "@typeKeywords": "type",
                  "@default": "identifier",
                },
              },
            ],
            [/:=/, "operator"],
            [/=>/, "operator"],
            [
              /@symbols/,
              {
                cases: {
                  "@operators": "operator",
                  "@default": "",
                },
              },
            ],
            [/[{}()[\]]/, "@brackets"],
            [/[,;.]/, "delimiter"],
          ],
          comment: [
            [/[^/*]+/, "comment"],
            [/\*\//, "comment", "@pop"],
            [/[/*]/, "comment"],
          ],
          string_double: [
            [/[^\\"]+/, "string"],
            [/\\./, "string.escape"],
            [/"/, "string", "@pop"],
          ],
          string_single: [
            [/[^\\']+/, "string"],
            [/\\./, "string.escape"],
            [/'/, "string", "@pop"],
          ],
          string_backtick: [
            [/\$\{/, "string", "@bracketCounting"],
            [/[^\\`$]+/, "string"],
            [/\\./, "string.escape"],
            [/`/, "string", "@pop"],
          ],
          fstring_double: [
            [/\{/, "string", "@bracketCounting"],
            [/[^\\"{}]+/, "string"],
            [/\\./, "string.escape"],
            [/"/, "string", "@pop"],
          ],
          fstring_single: [
            [/\{/, "string", "@bracketCounting"],
            [/[^\\'{}]+/, "string"],
            [/\\./, "string.escape"],
            [/'/, "string", "@pop"],
          ],
          bracketCounting: [
            [/\{/, "string", "@bracketCounting"],
            [/\}/, "string", "@pop"],
            [/./, "identifier"],
          ],
        },
      });

      // Completions
      monaco.languages.registerCompletionItemProvider("omnilang", {
        provideCompletionItems: function () {
          var suggestions = [
            { label: "def", kind: 14, insertText: "def ${1:name}(${2:params}) {\n\t$0\n}", insertTextRules: 4, documentation: "Define a function (Python-style)" },
            { label: "func", kind: 14, insertText: "func ${1:name}(${2:params}) {\n\t$0\n}", insertTextRules: 4, documentation: "Define a function (Go-style)" },
            { label: "fn", kind: 14, insertText: "fn ${1:name}(${2:params}) {\n\t$0\n}", insertTextRules: 4, documentation: "Define a function (Rust-style)" },
            { label: "print", kind: 1, insertText: "print(${1})", insertTextRules: 4, documentation: "Print to console" },
            { label: "println!", kind: 1, insertText: "println!(${1})", insertTextRules: 4, documentation: "Print to console (Rust-style)" },
            { label: "fmt.Println", kind: 1, insertText: "fmt.Println(${1})", insertTextRules: 4, documentation: "Print to console (Go-style)" },
            { label: "range", kind: 1, insertText: "range(${1:n})", insertTextRules: 4, documentation: "Generate range array" },
            { label: "len", kind: 1, insertText: "len(${1})", insertTextRules: 4, documentation: "Get length" },
            { label: "match", kind: 14, insertText: "match ${1:value} {\n\t${2:pattern} => ${3:expr},\n\t_ => ${4:default},\n}", insertTextRules: 4, documentation: "Pattern matching (Rust-style)" },
            { label: "impl", kind: 14, insertText: "impl ${1:ClassName} {\n\tfn ${2:method}() {\n\t\t$0\n\t}\n}", insertTextRules: 4, documentation: "Implementation block (Rust-style)" },
            { label: "if", kind: 14, insertText: "if ${1:condition} {\n\t$0\n}", insertTextRules: 4, documentation: "If statement" },
            { label: "elif", kind: 14, insertText: "elif ${1:condition} {\n\t$0\n}", insertTextRules: 4, documentation: "Else if (Python-style)" },
            { label: "for", kind: 14, insertText: "for (let ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}", insertTextRules: 4, documentation: "For loop" },
            { label: "True", kind: 14, insertText: "True", documentation: "Boolean true (Python-style)" },
            { label: "False", kind: 14, insertText: "False", documentation: "Boolean false (Python-style)" },
            { label: "None", kind: 14, insertText: "None", documentation: "Null value (Python-style)" },
            { label: "nil", kind: 14, insertText: "nil", documentation: "Null value (Go-style)" },
          ];
          return { suggestions: suggestions };
        },
      });

      // Dark theme
      monaco.editor.defineTheme("omnilang-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "bc8cff", fontStyle: "bold" },
          { token: "type.identifier", foreground: "58a6ff" },
          { token: "type", foreground: "39d2c0" },
          { token: "string", foreground: "3fb950" },
          { token: "string.escape", foreground: "79c0ff" },
          { token: "number", foreground: "d29922" },
          { token: "number.float", foreground: "d29922" },
          { token: "number.hex", foreground: "d29922" },
          { token: "comment", foreground: "484f58", fontStyle: "italic" },
          { token: "operator", foreground: "79c0ff" },
          { token: "identifier", foreground: "e6edf3" },
          { token: "delimiter", foreground: "8b949e" },
        ],
        colors: {
          "editor.background": "#0d1117",
          "editor.foreground": "#e6edf3",
          "editorLineNumber.foreground": "#484f58",
          "editorLineNumber.activeForeground": "#e6edf3",
          "editor.selectionBackground": "#264f78",
          "editor.lineHighlightBackground": "#161b2288",
          "editorCursor.foreground": "#58a6ff",
          "editorWhitespace.foreground": "#21262d",
          "editorIndentGuide.background1": "#21262d",
          "editorBracketMatch.background": "#17e5e633",
          "editorBracketMatch.border": "#17e5e6",
          "editor.selectionHighlightBackground": "#3fb95033",
          "minimap.background": "#0d1117",
          "scrollbar.shadow": "#00000000",
          "editorOverviewRuler.border": "#00000000",
        },
      });

      // Light theme
      monaco.editor.defineTheme("omnilang-light", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "keyword", foreground: "8250df", fontStyle: "bold" },
          { token: "type.identifier", foreground: "0550ae" },
          { token: "type", foreground: "1b7c83" },
          { token: "string", foreground: "0a3069" },
          { token: "number", foreground: "953800" },
          { token: "comment", foreground: "6e7781", fontStyle: "italic" },
          { token: "operator", foreground: "0550ae" },
        ],
        colors: {
          "editor.background": "#ffffff",
          "editor.foreground": "#1f2328",
          "editorLineNumber.foreground": "#8b949e",
          "editor.lineHighlightBackground": "#f6f8fa88",
          "editorCursor.foreground": "#0969da",
        },
      });
    },

    _createEditor: function () {
      var container = document.getElementById("monaco-editor");
      if (!container) return;

      State.monacoEditor = monaco.editor.create(container, {
        value: "",
        language: "omnilang",
        theme: "omnilang-dark",
        fontSize: State.editorSettings.fontSize,
        tabSize: State.editorSettings.tabSize,
        minimap: { enabled: State.editorSettings.minimap },
        wordWrap: State.editorSettings.wordWrap ? "on" : "off",
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderWhitespace: "selection",
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: true },
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        padding: { top: 8 },
        fontFamily: "'JetBrains Mono', monospace",
        fontLigatures: true,
        lineHeight: 22,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
      });

      var self = this;
      State.monacoEditor.onDidChangeModelContent(function () {
        self.saveCurrentFile();
        self._updateTranspiled();
      });

      State.monacoEditor.onDidChangeCursorPosition(function (e) {
        var cursorEl = document.getElementById("footerCursor");
        if (cursorEl) {
          cursorEl.textContent = "Ln " + e.position.lineNumber + ", Col " + e.position.column;
        }
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
      State.openFiles.forEach(function (path) {
        if (FileSystem.getExtension(path) === ".ol") {
          var file = FileSystem.getFile(path);
          if (file) allCode += file.content + "\n";
        }
      });

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

      console.log = function () {
        var args = Array.from(arguments);
        var text = args.map(function (a) {
          if (typeof a === "object") return JSON.stringify(a, null, 2);
          return String(a);
        }).join(" ");
        output.push({ type: "log", text: text });
      };
      console.warn = function () {
        var args = Array.from(arguments);
        output.push({ type: "warn", text: args.map(String).join(" ") });
      };
      console.error = function () {
        var args = Array.from(arguments);
        output.push({ type: "error", text: args.map(String).join(" ") });
      };

      var statusEl = document.getElementById("footerStatus");
      var self = this;
      try {
        if (statusEl) statusEl.textContent = "Running...";
        var run = new Function(transpiled);
        run();
        if (statusEl) statusEl.textContent = "Done";
        if (output.length === 0) {
          output.push({ type: "log", text: "(No output)" });
        }
      } catch (err) {
        output.push({ type: "error", text: "Error: " + err.message });
        State.problems.push({
          line: self._extractLineNumber(err),
          message: err.message,
          severity: "error",
        });
        if (statusEl) statusEl.textContent = "Error";
      }

      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;

      // Add output to console
      this._addConsoleLine("cmd", "$ run " + (State.currentFile || "main.ol"));
      output.forEach(function (item) {
        self._addConsoleLine(item.type, item.text);
      });

      State.problems = State.problems.concat(Transpiler.errors).concat(Transpiler.warnings);
      this._renderProblems();
    },

    _extractLineNumber: function (err) {
      if (err.stack) {
        var match = err.stack.match(/:(\d+):\d+/);
        if (match) return parseInt(match[1], 10);
      }
      return 0;
    },

    _renderProblems: function () {
      var panel = document.getElementById("problemsPanel");
      if (!panel) return;

      panel.innerHTML = "";

      if (State.problems.length === 0) {
        panel.innerHTML = '<div style="color:var(--text-muted);font-size:12px">No problems detected.</div>';
        return;
      }

      State.problems.forEach(function (problem) {
        var item = document.createElement("div");
        item.className = "problem-item";
        var iconColor = problem.severity === "error" ? "var(--accent-red)" : "var(--accent-orange)";
        item.innerHTML =
          '<span class="problem-icon" style="color:' + iconColor + '">' +
          (problem.severity === "error" ? "\u2716" : "\u26A0") + "</span>" +
          '<span class="problem-message">' + problem.message + "</span>" +
          '<span class="problem-location">Line ' + problem.line + "</span>";
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

          // Show command
          self._addConsoleLine("cmd", "omnilang> " + code);

          // Handle special commands
          if (code === "help") {
            self._addConsoleLine("info", "Commands: run, clear, help, theme");
            self._addConsoleLine("info", "Or type any OmniLang expression to evaluate");
            input.value = "";
            return;
          }
          if (code === "clear") {
            var outputEl = document.getElementById("consoleOutput");
            if (outputEl) outputEl.innerHTML = "";
            self._addConsoleLine("info", "Console cleared");
            input.value = "";
            return;
          }
          if (code === "run") {
            self.runCode();
            input.value = "";
            return;
          }
          if (code === "theme") {
            self.toggleTheme();
            self._addConsoleLine("info", "Switched to " + State.theme + " mode");
            input.value = "";
            return;
          }

          // In question mode, send to AI
          if (State.currentMode === "question") {
            self._addAIMessage("user", code);
            var response = AIAssistant.getChatResponse(code);
            setTimeout(function () {
              self._addAIMessage("assistant", response);
            }, 400 + Math.random() * 800);
            input.value = "";
            return;
          }

          // Transpile & execute
          var transpiled = Transpiler.transpile(code);
          try {
            var origLog = console.log;
            var logs = [];
            console.log = function () {
              logs.push(
                Array.from(arguments).map(function (a) {
                  return typeof a === "object" ? JSON.stringify(a, null, 2) : String(a);
                }).join(" ")
              );
            };

            var result = eval(transpiled);
            console.log = origLog;

            if (logs.length > 0) {
              logs.forEach(function (log) {
                self._addConsoleLine("success", log);
              });
            }

            if (result !== undefined) {
              self._addConsoleLine("log", typeof result === "object" ? JSON.stringify(result, null, 2) : String(result));
            }
          } catch (err) {
            self._addConsoleLine("error", "Error: " + err.message);
          }

          input.value = "";
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (State.terminalHistoryIndex > 0) {
            State.terminalHistoryIndex--;
            input.value = State.terminalHistory[State.terminalHistoryIndex];
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          if (State.terminalHistoryIndex < State.terminalHistory.length - 1) {
            State.terminalHistoryIndex++;
            input.value = State.terminalHistory[State.terminalHistoryIndex];
          } else {
            State.terminalHistoryIndex = State.terminalHistory.length;
            input.value = "";
          }
        }
      });
    },

    // ===== CONSOLE RESIZE =====
    initConsoleResize: function () {
      var handle = document.getElementById("consoleResize");
      var consoleArea = document.getElementById("consoleArea");
      if (!handle || !consoleArea) return;

      var startY = 0;
      var startH = 0;

      function onMouseMove(e) {
        var delta = startY - e.clientY;
        var newH = Math.max(80, Math.min(window.innerHeight * 0.6, startH + delta));
        consoleArea.style.height = newH + "px";
        if (State.monacoEditor) State.monacoEditor.layout();
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }

      handle.addEventListener("mousedown", function (e) {
        e.preventDefault();
        startY = e.clientY;
        startH = consoleArea.offsetHeight;
        document.body.style.cursor = "ns-resize";
        document.body.style.userSelect = "none";
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });

      // Double-click to reset
      handle.addEventListener("dblclick", function () {
        consoleArea.style.height = "220px";
        if (State.monacoEditor) State.monacoEditor.layout();
      });
    },

    // ===== PANEL RESIZE =====
    initPanelResize: function () {
      var self = this;

      // Left panel resize
      var leftHandle = document.getElementById("leftResizeHandle");
      var leftPanel = document.getElementById("leftPanel");
      if (leftHandle && leftPanel) {
        var leftStartX = 0;
        var leftStartW = 0;

        function onLeftMove(e) {
          var delta = e.clientX - leftStartX;
          var newW = Math.max(180, Math.min(400, leftStartW + delta));
          leftPanel.style.width = newW + "px";
          document.documentElement.style.setProperty("--left-w", newW + "px");
          if (State.monacoEditor) State.monacoEditor.layout();
        }

        function onLeftUp() {
          document.removeEventListener("mousemove", onLeftMove);
          document.removeEventListener("mouseup", onLeftUp);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        }

        leftHandle.addEventListener("mousedown", function (e) {
          e.preventDefault();
          leftStartX = e.clientX;
          leftStartW = leftPanel.offsetWidth;
          document.body.style.cursor = "ew-resize";
          document.body.style.userSelect = "none";
          document.addEventListener("mousemove", onLeftMove);
          document.addEventListener("mouseup", onLeftUp);
        });

        leftHandle.addEventListener("dblclick", function () {
          if (leftPanel.offsetWidth > 40) {
            leftPanel.style.width = "0px";
            document.documentElement.style.setProperty("--left-w", "0px");
          } else {
            leftPanel.style.width = "220px";
            document.documentElement.style.setProperty("--left-w", "220px");
          }
          if (State.monacoEditor) State.monacoEditor.layout();
        });
      }

      // Right panel resize
      var rightHandle = document.getElementById("rightResizeHandle");
      var rightPanel = document.getElementById("rightPanel");
      if (rightHandle && rightPanel) {
        var rightStartX = 0;
        var rightStartW = 0;

        function onRightMove(e) {
          var delta = rightStartX - e.clientX;
          var newW = Math.max(200, Math.min(500, rightStartW + delta));
          rightPanel.style.width = newW + "px";
          document.documentElement.style.setProperty("--right-w", newW + "px");
          if (State.monacoEditor) self._layoutEditor();
        }

        function onRightUp() {
          document.removeEventListener("mousemove", onRightMove);
          document.removeEventListener("mouseup", onRightUp);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        }

        rightHandle.addEventListener("mousedown", function (e) {
          e.preventDefault();
          rightStartX = e.clientX;
          rightStartW = rightPanel.offsetWidth;
          document.body.style.cursor = "ew-resize";
          document.body.style.userSelect = "none";
          document.addEventListener("mousemove", onRightMove);
          document.addEventListener("mouseup", onRightUp);
        });

        rightHandle.addEventListener("dblclick", function () {
          if (rightPanel.offsetWidth > 40) {
            rightPanel.style.width = "0px";
            document.documentElement.style.setProperty("--right-w", "0px");
          } else {
            rightPanel.style.width = "300px";
            document.documentElement.style.setProperty("--right-w", "300px");
          }
          if (State.monacoEditor) self._layoutEditor();
        });
      }
    },

    _layoutEditor: function () {
      if (State.monacoEditor) State.monacoEditor.layout();
    },

    // ===== KEYBOARD SHORTCUTS =====
    initKeyboard: function () {
      var self = this;
      document.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          self.runCode();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          self.saveCurrentFile();
          var statusEl = document.getElementById("footerStatus");
          if (statusEl) {
            statusEl.textContent = "Saved";
            setTimeout(function () {
              statusEl.textContent = "Ready";
            }, 1500);
          }
        }
      });
    },

    // ===== THEME =====
    toggleTheme: function () {
      State.theme = State.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", State.theme);
      if (State.monacoEditor) {
        monaco.editor.setTheme(State.theme === "dark" ? "omnilang-dark" : "omnilang-light");
      }
    },

    // ===== RIGHT PANEL TABS (Coding mode) =====
    switchRightTab: function (tab) {
      State.rightCodingTab = tab;
      document.querySelectorAll("[data-rtab]").forEach(function (t) {
        t.classList.toggle("active", t.dataset.rtab === tab);
      });
      document.querySelectorAll("[data-rtab-content]").forEach(function (el) {
        el.classList.toggle("active", el.dataset.rtabContent === tab);
      });
    },

    // ===== LANGUAGE REFERENCE =====
    renderRefPanel: function () {
      var content = document.getElementById("refContent");
      if (!content) return;

      content.innerHTML =
        '<div class="ref-section">' +
        "<h4>Function Declarations</h4>" +
        '<table class="ref-table">' +
        "<thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead>" +
        "<tbody>" +
        "<tr><td>def greet(name) { }</td><td>function greet(name) { }</td><td>Python</td></tr>" +
        "<tr><td>func add(a, b) { }</td><td>function add(a, b) { }</td><td>Go</td></tr>" +
        "<tr><td>fn multiply(a, b) { }</td><td>function multiply(a, b) { }</td><td>Rust</td></tr>" +
        "</tbody></table></div>" +
        '<div class="ref-section">' +
        "<h4>Variables</h4>" +
        '<table class="ref-table">' +
        "<thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead>" +
        "<tbody>" +
        "<tr><td>x := 5</td><td>let x = 5</td><td>Go</td></tr>" +
        "<tr><td>let mut x = 5</td><td>let x = 5</td><td>Rust</td></tr>" +
        "<tr><td>var x = 5</td><td>let x = 5</td><td>C#/Java</td></tr>" +
        "</tbody></table></div>" +
        '<div class="ref-section">' +
        "<h4>Output</h4>" +
        '<table class="ref-table">' +
        "<thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead>" +
        "<tbody>" +
        '<tr><td>print("hi")</td><td>console.log("hi")</td><td>Python</td></tr>' +
        '<tr><td>println!("hi")</td><td>console.log("hi")</td><td>Rust</td></tr>' +
        '<tr><td>fmt.Println("hi")</td><td>console.log("hi")</td><td>Go</td></tr>' +
        '<tr><td>Console.WriteLine("hi")</td><td>console.log("hi")</td><td>C#</td></tr>' +
        '<tr><td>System.out.println("hi")</td><td>console.log("hi")</td><td>Java</td></tr>' +
        "</tbody></table></div>" +
        '<div class="ref-section">' +
        "<h4>Booleans &amp; Null</h4>" +
        '<table class="ref-table">' +
        "<thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead>" +
        "<tbody>" +
        "<tr><td>True / False</td><td>true / false</td><td>Python</td></tr>" +
        "<tr><td>None</td><td>null</td><td>Python</td></tr>" +
        "<tr><td>nil</td><td>null</td><td>Go</td></tr>" +
        "<tr><td>and / or / not</td><td>&amp;&amp; / || / !</td><td>Python</td></tr>" +
        "</tbody></table></div>" +
        '<div class="ref-section">' +
        "<h4>Control Flow</h4>" +
        '<table class="ref-table">' +
        "<thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead>" +
        "<tbody>" +
        "<tr><td>elif</td><td>else if</td><td>Python</td></tr>" +
        "<tr><td>match val { ... }</td><td>switch (val) { ... }</td><td>Rust</td></tr>" +
        "<tr><td>_ =&gt; expr</td><td>default: expr; break;</td><td>Rust</td></tr>" +
        "</tbody></table></div>" +
        '<div class="ref-section">' +
        "<h4>Data &amp; Collections</h4>" +
        '<table class="ref-table">' +
        "<thead><tr><th>OmniLang</th><th>Transpiles To</th><th>Origin</th></tr></thead>" +
        "<tbody>" +
        "<tr><td>len(arr)</td><td>arr.length</td><td>Python</td></tr>" +
        "<tr><td>range(10)</td><td>Array.from({length:10},(_,i)=&gt;i)</td><td>Python</td></tr>" +
        "<tr><td>[x*2 for x in range(5)]</td><td>Array.from({length:5},(_,x)=&gt;x*2)</td><td>Python</td></tr>" +
        '<tr><td>f"Hello {name}"</td><td>`Hello ${name}`</td><td>Python</td></tr>' +
        "</tbody></table></div>";
    },

    // ===== AI / QUESTION MODE =====
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
          setTimeout(function () {
            self._addAIMessage("assistant", response);
          }, 400 + Math.random() * 800);
        }
      });
    },

    quickPrompt: function (type) {
      var code = "";
      if (State.monacoEditor) {
        var selection = State.monacoEditor.getSelection();
        var model = State.monacoEditor.getModel();
        if (selection && model && !selection.isEmpty()) {
          code = model.getValueInRange(selection);
        } else if (model) {
          code = model.getValue();
        }
      }

      var labels = {
        explain: "Explain this code",
        fix: "Fix errors in this code",
        generate: "Generate a code snippet",
        refactor: "Suggest refactoring improvements",
        document: "Generate documentation",
      };

      this._addAIMessage("user", labels[type] || "Help me");
      var response = AIAssistant.getResponse(type, code);
      var self = this;
      setTimeout(function () {
        self._addAIMessage("assistant", response);
      }, 400 + Math.random() * 800);

      // Switch to question mode
      this.switchMode("question");
    },

    _addAIMessage: function (role, content) {
      var container = document.getElementById("aiMessages");
      if (!container) return;

      var msg = document.createElement("div");
      msg.className = "ai-message fade-in";

      var avatarClass = role === "assistant" ? "assistant" : "user";
      var avatarText = role === "assistant" ? "AI" : "U";
      var nameText = role === "assistant" ? "OmniLang Assistant" : "You";

      msg.innerHTML =
        '<div class="ai-message-header">' +
        '<div class="ai-avatar ' + avatarClass + '">' + avatarText + "</div>" +
        "<span>" + nameText + "</span></div>" +
        '<div class="ai-message-content">' + content + "</div>";

      container.appendChild(msg);
      container.scrollTop = container.scrollHeight;

      // Also add to chat history in left panel
      if (role === "user") {
        var historyEl = document.getElementById("chatHistory");
        if (historyEl) {
          var item = document.createElement("div");
          item.className = "chat-history-item";
          item.textContent = content.substring(0, 60);
          historyEl.insertBefore(item, historyEl.firstChild);
        }
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
        card.innerHTML =
          '<div class="agent-icon">' + agent.icon + "</div>" +
          '<div class="agent-info">' +
          '<div class="agent-name">' + agent.name + "</div>" +
          '<div class="agent-desc">' + agent.desc + "</div>" +
          '<div class="agent-status"><span class="status-dot ' + agent.status + '"></span>' + agent.status + "</div>" +
          "</div>";
        card.onclick = function () {
          State.selectedAgent = idx;
          self.renderAgentsList();
          self.renderAgentDetail(idx);
        };
        list.appendChild(card);
      });
    },

    renderAgentDetail: function (idx) {
      var agent = AIAgents[idx];
      var panel = document.getElementById("agentDetailPanel");
      if (!panel || !agent) return;
      var self = this;

      panel.innerHTML =
        '<div class="agent-detail-header">' +
        '<div class="agent-detail-icon">' + agent.icon + "</div>" +
        "<div>" +
        '<div class="agent-detail-name">' + agent.name + "</div>" +
        '<div class="agent-status"><span class="status-dot ' + agent.status + '"></span>' + agent.status + "</div>" +
        "</div></div>" +
        '<div class="agent-config-section">' +
        "<h5>Description</h5>" +
        '<div style="font-size:12px;color:var(--text-primary);line-height:1.5">' + agent.desc + "</div>" +
        "</div>" +
        '<div class="agent-config-section">' +
        "<h5>Configuration</h5>" +
        '<div style="font-size:11px;color:var(--text-secondary)">Scope: Current file</div>' +
        '<div style="font-size:11px;color:var(--text-secondary)">Depth: Standard</div>' +
        "</div>" +
        '<button class="agent-run-btn" id="agentRunBtn">' +
        '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6z"/></svg>' +
        "Run Agent</button>" +
        '<div class="agent-config-section" style="margin-top:12px">' +
        "<h5>Activity Log</h5>" +
        '<div id="agentLog" style="font-family:var(--font-mono);font-size:11px;color:var(--text-secondary)">No activity yet</div>' +
        "</div>";

      var runBtn = document.getElementById("agentRunBtn");
      if (runBtn) {
        runBtn.onclick = function () {
          self.runAgent(idx);
        };
      }
    },

    runAgent: function (idx) {
      var agent = AIAgents[idx];
      agent.status = "running";
      this.renderAgentsList();
      this.renderAgentDetail(idx);

      var self = this;
      var logEl = document.getElementById("agentLog");
      if (logEl) logEl.innerHTML = '<div class="agent-log-entry">[' + new Date().toLocaleTimeString() + "] Starting " + agent.name + "...</div>";

      setTimeout(function () {
        if (logEl) logEl.innerHTML += '<div class="agent-log-entry">[' + new Date().toLocaleTimeString() + "] Analyzing code...</div>";
      }, 800);

      setTimeout(function () {
        if (logEl) logEl.innerHTML += '<div class="agent-log-entry">[' + new Date().toLocaleTimeString() + "] Analysis complete. Found 0 issues.</div>";
        agent.status = "complete";
        self.renderAgentsList();
        self.renderAgentDetail(idx);
        self._addConsoleLine("info", agent.name + " completed successfully");
      }, 2500);
    },

    createCustomAgent: function () {
      var name = prompt("Enter agent name:");
      if (!name) return;
      AIAgents.push({
        name: name,
        icon: "\u{1F916}",
        desc: "Custom agent",
        status: "idle",
      });
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
        item.innerHTML =
          '<div class="deploy-svc-icon" style="background:' + svc.color + ";color:" + svc.textColor + '">' + svc.icon + "</div>" +
          '<div class="deploy-svc-info">' +
          '<div class="deploy-svc-name">' + svc.name + "</div>" +
          '<div class="deploy-svc-status"><span class="status-dot ' + (svc.connected ? "connected" : "disconnected") + '"></span>' +
          (svc.connected ? "Connected" : "Not connected") +
          "</div></div>";
        item.onclick = function () {
          State.selectedHosting = idx;
          self.renderDeployServicesList();
          self.renderDeployConfig(idx);
        };
        list.appendChild(item);
      });
    },

    renderDeployConfig: function (idx) {
      var svc = HostingServices[idx];
      var panel = document.getElementById("deployConfigPanel");
      if (!panel || !svc) return;
      var self = this;

      var html =
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border-subtle)">' +
        '<div class="deploy-svc-icon" style="background:' + svc.color + ";color:" + svc.textColor + '">' + svc.icon + "</div>" +
        '<div><div style="font-weight:700;font-size:14px">' + svc.name + "</div>" +
        '<div class="deploy-svc-status"><span class="status-dot ' + (svc.connected ? "connected" : "disconnected") + '"></span>' +
        (svc.connected ? "Connected" : "Not connected") + "</div></div></div>";

      html += '<div style="display:flex;gap:6px;margin-bottom:14px">' +
        '<button class="btn-sm" id="deployConnectBtn">' + (svc.connected ? "Disconnect" : "Connect") + "</button>" +
        '<button class="btn-sm primary" id="deployDeployBtn" ' + (svc.connected ? "" : "disabled") + ">Deploy</button></div>";

      html += '<div class="deploy-field"><label>Region</label>' +
        "<select>" +
        "<option>US East (N. Virginia)</option>" +
        "<option>US West (Oregon)</option>" +
        "<option>EU (Frankfurt)</option>" +
        "<option>Asia (Singapore)</option>" +
        "</select></div>";

      // Env vars
      html += '<div class="deploy-field"><label>Environment Variables</label>' +
        '<div id="deployEnvVars">';
      State.envVars.forEach(function (ev, i) {
        html += '<div class="env-var-row">' +
          '<input placeholder="KEY" value="' + (ev.key || "") + '" data-env-idx="' + i + '" data-env-field="key">' +
          '<input placeholder="value" value="' + (ev.value || "") + '" type="password" data-env-idx="' + i + '" data-env-field="value">' +
          '<button class="btn-sm" onclick="window.OmniLang.removeEnvVar(' + i + ')">Remove</button>' +
          "</div>";
      });
      html += '</div><button class="btn-sm" onclick="window.OmniLang.addEnvVar()" style="margin-top:4px">+ Add Variable</button></div>';

      // Database connections
      html += '<div class="db-section">' +
        '<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;color:var(--text-secondary);margin-bottom:8px">Database Connections</div>';
      DatabaseServices.forEach(function (db, i) {
        html += '<div class="db-card">' +
          '<div class="db-card-header">' +
          '<span style="font-size:16px">' + db.icon + "</span>" +
          '<div class="db-card-name">' + db.name + "</div>" +
          '<div class="db-card-status" style="margin-left:auto"><span class="status-dot ' + (db.connected ? "connected" : "disconnected") + '"></span>' +
          (db.connected ? "Connected" : "Not connected") + "</div></div>" +
          '<input class="db-input" placeholder="' + db.placeholder + '" type="password">' +
          '<div class="db-actions">' +
          '<button class="btn-sm" onclick="window.OmniLang.testDbConnection(' + i + ')">Test</button>' +
          '<button class="btn-sm primary" onclick="window.OmniLang.connectDb(' + i + ')">Connect</button>' +
          "</div></div>";
      });
      html += "</div>";

      // Build logs
      html += '<div class="deploy-field" style="margin-top:12px"><label>Build Logs</label>' +
        '<div class="build-log" id="buildLog">' +
        (State.buildLogs.length > 0 ? State.buildLogs.join("\n") : "No build logs yet") +
        "</div></div>";

      if (State.deployUrl) {
        html += '<div class="deploy-field"><label>Live URL</label>' +
          '<div class="deploy-url">' + State.deployUrl + "</div></div>";
      }

      panel.innerHTML = html;

      // Wire up buttons
      var connectBtn = document.getElementById("deployConnectBtn");
      if (connectBtn) {
        connectBtn.onclick = function () {
          self.connectService(idx);
        };
      }
      var deployBtn = document.getElementById("deployDeployBtn");
      if (deployBtn) {
        deployBtn.onclick = function () {
          self.deployTo(idx);
        };
      }
    },

    connectService: function (index) {
      var svc = HostingServices[index];
      svc.connected = !svc.connected;
      this.renderDeployServicesList();
      this.renderDeployConfig(index);
      if (svc.connected) {
        this._addConsoleLine("log", "Connected to " + svc.name + " successfully.");
      }
    },

    deployTo: function (index) {
      var svc = HostingServices[index];
      var self = this;
      var projectName = document.getElementById("projectName") ? document.getElementById("projectName").value : "project";

      State.buildLogs = [];
      State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Starting deployment to " + svc.name + "...");
      this.renderDeployConfig(index);
      this._addConsoleLine("log", "Deploying to " + svc.name + "...");

      setTimeout(function () {
        State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Building project...");
        self._updateBuildLog();
      }, 500);
      setTimeout(function () {
        State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Transpiling OmniLang files...");
        self._updateBuildLog();
      }, 1200);
      setTimeout(function () {
        State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Uploading bundle (12.4kb)...");
        self._updateBuildLog();
      }, 2000);
      setTimeout(function () {
        State.deployUrl = "https://" + projectName + "." + svc.name.toLowerCase().replace(/\s/g, "") + ".app";
        State.buildLogs.push("[" + new Date().toLocaleTimeString() + "] Deployment successful!");
        self.renderDeployConfig(index);
        self._addConsoleLine("success", "Deployed to " + State.deployUrl);
        var statusEl = document.getElementById("footerStatus");
        if (statusEl) statusEl.textContent = "Deployed";
      }, 3000);
    },

    _updateBuildLog: function () {
      var logEl = document.getElementById("buildLog");
      if (logEl) logEl.textContent = State.buildLogs.join("\n");
    },

    testDbConnection: function (index) {
      var db = DatabaseServices[index];
      this._addConsoleLine("log", "Testing connection to " + db.name + "...");
      var self = this;
      setTimeout(function () {
        self._addConsoleLine("success", db.name + " connection test successful.");
      }, 1000);
    },

    connectDb: function (index) {
      var db = DatabaseServices[index];
      db.connected = !db.connected;
      if (State.selectedHosting !== null) {
        this.renderDeployConfig(State.selectedHosting);
      }
      this._addConsoleLine("log", (db.connected ? "Connected to " : "Disconnected from ") + db.name);
    },

    addEnvVar: function () {
      State.envVars.push({ key: "", value: "" });
      if (State.selectedHosting !== null) {
        this.renderDeployConfig(State.selectedHosting);
      }
    },

    removeEnvVar: function (idx) {
      State.envVars.splice(idx, 1);
      if (State.selectedHosting !== null) {
        this.renderDeployConfig(State.selectedHosting);
      }
    },

    // ===== SETTINGS =====
    showSettings: function () {
      var modal = document.getElementById("settingsModal");
      if (modal) modal.classList.add("open");
    },

    updateSetting: function (key, value) {
      if (key === "fontSize") {
        State.editorSettings.fontSize = parseInt(value, 10);
        if (State.monacoEditor) {
          State.monacoEditor.updateOptions({ fontSize: State.editorSettings.fontSize });
        }
      } else if (key === "tabSize") {
        State.editorSettings.tabSize = parseInt(value, 10);
        if (State.monacoEditor) {
          State.monacoEditor.updateOptions({ tabSize: State.editorSettings.tabSize });
        }
      }
    },

    toggleSetting: function (key, element) {
      element.classList.toggle("on");
      var isOn = element.classList.contains("on");

      if (key === "minimap") {
        State.editorSettings.minimap = isOn;
        if (State.monacoEditor) {
          State.monacoEditor.updateOptions({ minimap: { enabled: isOn } });
        }
      } else if (key === "wordWrap") {
        State.editorSettings.wordWrap = isOn;
        if (State.monacoEditor) {
          State.monacoEditor.updateOptions({ wordWrap: isOn ? "on" : "off" });
        }
      }
    },

    // ===== NEW PROJECT =====
    toggleNewDropdown: function () {
      var dd = document.getElementById("newDropdown");
      if (dd) dd.classList.toggle("open");

      // Close on outside click
      if (dd && dd.classList.contains("open")) {
        setTimeout(function () {
          function closeDropdown(e) {
            if (!dd.contains(e.target) && !e.target.closest(".new-btn")) {
              dd.classList.remove("open");
              document.removeEventListener("click", closeDropdown);
            }
          }
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
        item.innerHTML =
          '<span class="emoji">' + project.emoji + "</span>" +
          "<div><div>" + project.name + "</div>" +
          '<div class="desc">' + project.description.substring(0, 50) + "</div></div>";
        item.onclick = function () {
          self.loadProject(key);
          dd.classList.remove("open");
        };
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
        card.innerHTML =
          '<div class="project-card-emoji">' + project.emoji + "</div>" +
          "<h4>" + project.name + "</h4>" +
          "<p>" + project.description + "</p>";
        card.onclick = function () {
          self.loadProject(key);
          var modal = document.getElementById("newProjectModal");
          if (modal) modal.classList.remove("open");
        };
        grid.appendChild(card);
      });
    },

    loadProject: function (key) {
      var project = SampleProjects[key];
      if (!project) return;

      FileSystem.init(project.files);
      State.openFiles = Object.keys(project.files).filter(function (f) {
        return !f.endsWith("/");
      });
      State.currentFile = State.openFiles[0] || null;

      var nameInput = document.getElementById("projectName");
      if (nameInput) nameInput.value = key;

      this.renderFileTree();
      this.renderEditorTabs();
      if (State.currentFile) {
        this.loadFileInEditor(State.currentFile);
      }

      State.problems = [];
      this._renderProblems();

      // Clear console and show project info
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
    document.addEventListener("DOMContentLoaded", function () {
      App.init();
    });
  } else {
    App.init();
  }
})();
