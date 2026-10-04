import { ProjectPlan, StepExecutionData, QuizQuestion } from "@/lib/types";

export const DEMO_PROJECT_PLAN: ProjectPlan = {
  title: "VibeFlow — Dynamic Task & Flow Engine",
  summary: "A sleek, responsive task management application with localStorage persistence, instant filtering, and clean reactive DOM updates.",
  techStackDescription: "Vanilla HTML5, modern Tailwind-inspired CSS3, ES6+ JavaScript with modular state handlers.",
  steps: [
    {
      id: "step-1",
      stepNumber: 1,
      title: "Semantic HTML Structure & Dark UI Shell",
      goal: "Set up the application shell, accessible form inputs, filter buttons, and glowing modern dark typography.",
      estimatedLines: 48,
      status: "completed",
    },
    {
      id: "step-2",
      stepNumber: 2,
      title: "State Model & Reactive DOM Renderer",
      goal: "Implement pure state representation for todos and create a template renderer that reflects state in the DOM.",
      estimatedLines: 52,
      status: "current",
    },
    {
      id: "step-3",
      stepNumber: 3,
      title: "Task Creation & Input Validation",
      goal: "Handle form submission, prevent default reloads, trim input whitespace, and generate unique timestamps.",
      estimatedLines: 40,
      status: "locked",
    },
    {
      id: "step-4",
      stepNumber: 4,
      title: "Event Delegation for Toggle & Delete",
      goal: "Use single listener event delegation on the task list container to toggle completion states and remove tasks cleanly.",
      estimatedLines: 45,
      status: "locked",
    },
    {
      id: "step-5",
      stepNumber: 5,
      title: "LocalStorage Sync & Filter Switcher",
      goal: "Persist array states to browser storage and implement reactive filter views (All, Active, Completed).",
      estimatedLines: 50,
      status: "locked",
    },
  ],
};

