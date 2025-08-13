import { useState } from "react";
import {
  Card, CardContent, Stack, TextField, MenuItem, Button
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function TodoInput({ onAdd }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("normal");
  const [due, setDue] = useState(null);     // dayjs or null
  const [tags, setTags] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title,
      notes,
      priority,
      due: due ? dayjs(due).format("YYYY-MM-DD") : null,
      tags: tags.split(",").map(s => s.trim()).filter(Boolean),
    });
    setTitle(""); setNotes(""); setPriority("normal"); setDue(null); setTags("");
  };

  return (
    <Card component="form" onSubmit={submit} variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <TextField
            id="title"
            label="Add a task… (⌘/Ctrl+N)"
            fullWidth value={title} onChange={(e)=>setTitle(e.target.value)}
          />
          <TextField
            label="Notes (optional)" multiline minRows={2}
            fullWidth value={notes} onChange={(e)=>setNotes(e.target.value)}
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select label="Priority" value={priority}
              onChange={(e)=>setPriority(e.target.value)} sx={{ minWidth: 140 }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due date"
                value={due}
                onChange={setDue}
                slotProps={{ textField: { size: "medium" } }}
              />
            </LocalizationProvider>

            <TextField
              label="Tags (comma,separated)"
              value={tags} onChange={(e)=>setTags(e.target.value)} fullWidth
            />
            <Button type="submit" variant="contained">Add</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
