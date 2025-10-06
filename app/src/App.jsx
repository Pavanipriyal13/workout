import React, { useState, useEffect } from 'react';

function Heatmap({ data, onCellClick }) {
  const today = new Date();
  const days = 52 * 7;

  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return d;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) weeks.push(dates.slice(i, i + 7));

  const getIntensityClass = (date) => {
    const key = date.toISOString().split('T')[0];
    const w = data[key];
    return w ? `cell-${w.intensity}` : 'cell-empty';
  };

  const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ overflowX: 'auto', padding: '10px 0' }}>
      <div style={{ display: 'inline-flex', gap: 3 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 8, paddingTop: 20 }}>
          {dayNames.map((day, i) => (
            <div key={i} style={{ height: 12, fontSize: 9, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              {i % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {wi % 4 === 0 && (
              <div style={{ height: 12, fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                {week[0].toLocaleDateString('en-US', { month: 'short' })}
              </div>
            )}
            {week.map((date, di) => {
              const key = date.toISOString().split('T')[0];
              const w = data[key];
              return (
                <div
                  key={di}
                  className={`heatmap-cell ${getIntensityClass(date)}`}
                  onClick={() => onCellClick(key)}
                  title={`${formatDate(date)}${w ? `: ${w.intensity} - ${w.note || 'No note'}` : ': No workout'}`}
                  style={{ width: 12, height: 12, borderRadius: 2 }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
        <span>Less</span>
        <div className="heatmap-cell cell-empty" />
        <div className="heatmap-cell cell-light" />
        <div className="heatmap-cell cell-medium" />
        <div className="heatmap-cell cell-heavy" />
        <span>More</span>
      </div>
    </div>
  );
}

function AddWorkoutForm({ initialDate, onAdd }) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [intensity, setIntensity] = useState('medium');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (initialDate) setDate(initialDate);
  }, [initialDate]);

  const handleSubmit = () => {
    onAdd(date, intensity, note);
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Intensity</label>
        <select value={intensity} onChange={(e) => setIntensity(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }}>
          <option value="light">Light</option>
          <option value="medium">Medium</option>
          <option value="heavy">Heavy</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 500 }}>Note (optional)</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., 30 min run, leg day..." style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
      </div>
      <button onClick={handleSubmit} style={{ padding: 10, borderRadius: 6, background: '#22c55e', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>{initialDate ? 'Update Workout' : 'Add Workout'}</button>
    </div>
  );
}

function WorkoutList({ data, onRemove, onEdit }) {
  const entries = Object.entries(data).sort(([a], [b]) => new Date(b) - new Date(a)).slice(0, 10);
  if (entries.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No workouts yet. Start tracking!</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {entries.map(([date, workout]) => (
        <div key={date} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 2 }}>
                <span className={`intensity-badge intensity-${workout.intensity}`}>{workout.intensity}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onEdit(date)} style={{ padding: '4px 8px', fontSize: 12, borderRadius: 4, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => onRemove(date)} style={{ padding: '4px 8px', fontSize: 12, borderRadius: 4, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
          </div>
          {workout.note && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{workout.note}</div>}
        </div>
      ))}
    </div>
  );
}

function Stats({ data }) {
  const entries = Object.entries(data);
  const total = entries.length;
  const byIntensity = entries.reduce((acc, [, v]) => {
    acc[v.intensity] = (acc[v.intensity] || 0) + 1;
    return acc;
  }, {});

  const calculateStreak = () => {
    const sortedDates = Object.keys(data).sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    let cur = new Date();
    cur.setHours(0, 0, 0, 0);
    for (const date of sortedDates) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const diff = Math.floor((cur - d) / (1000 * 60 * 60 * 24));
      if (diff === streak) streak++; else if (diff > streak) break;
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{total}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Total Workouts</div>
      </div>
      <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{streak}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Day Streak</div>
      </div>
      <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#86efac' }}>{byIntensity.light || 0}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Light</div>
      </div>
      <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{byIntensity.medium || 0}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Medium</div>
      </div>
      <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', gridColumn: 'span 2' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#15803d' }}>{byIntensity.heavy || 0}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Heavy</div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('workout_data_v2');
    if (saved) {
      try { setData(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('workout_data_v2', JSON.stringify(data));
  }, [data]);

  const addWorkout = (dateISO, intensity, note) => {
    setData(prev => ({ ...prev, [dateISO]: { intensity, note, ts: Date.now() } }));
    setSelectedDate(null);
  };

  const removeWorkout = (dateISO) => {
    setData(prev => { const copy = { ...prev }; delete copy[dateISO]; return copy; });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { try { setData(JSON.parse(ev.target.result)); } catch { alert('Invalid JSON file'); } };
    reader.readAsText(file);
  };

  return (
    <>
      <style>{`
        :root { --bg:#0d1117; --bg-secondary:#161b22; --text:#e6edf3; --text-muted:#8b949e; --border:#30363d; }
        [data-theme="light"] { --bg:#fff; --bg-secondary:#f6f8fa; --text:#1f2328; --text-muted:#656d76; --border:#d0d7de; }
        body { margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif; background:var(--bg); color:var(--text); transition:background .3s,color .3s; }
        .heatmap-cell { width:12px; height:12px; border-radius:2px; cursor:pointer; transition:all .2s; }
        .heatmap-cell:hover { outline:2px solid var(--text-muted); outline-offset:1px; }
        .cell-empty { background:var(--bg-secondary); border:1px solid var(--border); }
        .cell-light { background:#86efac; }
        .cell-medium { background:#22c55e; }
        .cell-heavy { background:#15803d; }
        .intensity-badge { padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; }
        .intensity-light { background:#86efac; color:#15803d; }
        .intensity-medium { background:#22c55e; color:#fff; }
        .intensity-heavy { background:#15803d; color:#fff; }
        input[type="file"] { display:none; }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', padding: 20 }} data-theme={theme}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <header style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700 }}>💪 Workout Heatmap</h1>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>Track your fitness journey with a GitHub-style contribution graph</p>
            </div>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 20 }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600 }}>Activity</h2>
              <Heatmap data={data} onCellClick={setSelectedDate} />
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600 }}>{selectedDate ? `Edit ${new Date(selectedDate).toLocaleDateString()}` : 'Add Workout'}</h2>
              <AddWorkoutForm initialDate={selectedDate} onAdd={addWorkout} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600 }}>Statistics</h2>
              <Stats data={data} />
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600 }}>Recent Activity</h2>
              <WorkoutList data={data} onRemove={removeWorkout} onEdit={setSelectedDate} />
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: 20, borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={exportData} style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500 }}>📥 Export Data</button>
            <label style={{ padding: '8px 16px', borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500 }}>
              📤 Import Data
              <input type="file" accept=".json" onChange={importData} />
            </label>
            <button onClick={() => { if (confirm('Clear all data?')) setData({}); }} style={{ padding: '8px 16px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>🗑️ Clear All</button>
          </div>
        </div>
      </div>
    </>
  );
}
