import {
  Card, CardContent, Stack, ToggleButtonGroup, ToggleButton, TextField, MenuItem, Button
} from "@mui/material";

export default function Filters({ filter, setFilter, tagOptions, clearDone }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <ToggleButtonGroup
            size="small"
            value={filter.status}
            exclusive
            onChange={(_, val) => val && setFilter(f => ({ ...f, status: val }))}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="active">Active</ToggleButton>
            <ToggleButton value="done">Done</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            select size="small" label="Tag" value={filter.tag}
            onChange={(e)=>setFilter(f=>({...f, tag: e.target.value}))}
            sx={{ minWidth: 140 }}
          >
            {tagOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          <TextField
            select size="small" label="Priority" value={filter.priority}
            onChange={(e)=>setFilter(f=>({...f, priority: e.target.value}))}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">all</MenuItem>
            <MenuItem value="high">high</MenuItem>
            <MenuItem value="normal">normal</MenuItem>
            <MenuItem value="low">low</MenuItem>
          </TextField>

          <TextField
            select size="small" label="Due" value={filter.due}
            onChange={(e)=>setFilter(f=>({...f, due: e.target.value}))}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">all</MenuItem>
            <MenuItem value="today">today</MenuItem>
            <MenuItem value="overdue">overdue</MenuItem>
            <MenuItem value="none">no due</MenuItem>
          </TextField>

          <TextField
            select size="small" label="Sort" value={filter.sort}
            onChange={(e)=>setFilter(f=>({...f, sort: e.target.value}))}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="created">created</MenuItem>
            <MenuItem value="due">due</MenuItem>
            <MenuItem value="priority">priority</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
            <Button variant="outlined" color="error" onClick={clearDone}>Clear done</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
