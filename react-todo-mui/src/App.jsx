import { useEffect, useMemo, useReducer, useState } from "react";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import {
  AppBar, Toolbar, Typography, IconButton, Container, Stack, TextField, Tooltip, Box, Badge
} from "@mui/material";
import { LightMode, DarkMode, Search } from "@mui/icons-material";
import { nanoid } from "nanoid";
import TodoInput from "./components/TodoInput.jsx";
import TodoItem from "./components/TodoItem.jsx";
import Filters from "./components/Filters.jsx";

const STORAGE_KEY = "mui_todo_v1";

const initialState = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ?? { todos: [] };
  } catch { return { todos: [] }; }
})();

function reducer(state, action) {
  switch (action.type) {
    case "ADD": return { todos: [action.payload, ...state.todos] };
    case "TOGGLE": {
      const todos = state.todos.map(t =>
        t.id === action.id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null } : t
      );
      return { todos };
    }
    case "UPDATE": {
      const todos = state.todos.map(t => (t.id === action.payload.id ? { ...t, ...action.payload } : t));
      return { todos };
    }
    case "REMOVE": return { todos: state.todos.filter(t => t.id !== action.id) };
    case "CLEAR_DONE": return { todos: state.todos.filter(t => !t.done) };
    default: return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState({ status: "all", tag: "all", priority: "all", due: "all", sort: "created" });
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  const [dark, setDark] = useState(prefersDark);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  // Theme
  const theme = useMemo(
    () => createTheme({
      palette: { mode: dark ? "dark" : "light" },
      shape: { borderRadius: 12 },
    }),
    [dark]
  );

  const addTodo = (data) => {
    const now = Date.now();
    dispatch({
      type: "ADD",
      payload: {
        id: nanoid(),
        title: data.title.trim(),
        notes: data.notes?.trim() || "",
        priority: data.priority,           // "low" | "normal" | "high"
        due: data.due || null,             // YYYY-MM-DD (string)
        tags: data.tags,                   // string[]
        done: false,
        createdAt: now,
        completedAt: null,
      },
    });
  };

  const visible = useMemo(() => {
    let items = state.todos;

    // text search (title, notes, tags)
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // status
    if (filter.status === "active") items = items.filter(t => !t.done);
    if (filter.status === "done") items = items.filter(t => t.done);

    // tag
    if (filter.tag !== "all") items = items.filter(t => t.tags.includes(filter.tag));

    // priority
    if (filter.priority !== "all") items = items.filter(t => t.priority === filter.priority);

    // due
    const today = new Date().toISOString().slice(0, 10);
    if (filter.due === "overdue") items = items.filter(t => t.due && !t.done && t.due < today);
    if (filter.due === "today") items = items.filter(t => t.due === today);
    if (filter.due === "none") items = items.filter(t => !t.due);

    // sort
    const rank = { high: 2, normal: 1, low: 0 };
    if (filter.sort === "created") items = [...items].sort((a,b)=> b.createdAt - a.createdAt);
    if (filter.sort === "due") {
      items = [...items].sort((a,b) => (a.due ?? "9999-12-31").localeCompare(b.due ?? "9999-12-31") || (b.createdAt - a.createdAt));
    }
    if (filter.sort === "priority") {
      items = [...items].sort((a,b) => rank[b.priority] - rank[a.priority] || (b.createdAt - a.createdAt));
    }
    return items;
  }, [state.todos, query, filter]);

  const allTags = useMemo(() => {
    const set = new Set();
    state.todos.forEach(t => t.tags.forEach(tag => set.add(tag)));
    return ["all", ...Array.from(set)];
  }, [state.todos]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === "k") {
        e.preventDefault();
        document.getElementById("search")?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && key === "n") {
        e.preventDefault();
        document.getElementById("title")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openCount = state.todos.filter(t => !t.done).length;
  const doneCount = state.todos.length - openCount;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" color="default" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 0 }}>Tasks</Typography>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1, maxWidth: 520 }}>
            <TextField
              id="search"
              size="small"
              fullWidth
              placeholder="Search (⌘/Ctrl+K)…"
              InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1 }} /> }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Stack>

          <Tooltip title={dark ? "Light mode" : "Dark mode"}>
            <IconButton onClick={() => setDark(d => !d)} color="inherit">
              {dark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <Badge color="primary" badgeContent={openCount} showZero>
            <Box sx={{ px: 1, color: "text.secondary" }}>Open</Box>
          </Badge>
          <Badge color="success" badgeContent={doneCount} showZero>
            <Box sx={{ px: 1, color: "text.secondary" }}>Done</Box>
          </Badge>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3, maxWidth: 900 }}>
        <Stack spacing={2}>
          <TodoInput onAdd={addTodo} />

          <Filters
            filter={filter}
            setFilter={setFilter}
            tagOptions={allTags}
            clearDone={() => dispatch({ type: "CLEAR_DONE" })}
          />

          <Stack spacing={1}>
            {visible.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4, border: 1, borderColor: "divider", borderRadius: 2 }}>
                No tasks match your filters.
              </Typography>
            )}

            {visible.map(t => (
              <TodoItem
                key={t.id}
                todo={t}
                onToggle={() => dispatch({ type: "TOGGLE", id: t.id })}
                onRemove={() => dispatch({ type: "REMOVE", id: t.id })}
                onUpdate={(patch) => dispatch({ type: "UPDATE", payload: { id: t.id, ...patch } })}
              />
            ))}
          </Stack>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}
