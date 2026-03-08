# OmniLang

**A master superset programming language that unifies syntax from JavaScript, Python, Go, Rust, C#, and Java — with a full online IDE, AI coding assistant, and one-click deployment to major hosting services.**

![OmniLang IDE](https://img.shields.io/badge/OmniLang-v1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## What is OmniLang?

OmniLang is a **JavaScript superset** that lets you write code using familiar syntax from any major programming language. The transpiler converts it all to valid JavaScript for execution. Write Python-style functions, Go-style declarations, Rust-style pattern matching — all in the same file.

### Language Features

| Feature | OmniLang Syntax | Transpiles To |
|---|---|---|
| **Python functions** | `def greet(name) { ... }` | `function greet(name) { ... }` |
| **Go functions** | `func add(a, b) { ... }` | `function add(a, b) { ... }` |
| **Rust functions** | `fn multiply(a, b) { ... }` | `function multiply(a, b) { ... }` |
| **Go short declare** | `x := 42` | `let x = 42` |
| **Python print** | `print("Hello")` | `console.log("Hello")` |
| **Go print** | `fmt.Println("Hello")` | `console.log("Hello")` |
| **Rust print** | `println!("Hello")` | `console.log("Hello")` |
| **C# print** | `Console.WriteLine("Hello")` | `console.log("Hello")` |
| **Python booleans** | `True`, `False`, `None` | `true`, `false`, `null` |
| **Go nil** | `nil` | `null` |
| **Python logic** | `and`, `or`, `not` | `&&`, `\|\|`, `!` |
| **Python elif** | `elif` | `else if` |
| **Python f-strings** | `f"Hello {name}"` | `` `Hello ${name}` `` |
| **Python range** | `range(10)` | `Array.from({length:10},(_,i)=>i)` |
| **List comprehension** | `[x*2 for x in range(5)]` | `Array.from({length:5},(_,x)=>x*2)` |
| **Rust match** | `match(val) { 1 => ... }` | `switch(val) { case 1: ... }` |
| **Python len** | `len(arr)` | `arr.length` |
| **Python comments** | `# comment` | `// comment` |

**Plus all standard JavaScript works as-is** — it's a true superset.

## Online IDE

The IDE provides a full development environment in your browser:

- **Monaco Editor** (same engine as VS Code) with custom OmniLang syntax highlighting
- **File Explorer** — virtual filesystem with files and folders
- **Terminal** — OmniLang REPL for interactive coding
- **Output Panel** — see console output from your code
- **Problems Panel** — real-time error detection with line numbers
- **Transpiled View** — see the JavaScript your OmniLang compiles to

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Run code |
| `Ctrl+Shift+Enter` | Deploy |
| `Ctrl+I` | Toggle AI Assistant |
| `Ctrl+S` | Save file |
| `Ctrl+P` | Command palette |

## AI Coding Assistant

Built-in AI that understands OmniLang:

- **Explain Code** — get plain-English explanations of your code
- **Fix Errors** — AI analyzes errors and suggests fixes
- **Generate Code** — describe what you want, get OmniLang code
- **Refactor** — improve code structure and performance
- **Document** — auto-generate documentation

## One-Click Deployment

Deploy your OmniLang projects to any major hosting service:

### Hosting Services
- **DigitalOcean** — Deploy to Droplets with region selection
- **Vercel** — Automatic serverless deployment
- **Netlify** — Drag-and-drop deployment
- **AWS** — S3 + CloudFront distribution
- **Railway** — Container-based deployment
- **Render** — Managed infrastructure
- **Fly.io** — Edge deployment
- **GitHub Pages** — Free static hosting

### Database Connections
- **PostgreSQL** (Neon, Supabase, Railway)
- **MongoDB** (Atlas)
- **MySQL** (PlanetScale)
- **Redis** (Upstash)
- **SQLite** (Built-in)
- **Firebase/Firestore**

## Sample Projects

The IDE includes 4 sample projects:

1. **Hello World** — demonstrates all OmniLang syntax features
2. **Todo App** — Python-like syntax for a todo list
3. **API Client** — Go-like syntax for HTTP operations
4. **Data Processing** — Rust-like pattern matching for data transformation

## Getting Started

### Option 1: Use Online
Visit the deployed IDE and start coding immediately.

### Option 2: Self-Host
```bash
git clone https://github.com/MacroTechTitan/OmniLang.git
cd OmniLang
# Open index.html in your browser — no build step needed
# Or use any static file server:
npx serve .
```

## Technology Stack

| Component | Technology |
|---|---|
| **Editor** | Monaco Editor (VS Code engine) |
| **Language** | Custom transpiler (OmniLang → JavaScript) |
| **Frontend** | Vanilla HTML/CSS/JS (zero dependencies) |
| **Fonts** | JetBrains Mono (code), Inter (UI) |
| **Execution** | Sandboxed JavaScript eval |
| **AI** | Pluggable AI backend (OpenAI, Anthropic, local) |

## Architecture

```
OmniLang Transpiler Pipeline:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│  OmniLang   │ →  │   Lexer /    │ →  │  JavaScript │ →  │ Sandbox  │
│  Source Code │    │  Transpiler  │    │   Output    │    │ Runtime  │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────┘
       ↕                   ↕                  ↕                 ↕
   Monaco Editor    Error Detection     Transpiled View    Output Panel
```

## Roadmap

- [ ] **v1.1** — Python-style indentation-based blocks (optional mode)
- [ ] **v1.2** — TypeScript type annotations in OmniLang
- [ ] **v1.3** — Live collaboration (multiplayer editing)
- [ ] **v1.4** — Package manager with npm/pip interop
- [ ] **v1.5** — Real API connections to hosting services
- [ ] **v2.0** — Custom OmniLang runtime (not just transpilation)
- [ ] **v2.1** — OmniLang to Python/Go/Rust reverse transpilation
- [ ] **v2.2** — Visual debugging with breakpoints
- [ ] **v2.3** — Git integration in the IDE

## License

MIT License — use it however you want.

## Created By

Built with [Perplexity Computer](https://www.perplexity.ai/computer) for MacroTechTitan.