export const DEMO_STEP_DATA: Record<string, StepExecutionData> = {
  "step-1": {
    stepId: "step-1",
    files: [
      {
        filename: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeFlow</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="dark-bg">
  <div class="app-card">
    <header class="app-header">
      <div class="logo-badge">⚡ VibeFlow</div>
      <h1>Stay In Flow</h1>
      <p class="subtitle">Capture your thoughts, check off tasks.</p>
    </header>

    <form id="todo-form" class="input-group">
      <input 
        type="text" 
        id="todo-input" 
        placeholder="What are we building today?..." 
        autocomplete="off"
        required
      />
      <button type="submit" id="add-btn">Add Task</button>
    </form>

    <nav class="filters" aria-label="Task filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="completed">Completed</button>
    </nav>

    <ul id="todo-list" class="todo-list" aria-live="polite"></ul>

    <footer class="app-footer">
      <span id="items-left">0 items remaining</span>
    </footer>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        filename: "style.css",
        language: "css",
        content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body.dark-bg {
  background: radial-gradient(circle at top, #1e1b4b 0%, #090d16 100%);
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.app-card {
  width: 100%;
  max-width: 480px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.25);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.logo-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 4px 10px;
  border-radius: 9999px;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

h1 {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 30%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 4px;
}

.input-group {
  display: flex;
  gap: 8px;
  margin-top: 24px;
}

#todo-input {
  flex: 1;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

#todo-input:focus {
  border-color: #6366f1;
}

#add-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: #fff;
  padding: 0 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 8px;
  margin: 18px 0;
}

.filter-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  padding: 6px 12px;
  font-size: 0.825rem;
  border-radius: 6px;
  cursor: pointer;
}

.filter-btn.active {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.3);
}

.todo-list {
  list-style: none;
  min-height: 80px;
}

.app-footer {
  margin-top: 16px;
  font-size: 0.8rem;
  color: #64748b;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-top: 12px;
}`,
      },
      {
        filename: "app.js",
        language: "javascript",
        content: `// Step 1: Foundation placeholder and DOM element selection
console.log("VibeFlow initialized: awaiting DOM setup");

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const itemsLeft = document.getElementById("items-left");

// State will be attached in Step 2
window.appReady = true;`,
      },
    ],
    changes: [
      {
        filename: "index.html",
        description: "Created semantic layout with form, filter controls, list container, and accessibility tags.",
        startLine: 1,
        endLine: 43,
      },
      {
        filename: "style.css",
        description: "Modern dark glassmorphism card theme with radiant indigo accents.",
        startLine: 1,
        endLine: 120,
      },
    ],
    executionNotes: "Sets the visual and semantic framework for all upcoming steps.",
    summary: {
      stepId: "step-1",
      whatWasAdded: "Created the complete semantic HTML scaffold with accessible input elements and designed an ethereal dark-mode interface with CSS glassmorphism.",
      whyItsNeeded: "Accessible semantic structure ensures screen readers and browsers can correctly navigate inputs before attaching reactive JavaScript behaviors.",
      keyConcepts: [
        {
          name: "Semantic HTML Hierarchy",
          definition: "Using descriptive tags like <header>, <nav>, and <form> rather than unstyled <div> elements.",
          oneLineAnalogy: "Like labeled blueprints of a house instead of just calling every single room a 'box'.",
        },
        {
          name: "CSS Glassmorphism",
          definition: "A visual design technique combining translucent backgrounds with backdrop blur filters.",
          oneLineAnalogy: "Like looking at text through a frosted, illuminated glass office partition.",
        },
      ],
      howItConnectsToPreviousStep: "Serves as the foundation template that will be queried and updated by the JavaScript state engine in Step 2.",
    },
    quizQuestions: [
      {
        id: "s1-q1",
        type: "recall",
        question: "Why is the input wrapped in a <form> tag with an id of 'todo-form' instead of just having a standalone <input> and <button>?",
        codeLines: { file: "index.html", startLine: 18, endLine: 27 },
        options: [
          "It automatically captures Enter keypresses as submit events across desktop and mobile devices",
          "It encrypts the text string before it reaches JavaScript",
          "Next.js requires all inputs to be wrapped in HTML5 form tags",
          "It forces the browser to bypass client-side CSS styling",
        ],
        correctIndex: 0,
        explanation: "Wrapping inputs in a <form> ensures native keyboard accessibility (pressing Enter naturally submits the form) without needing manual keydown listeners for keycode 13.",
        concept: "Semantic Form Submissions",
      },
      {
        id: "s1-q2",
        type: "predict-output",
        question: "What visual effect does 'backdrop-filter: blur(16px)' achieve in the .app-card rule?",
        codeLines: { file: "style.css", startLine: 24, endLine: 28 },
        options: [
          "It blurs all text written inside the todo list",
          "It blurs whatever content or background image sits behind the semi-transparent card",
          "It blurs the browser viewport margins",
          "It reduces the brightness of the screen by 16 percent",
        ],
        correctIndex: 1,
        explanation: "Backdrop-filter applies graphical effects (like blur) to the area behind an element, giving a frosted glass appearance through the translucent background.",
        concept: "CSS Backdrop Filters",
      },
      {
        id: "s1-q3",
        type: "spot-the-bug",
        question: "In index.html line 34, what is the purpose of the 'aria-live=\"polite\"' attribute on the <ul> element?",
        codeLines: { file: "index.html", startLine: 34, endLine: 34 },
        options: [
          "It notifies assistive technologies (screen readers) when items are dynamically added to the list without interrupting current speech",
          "It animates new list items with a gentle fade-in curve",
          "It automatically cleans up HTML comments",
          "It enables live websockets synchronization",
        ],
        correctIndex: 0,
        explanation: "aria-live='polite' informs assistive tech that the list content will change dynamically and should be spoken when the user is idle, boosting accessibility.",
        concept: "Accessible Dynamic Regions (ARIA)",
      },
      {
        id: "s1-q4",
        type: "recall",
        question: "In style.css, what does 'box-sizing: border-box' accomplish for all elements?",
        codeLines: { file: "style.css", startLine: 1, endLine: 5 },
        options: [
          "It includes padding and border widths within the element's total declared width and height",
          "It forces all elements into a 3D box perspective",
          "It removes all margins from the document body",
          "It prevents CSS flexbox from wrapping children",
        ],
        correctIndex: 0,
        explanation: "border-box ensures that adding padding or borders does not increase the element's overall width, preventing unexpected layout overflows.",
        concept: "CSS Box Model",
      },
      {
        id: "s1-q5",
        type: "predict-output",
        question: "Why is the script tag `<script src=\"app.js\"></script>` placed at the very bottom of the <body> rather than inside <head>?",
        codeLines: { file: "index.html", startLine: 40, endLine: 42 },
        options: [
          "To guarantee all HTML elements exist in the DOM before app.js runs and attempts to query them",
          "Because browsers forbid JavaScript inside the head tag",
          "To load the stylesheet after the JavaScript executes",
          "To avoid needing a CSS reset file",
        ],
        correctIndex: 0,
        explanation: "Placing scripts at the end of the body ensures the browser parses the entire DOM tree first, preventing getElementById from returning null.",
        concept: "DOM Parsing & Script Execution Order",
      },
    ],
    quizPassed: true,
    quizScore: 5,
    quizAttempts: 1,
  },
  "step-2": {
    stepId: "step-2",
    files: [
      {
        filename: "index.html",
        language: "html",
        content: `<!-- Same as Step 1 -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeFlow</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="dark-bg">
  <div class="app-card">
    <header class="app-header">
      <div class="logo-badge">⚡ VibeFlow</div>
      <h1>Stay In Flow</h1>
      <p class="subtitle">Capture your thoughts, check off tasks.</p>
    </header>

    <form id="todo-form" class="input-group">
      <input type="text" id="todo-input" placeholder="What are we building today?..." autocomplete="off" required />
      <button type="submit" id="add-btn">Add Task</button>
    </form>

    <nav class="filters" aria-label="Task filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="completed">Completed</button>
    </nav>

    <ul id="todo-list" class="todo-list" aria-live="polite"></ul>

    <footer class="app-footer">
      <span id="items-left">0 items remaining</span>
    </footer>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      },
      {
        filename: "style.css",
        language: "css",
        content: `/* Prior CSS plus todo-item styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body.dark-bg {
  background: radial-gradient(circle at top, #1e1b4b 0%, #090d16 100%);
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.app-card {
  width: 100%;
  max-width: 480px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.25);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.logo-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 4px 10px;
  border-radius: 9999px;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

h1 {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 30%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-top: 4px;
}

.input-group {
  display: flex;
  gap: 8px;
  margin-top: 24px;
}

#todo-input {
  flex: 1;
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

#todo-input:focus {
  border-color: #6366f1;
}

#add-btn {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: #fff;
  padding: 0 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 8px;
  margin: 18px 0;
}

.filter-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  padding: 6px 12px;
  font-size: 0.825rem;
  border-radius: 6px;
  cursor: pointer;
}

.filter-btn.active {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.3);
}

.todo-list {
  list-style: none;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 12px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #64748b;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.todo-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
  cursor: pointer;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.empty-state {
  text-align: center;
  color: #64748b;
  padding: 24px 0;
  font-size: 0.9rem;
}

.app-footer {
  margin-top: 16px;
  font-size: 0.8rem;
  color: #64748b;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-top: 12px;
}`,
      },
      {
        filename: "app.js",
        language: "javascript",
        content: `// Step 2: In-memory state and DOM rendering pipeline
let todos = [
  { id: "demo-1", text: "Understand React/Vanilla state principles", completed: true },
  { id: "demo-2", text: "Vibe code with high comprehension", completed: false }
];
let currentFilter = "all";

const listEl = document.getElementById("todo-list");
const itemsLeftEl = document.getElementById("items-left");

// Pure rendering function: takes state and writes clean HTML
function renderTodos() {
  const filtered = todos.filter(todo => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<li class="empty-state">No tasks here yet. Enjoy your flow!</li>';
  } else {
    listEl.innerHTML = filtered.map(todo => \`
      <li class="todo-item \${todo.completed ? 'completed' : ''}" data-id="\${todo.id}">
        <div class="todo-content">
          <input 
            type="checkbox" 
            class="todo-checkbox" 
            \${todo.completed ? 'checked' : ''} 
            aria-label="Toggle task"
          />
          <span class="todo-text">\${escapeHtml(todo.text)}</span>
        </div>
        <button class="delete-btn" aria-label="Delete task">&times;</button>
      </li>
    \`).join("");
  }

  const activeCount = todos.filter(t => !t.completed).length;
  itemsLeftEl.textContent = \`\${activeCount} item\${activeCount === 1 ? '' : 's'} remaining\`;
}

// XSS Sanitizer for user inputted text
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Initial render call
renderTodos();`,
      },
    ],
    changes: [
      {
        filename: "app.js",
        description: "Implemented single source of truth state array, renderTodos function, and XSS sanitization.",
        startLine: 1,
        endLine: 49,
      },
      {
        filename: "style.css",
        description: "Added styling for todo items, completed strikethrough, and empty states.",
        startLine: 120,
        endLine: 180,
      },
    ],
    executionNotes: "Binds state to the UI using a unidirectional data flow render pattern.",
    summary: {
      stepId: "step-2",
      whatWasAdded: "Introduced an in-memory `todos` state array and an idempotent `renderTodos()` function that maps state directly into HTML markup.",
      whyItsNeeded: "Separating state from the DOM avoids messy imperative mutations and ensures the UI always mirrors the exact application state.",
      keyConcepts: [
        {
          name: "Single Source of Truth",
          definition: "Maintaining the state in one clean data structure, rendering the DOM from it rather than reading values out of DOM nodes.",
          oneLineAnalogy: "Like keeping the original master manuscript in a safe, and only printing reader copies from it.",
        },
        {
          name: "Idempotent Rendering",
          definition: "A function that produces the identical UI output when provided with the same state input, without unwanted side effects.",
          oneLineAnalogy: "Like a projector: shining light through the slide always creates the exact same image on the wall.",
        },
      ],
      howItConnectsToPreviousStep: "Injects dynamic task list items into the `#todo-list` <ul> container established in Step 1.",
    },
    quizQuestions: [
      {
        id: "s2-q1",
        type: "predict-output",
        question: "In app.js, what does `renderTodos()` do when `filtered.length === 0`?",
        codeLines: { file: "app.js", startLine: 18, endLine: 20 },
        options: [
          "It injects an <li class='empty-state'> message informing the user that no tasks exist",
          "It throws a ReferenceError in the browser console",
          "It deletes the entire <ul> element from the page",
          "It creates an empty prompt alert dialog",
        ],
        correctIndex: 0,
        explanation: "Lines 18-20 check if the filtered list is empty, rendering a friendly empty state message to guide the user.",
        concept: "Declarative UI Empty States",
      },
      {
        id: "s2-q2",
        type: "spot-the-bug",
        question: "Why is `escapeHtml(todo.text)` used instead of directly interpolating `${todo.text}` into the innerHTML template?",
        codeLines: { file: "app.js", startLine: 29, endLine: 44 },
        options: [
          "To prevent Cross-Site Scripting (XSS) attacks if a user enters malicious HTML or <script> tags",
          "Because innerHTML cannot render strings with spaces",
          "To translate English text into local system language",
          "To automatically truncate tasks longer than 50 characters",
        ],
        correctIndex: 0,
        explanation: "Directly interpolating user input into innerHTML opens vulnerabilities to script injection. Setting textContent on a temporary div encodes HTML entities safely.",
        concept: "Web Security & XSS Prevention",
      },
      {
        id: "s2-q3",
        type: "predict-output",
        question: "If `todos` has 3 tasks where 1 is completed and 2 are active, what text will `itemsLeftEl.textContent` display?",
        codeLines: { file: "app.js", startLine: 35, endLine: 37 },
        options: [
          "'2 items remaining'",
          "'3 items remaining'",
          "'1 item remaining'",
          "'0 items remaining'",
        ],
        correctIndex: 0,
        explanation: "Lines 35-37 filter for !t.completed, finding 2 active tasks, and pluralizes 'items remaining' accordingly.",
        concept: "State Aggregation & Pluralization",
      },
      {
        id: "s2-q4",
        type: "recall",
        question: "What is the primary benefit of storing tasks in a JavaScript array rather than modifying HTML nodes directly?",
        codeLines: { file: "app.js", startLine: 2, endLine: 6 },
        options: [
          "State can be easily filtered, serialized to JSON, sorted, and saved to localStorage without DOM scraping",
          "JavaScript arrays run faster in CSS transitions",
          "HTML nodes consume more network bandwidth",
          "Arrays prevent users from opening the browser dev tools",
        ],
        correctIndex: 0,
        explanation: "Maintaining state as pure data gives you a single source of truth, making persistence, filtering, and debugging clean and predictable.",
        concept: "State vs DOM Separation",
      },
      {
        id: "s2-q5",
        type: "predict-output",
        question: "What does the `.map(...).join(\"\")` pattern on line 21-32 accomplish?",
        codeLines: { file: "app.js", startLine: 21, endLine: 33 },
        options: [
          "It transforms an array of todo objects into an array of HTML strings, then concatenates them into one combined string for innerHTML",
          "It splits a string into an array of words",
          "It removes duplicates from the list of todos",
          "It binds click listeners to every rendered list item",
        ],
        correctIndex: 0,
        explanation: "Array.prototype.map generates an HTML string for each item; .join('') combines them without comma separators so they can be assigned to innerHTML.",
        concept: "Functional Array Transformations",
      },
    ],
  },
  "step-3": {
    stepId: "step-3",
    files: [
      {
        filename: "index.html",
        language: "html",
        content: `<!-- Same as Step 2 -->`,
      },
      {
        filename: "style.css",
        language: "css",
        content: `/* Same as Step 2 */`,
      },
      {
        filename: "app.js",
        language: "javascript",
        content: `// Step 3: Form submission handling and task validation
let todos = [
  { id: "demo-1", text: "Understand React/Vanilla state principles", completed: true },
  { id: "demo-2", text: "Vibe code with high comprehension", completed: false }
];
let currentFilter = "all";

const formEl = document.getElementById("todo-form");
const inputEl = document.getElementById("todo-input");
const listEl = document.getElementById("todo-list");
const itemsLeftEl = document.getElementById("items-left");

// Form submit event listener
formEl.addEventListener("submit", function(event) {
  event.preventDefault(); // Stop default browser page reload
  
  const text = inputEl.value.trim();
  if (!text) return; // Guard against empty or whitespace-only tasks

  const newTodo = {
    id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    text: text,
    completed: false
  };

  todos.unshift(newTodo); // Add to top of list
  inputEl.value = "";     // Reset input field
  inputEl.focus();        // Keep keyboard focus for fast entry

  renderTodos();
});

function renderTodos() {
  const filtered = todos.filter(todo => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<li class="empty-state">No tasks here yet. Enjoy your flow!</li>';
  } else {
    listEl.innerHTML = filtered.map(todo => \`
      <li class="todo-item \${todo.completed ? 'completed' : ''}" data-id="\${todo.id}">
        <div class="todo-content">
          <input type="checkbox" class="todo-checkbox" \${todo.completed ? 'checked' : ''} aria-label="Toggle task" />
          <span class="todo-text">\${escapeHtml(todo.text)}</span>
        </div>
        <button class="delete-btn" aria-label="Delete task">&times;</button>
      </li>
    \`).join("");
  }

  const activeCount = todos.filter(t => !t.completed).length;
  itemsLeftEl.textContent = \`\${activeCount} item\${activeCount === 1 ? '' : 's'} remaining\`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

renderTodos();`,
      },
    ],
    changes: [
      {
        filename: "app.js",
        description: "Added form submit listener with event.preventDefault(), trim validation, unique ID generation, and array unshift.",
        startLine: 12,
        endLine: 30,
      },
    ],
    executionNotes: "Enables interactive task creation and instant reactivity.",
    summary: {
      stepId: "step-3",
      whatWasAdded: "Attached a submit event listener to the form, prevented default browser navigation, sanitized input strings with `.trim()`, and pushed new items to state.",
      whyItsNeeded: "Browsers default to reloading the page on form submission. Intercepting the submit event allows single-page dynamic interaction.",
      keyConcepts: [
        {
          name: "event.preventDefault()",
          definition: "Cancels the default action belonging to the event (such as submitting an HTTP POST request and reloading the page).",
          oneLineAnalogy: "Like catching a bowling ball before it drops and quietly redirecting it down the lane.",
        },
        {
          name: "Guarded Input Validation",
          definition: "Sanitizing strings and checking `.trim()` before allowing state mutations.",
          oneLineAnalogy: "Like a bouncer checking tickets at the door so empty envelopes don't get in.",
        },
      ],
      howItConnectsToPreviousStep: "Updates the `todos` array from Step 2 and immediately calls `renderTodos()` to display the new item.",
    },
    quizQuestions: [
      {
        id: "s3-q1",
        type: "predict-output",
        question: "What would happen if `event.preventDefault()` were omitted from line 14 of app.js?",
        codeLines: { file: "app.js", startLine: 13, endLine: 15 },
        options: [
          "The browser would immediately perform a full page reload, erasing in-memory todos",
          "The text input would refuse to accept any characters",
          "The browser would open a new tab",
          "The CSS background gradient would turn white",
        ],
        correctIndex: 0,
        explanation: "By default, HTML forms execute an HTTP GET or POST request causing a browser reload. preventDefault keeps execution inside JavaScript.",
        concept: "Event Default Prevention",
      },
      {
        id: "s3-q2",
        type: "spot-the-bug",
        question: "Why is `inputEl.value.trim()` used instead of just `inputEl.value` on line 16?",
        codeLines: { file: "app.js", startLine: 16, endLine: 17 },
        options: [
          "It strips accidental leading and trailing whitespace, preventing users from creating blank tasks consisting only of spaces",
          "It truncates the input string to 10 characters",
          "It turns uppercase letters into lowercase letters",
          "It removes all punctuation symbols",
        ],
        correctIndex: 0,
        explanation: "trim() removes whitespace characters from both ends of a string. If the user presses spacebar several times, trim() yields an empty string which is caught by the guard.",
        concept: "String Trimming & Sanitation",
      },
      {
        id: "s3-q3",
        type: "recall",
        question: "Why does the code use `todos.unshift(newTodo)` instead of `todos.push(newTodo)` on line 24?",
        codeLines: { file: "app.js", startLine: 24, endLine: 26 },
        options: [
          "unshift inserts the newest task at the beginning of the array so it appears at the top of the UI",
          "unshift makes the array immutable",
          "push does not accept objects with id fields",
          "push requires an async callback",
        ],
        correctIndex: 0,
        explanation: "Array.prototype.unshift adds elements to the start (index 0) of an array, whereas push appends to the end.",
        concept: "Array Mutation: unshift vs push",
      },
      {
        id: "s3-q4",
        type: "predict-output",
        question: "How does `'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)` generate an ID?",
        codeLines: { file: "app.js", startLine: 19, endLine: 23 },
        options: [
          "It combines the current millisecond timestamp with a short random alphanumeric string to guarantee uniqueness",
          "It queries the backend server database for an auto-incrementing ID",
          "It hashes the user's IP address",
          "It calculates the length of the string input",
        ],
        correctIndex: 0,
        explanation: "Combining a timestamp with pseudo-random characters is a lightweight client-side technique to produce collision-resistant IDs without server roundtrips.",
        concept: "Unique Identifier Generation",
      },
      {
        id: "s3-q5",
        type: "recall",
        question: "Why is `inputEl.focus()` called immediately after adding a task on line 26?",
        codeLines: { file: "app.js", startLine: 25, endLine: 27 },
        options: [
          "It restores cursor focus to the input box so the user can type multiple tasks without clicking the mouse again",
          "It forces the mobile keyboard to close",
          "It validates the form with regex",
          "It highlights the text in bold font",
        ],
        correctIndex: 0,
        explanation: "focus() improves user velocity and accessibility by keeping the cursor inside the input field ready for rapid subsequent task entry.",
        concept: "DOM Focus Management & UX",
      },
    ],
  },
  "step-4": {
    stepId: "step-4",
    files: [
      {
        filename: "index.html",
        language: "html",
        content: `<!-- Same as Step 1 -->`,
      },
      {
        filename: "style.css",
        language: "css",
        content: `/* Same as Step 2 */`,
      },
      {
        filename: "app.js",
        language: "javascript",
        content: `// Step 4: Event delegation for toggling completion and deleting tasks
let todos = [
  { id: "demo-1", text: "Understand React/Vanilla state principles", completed: true },
  { id: "demo-2", text: "Vibe code with high comprehension", completed: false }
];
let currentFilter = "all";

const formEl = document.getElementById("todo-form");
const inputEl = document.getElementById("todo-input");
const listEl = document.getElementById("todo-list");
const itemsLeftEl = document.getElementById("items-left");

// Form submit
formEl.addEventListener("submit", function(event) {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  todos.unshift({
    id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    text: text,
    completed: false
  });

  inputEl.value = "";
  inputEl.focus();
  renderTodos();
});

// Event Delegation on parent <ul>: handles clicks on both checkbox and delete button
listEl.addEventListener("click", function(event) {
  const target = event.target;
  const itemEl = target.closest(".todo-item");
  if (!itemEl) return;

  const id = itemEl.dataset.id;

  // Toggle completion
  if (target.classList.contains("todo-checkbox")) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = target.checked;
      renderTodos();
    }
  }

  // Delete task
  if (target.classList.contains("delete-btn")) {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
  }
});

function renderTodos() {
  const filtered = todos.filter(todo => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<li class="empty-state">No tasks here yet. Enjoy your flow!</li>';
  } else {
    listEl.innerHTML = filtered.map(todo => \`
      <li class="todo-item \${todo.completed ? 'completed' : ''}" data-id="\${todo.id}">
        <div class="todo-content">
          <input type="checkbox" class="todo-checkbox" \${todo.completed ? 'checked' : ''} aria-label="Toggle task" />
          <span class="todo-text">\${escapeHtml(todo.text)}</span>
        </div>
        <button class="delete-btn" aria-label="Delete task">&times;</button>
      </li>
    \`).join("");
  }

  const activeCount = todos.filter(t => !t.completed).length;
  itemsLeftEl.textContent = \`\${activeCount} item\${activeCount === 1 ? '' : 's'} remaining\`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

renderTodos();`,
      },
    ],
    changes: [
      {
        filename: "app.js",
        description: "Implemented event delegation on listEl using event.target and closest() to toggle completion and delete tasks.",
        startLine: 30,
        endLine: 53,
      },
    ],
    executionNotes: "Prevents memory leaks by attaching one listener to the list instead of individual listeners per item.",
    summary: {
      stepId: "step-4",
      whatWasAdded: "Added a single click listener to the `<ul>` element utilizing event bubbling and `element.closest('.todo-item')` to manage toggle and delete operations.",
      whyItsNeeded: "Binding separate event listeners to every list item causes memory bloat and breaks when elements are re-rendered. Event delegation is robust and scalable.",
      keyConcepts: [
        {
          name: "Event Delegation & Bubbling",
          definition: "Exploiting browser event propagation where child events bubble up to the parent container.",
          oneLineAnalogy: "Like putting a security checkpoint at the building entrance instead of placing guards at every single office door.",
        },
        {
          name: "element.closest()",
          definition: "Traverses the element and its parents (heading toward the document root) until finding a node that matches the provided CSS selector.",
          oneLineAnalogy: "Like looking up a family tree to find the nearest ancestor with a specific surname.",
        },
      ],
      howItConnectsToPreviousStep: "Interacts directly with the `data-id` attributes and checkbox classes rendered inside each `<li>` from Steps 2 and 3.",
    },
    quizQuestions: [
      {
        id: "s4-q1",
        type: "recall",
        question: "Why is Event Delegation preferred over attaching `.addEventListener('click')` inside `renderTodos()` for each button?",
        codeLines: { file: "app.js", startLine: 30, endLine: 35 },
        options: [
          "It avoids memory leaks and ensures newly created items automatically have functioning click behavior without re-binding",
          "Event delegation enables GPU hardware acceleration",
          "Browsers restrict documents to a maximum of 3 event listeners",
          "It encrypts event targets against inspect element tampering",
        ],
        correctIndex: 0,
        explanation: "Because elements are re-created on each render, re-attaching listeners leads to zombie listeners and memory leaks. One parent listener handles all current and future children seamlessly.",
        concept: "Event Delegation Architecture",
      },
      {
        id: "s4-q2",
        type: "predict-output",
        question: "What does `target.closest('.todo-item')` return if the user clicks directly on the delete button '&times;'?",
        codeLines: { file: "app.js", startLine: 31, endLine: 35 },
        options: [
          "The parent `<li class='todo-item'>` element wrapping that specific button",
          "The root <html> element",
          "The <body> tag",
          "null",
        ],
        correctIndex: 0,
        explanation: "closest() searches up the DOM tree starting from the target element, matching the closest ancestor element that has the class .todo-item.",
        concept: "DOM Traversal with Element.closest()",
      },
      {
        id: "s4-q3",
        type: "predict-output",
        question: "How does `todos = todos.filter(t => t.id !== id)` remove a task in line 48?",
        codeLines: { file: "app.js", startLine: 47, endLine: 51 },
        options: [
          "It constructs a new array containing every task EXCEPT the one whose id matches the deleted item",
          "It mutates the existing array in place by setting the item to null",
          "It deletes the id property from the object",
          "It clears the whole array",
        ],
        correctIndex: 0,
        explanation: "Array.filter creates a shallow copy of a portion of the array, filtered down to just the elements that pass the test (t.id !== id).",
        concept: "Immutable Array Filtering",
      },
      {
        id: "s4-q4",
        type: "spot-the-bug",
        question: "How does JavaScript retrieve the ID string stored in the HTML attribute `data-id=\"...\"`?",
        codeLines: { file: "app.js", startLine: 35, endLine: 37 },
        options: [
          "Via the `itemEl.dataset.id` property",
          "Via `itemEl.id`",
          "Via `itemEl.dataId`",
          "Via `window.data[itemEl]`",
        ],
        correctIndex: 0,
        explanation: "HTML5 data-* attributes are automatically converted into camelCase keys on the HTMLElement's dataset DOMStringMap property.",
        concept: "HTML5 Dataset API",
      },
      {
        id: "s4-q5",
        type: "recall",
        question: "In line 41, why do we call `renderTodos()` after toggling `todo.completed`?",
        codeLines: { file: "app.js", startLine: 38, endLine: 44 },
        options: [
          "To trigger a re-render so the DOM class 'completed' and strikethrough styles immediately synchronize with state",
          "Because JavaScript variables do not persist unless rendered",
          "To refresh the browser cache",
          "To trigger a CSS keyframe vibration",
        ],
        correctIndex: 0,
        explanation: "Calling renderTodos() ensures unidirectional flow: modify data first, then update presentation.",
        concept: "Unidirectional UI Synchronization",
      },
    ],
  },
  "step-5": {
    stepId: "step-5",
    files: [
      {
        filename: "index.html",
        language: "html",
        content: `<!-- Same as Step 1 -->`,
      },
      {
        filename: "style.css",
        language: "css",
        content: `/* Same as Step 2 */`,
      },
      {
        filename: "app.js",
        language: "javascript",
        content: `// Step 5: LocalStorage Persistence & Interactive Filter Tabs
const STORAGE_KEY = "vibeflow_tasks_v1";

// Load from LocalStorage or fallback to seed data
let todos = loadTodos();
let currentFilter = "all";

const formEl = document.getElementById("todo-form");
const inputEl = document.getElementById("todo-input");
const listEl = document.getElementById("todo-list");
const itemsLeftEl = document.getElementById("items-left");
const filterBtns = document.querySelectorAll(".filter-btn");

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [
      { id: "demo-1", text: "Understand React/Vanilla state principles", completed: true },
      { id: "demo-2", text: "Vibe code with high comprehension", completed: false }
    ];
  } catch (e) {
    console.warn("Storage access failed, using fallback:", e);
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// Form submit
formEl.addEventListener("submit", function(event) {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  todos.unshift({
    id: "task-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    text: text,
    completed: false
  });

  inputEl.value = "";
  inputEl.focus();
  saveTodos();
  renderTodos();
});

// Event Delegation for toggles and deletes
listEl.addEventListener("click", function(event) {
  const target = event.target;
  const itemEl = target.closest(".todo-item");
  if (!itemEl) return;

  const id = itemEl.dataset.id;

  if (target.classList.contains("todo-checkbox")) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = target.checked;
      saveTodos();
      renderTodos();
    }
  }

  if (target.classList.contains("delete-btn")) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
  }
});

// Filter button click handlers
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

function renderTodos() {
  const filtered = todos.filter(todo => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<li class="empty-state">No tasks in this view. Enjoy your flow!</li>';
  } else {
    listEl.innerHTML = filtered.map(todo => \`
      <li class="todo-item \${todo.completed ? 'completed' : ''}" data-id="\${todo.id}">
        <div class="todo-content">
          <input type="checkbox" class="todo-checkbox" \${todo.completed ? 'checked' : ''} aria-label="Toggle task" />
          <span class="todo-text">\${escapeHtml(todo.text)}</span>
        </div>
        <button class="delete-btn" aria-label="Delete task">&times;</button>
      </li>
    \`).join("");
  }

  const activeCount = todos.filter(t => !t.completed).length;
  itemsLeftEl.textContent = \`\${activeCount} item\${activeCount === 1 ? '' : 's'} remaining\`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

renderTodos();`,
      },
    ],
    changes: [
      {
        filename: "app.js",
        description: "Added loadTodos and saveTodos with JSON serialization to localStorage and filter tab listeners.",
        startLine: 1,
        endLine: 35,
      },
    ],
    executionNotes: "Completes the application lifecycle with local storage persistence and view filtering.",
    summary: {
      stepId: "step-5",
      whatWasAdded: "Wired `localStorage.getItem` and `setItem` with `JSON.parse`/`stringify` and error handling, plus attached view filter switching to the category buttons.",
      whyItsNeeded: "Browser reloads wipe in-memory variables. LocalStorage ensures users retain their task items across browser sessions.",
      keyConcepts: [
        {
          name: "JSON Serialization & LocalStorage",
          definition: "Converting JavaScript objects into string representations via JSON.stringify() to store in key-value browser storage.",
          oneLineAnalogy: "Like freeze-drying a meal into a compact packet so you can store it on a shelf, then rehydrating it when hungry.",
        },
        {
          name: "Active Tab State Switching",
          definition: "Toggling active CSS modifier classes across tab elements and re-filtering the underlying presentation.",
          oneLineAnalogy: "Like switching lenses on a camera to inspect the same landscape under different filters.",
        },
      ],
      howItConnectsToPreviousStep: "Wraps all state-mutating actions (create, toggle, delete) from Steps 3 and 4 with automatic `saveTodos()` calls.",
    },
    quizQuestions: [
      {
        id: "s5-q1",
        type: "recall",
        question: "Why does `localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))` require `JSON.stringify`?",
        codeLines: { file: "app.js", startLine: 27, endLine: 33 },
        options: [
          "LocalStorage can only store strings; objects passed directly convert to the useless string '[object Object]'",
          "JSON.stringify encrypts the data using AES-256",
          "To speed up browser rendering",
          "Because browsers refuse to store arrays larger than 3 items",
        ],
        correctIndex: 0,
        explanation: "The Web Storage API only supports string values for keys and values. Complex objects or arrays must be serialized with JSON.stringify before storage.",
        concept: "Web Storage Serialization",
      },
      {
        id: "s5-q2",
        type: "spot-the-bug",
        question: "Why are `localStorage.getItem()` and `JSON.parse()` wrapped inside a `try...catch` block in `loadTodos()`?",
        codeLines: { file: "app.js", startLine: 15, endLine: 26 },
        options: [
          "To prevent the entire app from crashing if storage access is blocked (e.g., incognito privacy settings) or corrupted JSON is encountered",
          "Because Next.js throws an error if try/catch is absent",
          "To make the JSON parsing run asynchronously",
          "To avoid writing an if statement",
        ],
        correctIndex: 0,
        explanation: "LocalStorage can throw DOMExceptions in private browsing modes or when cookies are disabled, and JSON.parse throws a SyntaxError on malformed strings.",
        concept: "Resilient Storage Handling & Error Boundaries",
      },
      {
        id: "s5-q3",
        type: "predict-output",
        question: "When a user clicks the 'Completed' filter button, what does `renderTodos()` display?",
        codeLines: { file: "app.js", startLine: 80, endLine: 95 },
        options: [
          "Only tasks where `todo.completed === true`",
          "All tasks with completed tasks moved to the bottom",
          "An empty list with an alert",
          "Only tasks created in the last 24 hours",
        ],
        correctIndex: 0,
        explanation: "Lines 80-84 check currentFilter: if 'completed', it returns todo.completed, filtering out all active tasks.",
        concept: "Declarative View Filtering",
      },
      {
        id: "s5-q4",
        type: "recall",
        question: "Where in the browser does `localStorage` store its data, and when does it expire?",
        codeLines: { file: "app.js", startLine: 1, endLine: 10 },
        options: [
          "Locally per origin on the client's device with no expiration date until explicitly cleared",
          "In the cloud on a temporary 24-hour cookie session",
          "In RAM memory that clears when the tab closes",
          "On the DNS provider server",
        ],
        correctIndex: 0,
        explanation: "LocalStorage stores data persistently in the client browser with no expiration date, scoped strictly to the current origin (protocol, domain, port).",
        concept: "Client Storage Lifecycles",
      },
      {
        id: "s5-q5",
        type: "predict-output",
        question: "In `filterBtns.forEach`, why is `filterBtns.forEach(b => b.classList.remove('active'))` executed before `btn.classList.add('active')`?",
        codeLines: { file: "app.js", startLine: 68, endLine: 76 },
        options: [
          "To deselect all buttons first so that only the newly clicked button displays the active visual highlight",
          "To trigger a CSS animation reset",
          "To delete the event listeners from inactive buttons",
          "To clear the input field",
        ],
        correctIndex: 0,
        explanation: "Iterating through the sibling buttons to remove 'active' ensures mutual exclusivity: only one filter button is highlighted at any given moment.",
        concept: "Mutual Exclusivity UI Patterns",
      },
    ],
  },
};
