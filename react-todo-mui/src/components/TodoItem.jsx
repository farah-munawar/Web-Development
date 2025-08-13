import { useState } from "react";
import {
  Card, CardContent, Stack, Checkbox, IconButton, TextField, Chip, MenuItem, Tooltip
} from "@mui/material";
import { Delete, Edit, Save, Close } from "@mui/icons-material";

export default function TodoItem({ todo, onToggle, onRemove, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes);
  const [priority, setPriority] = useState(todo.priority);
  const [due, setDue] = useState(todo.due || "");
  const [tags, setTags] = useState(todo.tags.join(", "));

  const save = () => {
    onUpdate({
      title: title.trim() || todo.title,
      notes,
      priority,
      due: due || null,
      tags: tags.split(",").map(s => s.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  const isOverdue = !todo.done && todo.due && todo.due < new Date().toISOString().slice(0,10);

  return (
    <Card variant="outlined" sx={{ opacity: todo.done ? 0.6 : 1 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Checkbox checked={todo.done} onChange={onToggle} />

          {!editing ? (
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <span style={{ fontWeight: 600 }}>{todo.title}</span>
                {todo.priority === "high" && <Chip size="small" color="error" label="High" />}
                {todo.priority === "normal" && <Chip size="small" label="Normal" />}
                {todo.priority === "low" && <Chip size="small" variant="outlined" label="Low" />}
                {todo.due && <Chip size="small" color={isOverdue ? "error" : "default"} label={`Due ${todo.due}`} />}
              </Stack>
              {todo.notes && <div style={{ whiteSpace: "pre-wrap" }}>{todo.notes}</div>}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {todo.tags.map(t => <Chip key={t} size="small" variant="outlined" label={`#${t}`} />)}
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1} sx={{ flex: 1 }}>
              <TextField value={title} onChange={(e)=>setTitle(e.target.value)} label="Title" fullWidth />
              <TextField value={notes} onChange={(e)=>setNotes(e.target.value)} label="Notes" fullWidth multiline minRows={2} />
              <Stack direction="row" spacing={1}>
                <TextField select label="Priority" value={priority} onChange={(e)=>setPriority(e.target.value)} sx={{ minWidth: 140 }}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>
                <TextField label="Due (YYYY-MM-DD)" value={due} onChange={(e)=>setDue(e.target.value)} sx={{ minWidth: 180 }} />
                <TextField label="Tags (comma,separated)" value={tags} onChange={(e)=>setTags(e.target.value)} fullWidth />
              </Stack>
            </Stack>
          )}

          <Stack direction="row" spacing={1}>
            {!editing ? (
              <>
                <Tooltip title="Edit"><IconButton onClick={()=>setEditing(true)}><Edit /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton color="error" onClick={onRemove}><Delete /></IconButton></Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Save"><IconButton color="primary" onClick={save}><Save /></IconButton></Tooltip>
                <Tooltip title="Cancel"><IconButton onClick={()=>setEditing(false)}><Close /></IconButton></Tooltip>
              </>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
