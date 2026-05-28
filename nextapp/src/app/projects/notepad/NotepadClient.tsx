'use client';

import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/PageHeader/PageHeader';
import BackButton from '@/components/BackButton/BackButton';
import styles from './notepad.module.css';

interface Note {
  id: number;
  title: string;
  body: string;
  color: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

const COLORS = ['cyan', 'emerald', 'violet', 'rose', 'amber', 'blue', 'pink', 'slate'];

export default function NotepadClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Compose State
  const [currentColor, setCurrentColor] = useState('cyan');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);

  // Filter/Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'az'>('newest');

  // Modals
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, msg: string, onResolve: ((val: boolean) => void) | null }>({ show: false, msg: '', onResolve: null });

  const STORAGE_KEY = 'arpit-notes-v3';

  useEffect(() => {
    setIsClient(true);
    let loaded = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Migrate colors
    const OLD_TO_NEW: any = {
      peach:'rose', ocean:'cyan', mint:'emerald', sand:'amber',
      lavender:'violet', sage:'emerald', fuchsia:'pink', stone:'slate',
      coral:'rose', sky:'cyan', indigo:'violet', teal:'emerald',
      orange:'amber', green:'emerald', yellow:'amber', purple:'violet',
      blue:'blue', pink:'pink'
    };
    loaded.forEach((n: any) => { if (OLD_TO_NEW[n.color]) n.color = OLD_TO_NEW[n.color]; });

    // Try migrating v2 if v3 is empty
    const oldV2 = localStorage.getItem('arpit-notes-v2');
    if (oldV2 && loaded.length === 0) {
      const oldNotes = JSON.parse(oldV2) || [];
      oldNotes.forEach((n: any) => { if (OLD_TO_NEW[n.color]) n.color = OLD_TO_NEW[n.color]; });
      loaded = oldNotes;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
    }
    
    setNotes(loaded);
  }, []);

  const saveToLocal = (newNotes: Note[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setShowToast(false), 2000);
  };

  const saveNote = () => {
    const t = title.trim();
    const b = body.trim();
    if (!b) { triggerToast('⚠️ Write something first!'); return; }

    const now = Date.now();
    let updatedNotes = [...notes];

    if (editingId !== null) {
      const idx = updatedNotes.findIndex(n => n.id === editingId);
      if (idx > -1) {
        updatedNotes[idx] = { ...updatedNotes[idx], title: t, body: b, color: currentColor, pinned, updatedAt: now };
      }
      setEditingId(null);
      triggerToast('✏️ Updated!');
    } else {
      updatedNotes.unshift({ id: now, title: t, body: b, color: currentColor, pinned, createdAt: now, updatedAt: now });
      triggerToast('📝 Saved!');
    }

    saveToLocal(updatedNotes);
    setTitle('');
    setBody('');
    setPinned(false);
  };

  const editNote = (id: number) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    setEditingId(id);
    setTitle(note.title);
    setBody(note.body);
    setPinned(!!note.pinned);
    setCurrentColor(COLORS.includes(note.color) ? note.color : 'cyan');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setBody('');
    setPinned(false);
  };

  const deleteNote = (id: number) => {
    setConfirmModal({
      show: true,
      msg: 'Delete this note?',
      onResolve: (ok) => {
        setConfirmModal({ show: false, msg: '', onResolve: null });
        if (ok) {
          saveToLocal(notes.filter(n => n.id !== id));
          triggerToast('🗑️ Deleted');
        }
      }
    });
  };

  const clearAllNotes = () => {
    if (!notes.length) { triggerToast('No notes to clear'); return; }
    setConfirmModal({
      show: true,
      msg: `Delete all ${notes.length} note${notes.length !== 1 ? 's' : ''}?`,
      onResolve: (ok) => {
        setConfirmModal({ show: false, msg: '', onResolve: null });
        if (ok) {
          saveToLocal([]);
          triggerToast('🗑️ All cleared');
        }
      }
    });
  };

  const togglePin = (id: number) => {
    const newNotes = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n);
    const toggled = newNotes.find(n => n.id === id);
    saveToLocal(newNotes);
    if (toggled) triggerToast(toggled.pinned ? '📌 Pinned!' : 'Unpinned');
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        saveNote();
      }
      if (e.key === 'Escape' && editingId !== null) {
        cancelEdit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [title, body, currentColor, pinned, editingId, notes]);

  const timeAgo = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'Just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24); if (d < 7) return `${d}d`;
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Rendering logic
  const filtered = notes.filter(n => {
    const cOk = colorFilter === 'all' || n.color === colorFilter;
    const qOk = !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.body.toLowerCase().includes(searchQuery.toLowerCase());
    return cOk && qOk;
  });

  const sorter = sortMode === 'newest' ? (a: Note, b: Note) => (b.updatedAt || 0) - (a.updatedAt || 0)
    : sortMode === 'oldest' ? (a: Note, b: Note) => (a.updatedAt || 0) - (b.updatedAt || 0)
    : (a: Note, b: Note) => (a.title || '').localeCompare(b.title || '');

  const pinnedNotes = filtered.filter(n => n.pinned).sort(sorter);
  const unpinnedNotes = filtered.filter(n => !n.pinned).sort(sorter);
  const displayNotes = [...pinnedNotes, ...unpinnedNotes];

  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  
  const lastTs = notes.length > 0 ? Math.max(...notes.map(n => n.updatedAt || n.createdAt || 0)) : 0;
  const lastEdited = lastTs > 0 ? new Date(lastTs).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never';

  if (!isClient) return <div className="min-h-screen bg-slate-900"></div>;

  return (
    <div className={`${styles.notepadWrapper} ${styles[`theme${currentColor.charAt(0).toUpperCase() + currentColor.slice(1)}`]} bg-slate-900 text-slate-100`}>
      <BackButton />

      {/* TOAST */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 px-4 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="px-4 py-2.5 rounded-xl text-sm font-semibold border shadow-xl max-w-[90vw] text-center bg-slate-800 text-slate-100 border-slate-700">
          {toastMsg}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
          <div className="rounded-3xl shadow-2xl p-6 w-full max-w-xs border bg-slate-900 border-slate-700">
            <p className="font-bold text-center mb-5 text-sm md:text-base text-white">{confirmModal.msg}</p>
            <div className="flex gap-2.5">
              <button onClick={() => confirmModal.onResolve?.(false)} className="flex-1 py-2.5 rounded-xl border font-bold text-sm transition-colors active:scale-95 border-slate-600 text-slate-200 hover:bg-slate-800">Cancel</button>
              <button onClick={() => confirmModal.onResolve?.(true)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-extrabold text-sm hover:bg-red-500 transition-colors active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24 space-y-6">
        {/* HEADER */}
        <div className={`text-center ${styles.fadeUp} ${styles.d1}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg mb-4" style={{ boxShadow: '0 0 24px rgba(6,182,212,.3)' }}>
            <i className="ri-sticky-note-2-fill text-3xl text-white"></i>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Notes</h1>
          <p className="mt-2 text-sm text-slate-400">
            {notes.length} notes &bull; Last: {lastEdited}
          </p>
        </div>

        {/* COMPOSE CARD */}
        <div className={`${styles.fadeUp} ${styles.d2} ${styles.composePanel} rounded-3xl p-6 sm:p-7 shadow-xl transition-colors duration-200`}>
          <input 
            type="text" 
            placeholder="Title (optional)" 
            maxLength={80}
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`${styles.composeInput} mb-3 font-semibold text-base placeholder-current`}
          />
          <textarea 
            placeholder="Write your note… (Ctrl+Enter to save)"
            rows={4} 
            value={body}
            onChange={e => setBody(e.target.value)}
            className={`${styles.composeInput} ${styles.composeTextarea} mb-2 leading-relaxed text-sm`}
          ></textarea>
          
          <div className="flex justify-end mb-4">
            <span className="text-xs opacity-50 font-medium">{words} words · {body.length} chars</span>
          </div>

          {/* Colour swatches */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Colour</span>
            <div className="flex gap-2.5 flex-wrap">
              {COLORS.map(c => (
                <button 
                  key={c}
                  onClick={() => setCurrentColor(c)}
                  className={`${styles.swatch} ${currentColor === c ? styles.swatchActive : ''} bg-gradient-to-br ${
                    c==='cyan' ? 'from-cyan-400 to-cyan-600' :
                    c==='emerald' ? 'from-emerald-400 to-emerald-600' :
                    c==='violet' ? 'from-violet-500 to-violet-700' :
                    c==='rose' ? 'from-rose-500 to-rose-700' :
                    c==='amber' ? 'from-amber-400 to-amber-600' :
                    c==='blue' ? 'from-blue-500 to-blue-700' :
                    c==='pink' ? 'from-fuchsia-500 to-pink-600' :
                    'from-slate-500 to-slate-700'
                  }`}
                  title={c.charAt(0).toUpperCase() + c.slice(1)}
                />
              ))}
            </div>

            {/* Pin toggle */}
            <label className="ml-auto flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} className="sr-only" />
              <div className="relative w-10 h-5 rounded-full bg-white/20 transition-colors" style={{ background: pinned ? '#fbbf24' : '' }}>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform" style={{ transform: pinned ? 'translateX(1.25rem)' : 'translateX(0)' }}></div>
              </div>
              <span className="text-xs font-semibold opacity-70"><i className="ri-pushpin-line"></i> Pin</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={saveNote}
              className="flex-1 py-3 rounded-xl bg-white/15 hover:bg-white/25 font-bold text-sm backdrop-blur transition-all active:scale-[.98] flex items-center justify-center gap-2 border border-white/20"
            >
              <i className={editingId !== null ? "ri-save-line text-base" : "ri-add-circle-line text-base"}></i>
              <span>{editingId !== null ? 'Update' : 'Add Note'}</span>
            </button>
            {editingId !== null && (
              <button 
                onClick={cancelEdit}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-semibold text-sm border border-white/15 transition-all active:scale-95"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* SEARCH + SORT + FILTER */}
        <div className={`${styles.fadeUp} ${styles.d3} flex flex-col gap-3`}>
          <div className="relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text" 
              placeholder="Search notes…" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
            />
          </div>
          <div className="flex gap-2.5">
            <select 
              value={colorFilter}
              onChange={e => setColorFilter(e.target.value)}
              className="flex-1 px-3.5 py-3 rounded-xl border focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all cursor-pointer bg-slate-800 border-slate-700 text-slate-200"
            >
              <option value="all">🎨 All</option>
              <option value="cyan">🩵 Cyan</option>
              <option value="emerald">💚 Emerald</option>
              <option value="violet">💜 Violet</option>
              <option value="rose">🌹 Rose</option>
              <option value="amber">🟡 Amber</option>
              <option value="blue">💙 Blue</option>
              <option value="pink">🩷 Pink</option>
              <option value="slate">🩶 Slate</option>
            </select>
            <div className="flex rounded-xl border p-1 gap-1 bg-slate-800 border-slate-700">
              <button onClick={() => setSortMode('newest')} className={`${styles.sortBtn} ${sortMode === 'newest' ? styles.sortBtnActive : ''} text-xs font-bold px-3 py-1.5 rounded-lg`}>New</button>
              <button onClick={() => setSortMode('oldest')} className={`${styles.sortBtn} ${sortMode === 'oldest' ? styles.sortBtnActive : ''} text-xs font-bold px-3 py-1.5 rounded-lg`}>Old</button>
              <button onClick={() => setSortMode('az')} className={`${styles.sortBtn} ${sortMode === 'az' ? styles.sortBtnActive : ''} text-xs font-bold px-3 py-1.5 rounded-lg`}>A–Z</button>
            </div>
            <button 
              onClick={clearAllNotes}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border hover:border-red-500 text-sm font-semibold transition-all active:scale-95 bg-slate-800 border-slate-700 text-red-400"
            >
              <i className="ri-delete-bin-line"></i>
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* NOTES GRID */}
        <div className={`${styles.fadeUp} ${styles.d4}`}>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
            {displayNotes.map(note => {
              const color = COLORS.includes(note.color) ? note.color : 'cyan';
              const preview = note.body.length > 300 ? note.body.slice(0, 300) + '…' : note.body;
              
              return (
                <div key={note.id} className={`${styles.notePop} ${styles.noteCard} ${styles[`nc${color.charAt(0).toUpperCase() + color.slice(1)}`]} rounded-2xl p-5 mb-4 break-inside-avoid relative`}>
                  {note.pinned && <div className={styles.pinBadge}>📌</div>}
                  {note.title && <h3 className="font-bold text-base mb-2 pr-14 leading-snug">{note.title}</h3>}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed opacity-90">{preview}</p>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-current border-opacity-20">
                    <span className="text-xs opacity-55">{timeAgo(note.updatedAt || note.createdAt || 0)}</span>
                    <span className="text-xs opacity-45">{note.body.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button 
                      onClick={() => togglePin(note.id)} 
                      title={note.pinned ? "Unpin" : "Pin"}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors active:scale-90"
                    >
                      <i className={`ri-pushpin-${note.pinned ? 'fill' : 'line'} text-sm`}></i>
                    </button>
                    <button 
                      onClick={() => editNote(note.id)} 
                      title="Edit"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors active:scale-90"
                    >
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)} 
                      title="Delete"
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/30 transition-colors active:scale-90"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!displayNotes.length && (
            <div className="text-center py-16">
              <i className="ri-sticky-note-line text-5xl block mb-3 text-slate-600"></i>
              <p className="font-medium text-slate-500">No notes found</p>
              <p className="text-sm mt-1 text-slate-600">Create your first note above</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
