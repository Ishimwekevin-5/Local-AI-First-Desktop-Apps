/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Terminal, 
  Search, 
  HardDrive, 
  Activity, 
  Shield, 
  Settings, 
  Layers, 
  Zap,
  Command,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Plus,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Database,
  Trash2,
  Folder,
  MoreVertical,
  Edit2,
  Trash
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---

interface FileObject {
  id: string;
  name: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'data' | 'app' | 'folder';
  content?: string;
  isDeleted: boolean;
  icon?: any;
  lastModified: Date;
  deletedAt?: Date;
  parentId?: string;
}

interface WindowState {
  id: string;
  fileId: string;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

// --- Initial Data ---

const INITIAL_FILES: FileObject[] = [
  { id: '1', name: 'Kernel Specs', type: 'text', content: '# AetherOS Kernel\n\n- Rust-based\n- eBPF Hooks\n- WASM Sandboxing', isDeleted: false, lastModified: new Date() },
  { id: '2', name: 'System Logs', type: 'text', content: '08:55:44 - eBPF Hook Initialized\n08:55:45 - Semantic FS Ready', isDeleted: false, lastModified: new Date() },
  { id: '3', name: 'Neural Weights', type: 'data', isDeleted: false, lastModified: new Date() },
  { id: '4', name: 'Workspace BG', type: 'image', isDeleted: false, lastModified: new Date() },
  { id: 'terminal', name: 'Terminal', type: 'app', isDeleted: false, icon: Terminal, lastModified: new Date() },
  { id: 'monitor', name: 'System Monitor', type: 'app', isDeleted: false, icon: Activity, lastModified: new Date() },
  
  // LLM Models Folder
  { id: 'llm-folder', name: 'LLM Models', type: 'folder', isDeleted: false, lastModified: new Date() },
  
  // LLMs inside the folder
  { id: 'gpt', name: 'GPT-4o', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Zap, lastModified: new Date() },
  { id: 'gemini', name: 'Gemini 1.5', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Layers, lastModified: new Date() },
  { id: 'claude', name: 'Claude 3.5', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Shield, lastModified: new Date() },
  { id: 'openclaw', name: 'OpenClaw', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Command, lastModified: new Date() },
  { id: 'deepseek', name: 'DeepSeek', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Search, lastModified: new Date() },
  { id: 'qwen', name: 'Qwen 2.5', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Database, lastModified: new Date() },
  { id: 'kimi', name: 'Kimi AI', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Activity, lastModified: new Date() },
  { id: 'llama', name: 'Llama 3', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Cpu, lastModified: new Date() },
  { id: 'ollama', name: 'Ollama', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: HardDrive, lastModified: new Date() },
  { id: 'agents', name: 'AI Agents', type: 'app', parentId: 'llm-folder', isDeleted: false, icon: Zap, lastModified: new Date() },
];

// --- Components ---

const ContextMenu = ({ x, y, onRename, onDelete, onClose }: { x: number, y: number, onRename: () => void, onDelete: () => void, onClose: () => void }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div 
      className="fixed z-[100] glass-dark border border-white/10 rounded-lg py-1 w-40 shadow-2xl"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={() => { onRename(); onClose(); }}
        className="w-full px-3 py-2 text-left text-[11px] hover:bg-white/10 flex items-center gap-2 transition-colors"
      >
        <Edit2 size={12} className="text-blue-400" />
        <span>Rename</span>
      </button>
      <button 
        onClick={() => { onDelete(); onClose(); }}
        className="w-full px-3 py-2 text-left text-[11px] hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition-colors"
      >
        <Trash size={12} />
        <span>Delete</span>
      </button>
    </div>
  );
};

interface WindowProps {
  key?: string | number;
  window: WindowState;
  file: FileObject;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  zIndex: number;
  children?: React.ReactNode;
}

const Window = ({ window, file, onClose, onFocus, onMinimize, onMaximize, zIndex, children }: WindowProps) => {
  return (
    <AnimatePresence>
      {!window.isMinimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={cn(
            "fixed glass-dark border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl",
            window.isMaximized ? "inset-4" : "w-[600px] h-[400px] top-20 left-1/2 -translate-x-1/2"
          )}
          style={{ zIndex }}
          onClick={onFocus}
        >
          <div className="h-10 bg-white/5 border-b border-white/5 px-4 flex items-center justify-between cursor-default">
            <div className="flex items-center gap-2">
              {file.type === 'app' && file.icon ? <file.icon size={14} className="text-blue-400" /> : <FileText size={14} className="text-blue-400" />}
              <span className="text-[11px] font-bold tracking-tight text-white/80">{file.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
              >
                <Minimize2 size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onMaximize(); }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
              >
                {window.isMaximized ? <Minimize2 size={14} className="rotate-45" /> : <Maximize2 size={14} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-white/40 hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-auto text-xs text-white/70 leading-relaxed">
            {children ? children : (
              file.type === 'app' ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50 italic">
                  <Cpu size={48} />
                  <span>Application Runtime Initializing...</span>
                </div>
              ) : (
                <pre className="font-mono whitespace-pre-wrap">{file.content || "No content available."}</pre>
              )
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [files, setFiles] = useState<FileObject[]>(INITIAL_FILES);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [time, setTime] = useState(new Date());
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, fileId: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openFile = (fileId: string) => {
    const existing = windows.find(w => w.fileId === fileId);
    if (existing) {
      // Focus and restore existing window
      setWindows(prev => prev.map(w => w.fileId === fileId ? { 
        ...w, 
        isMinimized: false,
        zIndex: Math.max(...prev.map(win => win.zIndex), 0) + 1 
      } : w));
      return;
    }
    const newWindow: WindowState = {
      id: Math.random().toString(36).substr(2, 9),
      fileId,
      isMaximized: false,
      isMinimized: false,
      zIndex: Math.max(...windows.map(w => w.zIndex), 0) + 1
    };
    setWindows(prev => [...prev, newWindow]);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: Math.max(...prev.map(win => win.zIndex), 0) + 1 } : w));
  };

  const toggleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isDeleted: true, deletedAt: new Date() } : f));
    setWindows(prev => prev.filter(w => w.fileId !== id));
  };

  const restoreFile = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isDeleted: false, deletedAt: undefined } : f));
  };

  const moveFile = (fileId: string, targetFolderId: string | null) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        // If dropping into recycle bin
        if (targetFolderId === 'recycle-bin') {
          return { ...f, isDeleted: true, deletedAt: new Date(), parentId: undefined };
        }
        // If dropping into a folder
        return { ...f, isDeleted: false, deletedAt: undefined, parentId: targetFolderId || undefined };
      }
      return f;
    }));
    
    // If moved to recycle bin, close window
    if (targetFolderId === 'recycle-bin') {
      setWindows(prev => prev.filter(w => w.fileId !== fileId));
    }
  };

  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData('fileId', fileId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData('fileId');
    if (fileId && fileId !== targetFolderId) {
      moveFile(fileId, targetFolderId);
    }
  };

  const permanentlyDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startRename = (file: FileObject) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const handleRename = () => {
    if (renamingId && renameValue.trim()) {
      setFiles(prev => prev.map(f => f.id === renamingId ? { ...f, name: renameValue } : f));
    }
    setRenamingId(null);
  };

  const addNewFile = () => {
    const newFile: FileObject = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Document',
      type: 'text',
      content: 'New content...',
      isDeleted: false,
      lastModified: new Date()
    };
    setFiles(prev => [...prev, newFile]);
    startRename(newFile);
  };

  const desktopFiles = files.filter(f => !f.isDeleted && !f.parentId);
  const deletedFiles = files.filter(f => f.isDeleted);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-10 glass border-b border-white/5 z-[1000] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold tracking-tighter uppercase">AetherOS</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Desktop</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
            <div className="flex items-center gap-1.5">
              <Cpu size={12} className="text-green-500" />
              <span>12%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-yellow-500" />
              <span>45W</span>
            </div>
          </div>
          <div className="text-[11px] font-mono font-bold">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
        </div>
      </header>

      {/* Desktop Area */}
      <main 
        className="pt-10 h-screen w-full relative p-6"
        onContextMenu={(e) => {
          e.preventDefault();
          // Could add desktop context menu here
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[repeat(auto-fill,100px)] gap-4 h-full content-start">
          {desktopFiles.map(file => (
            <div 
              key={file.id}
              draggable
              onDragStart={(e) => handleDragStart(e, file.id)}
              onDragOver={file.type === 'folder' ? handleDragOver : undefined}
              onDrop={file.type === 'folder' ? (e) => handleDrop(e, file.id) : undefined}
              className="flex flex-col items-center gap-2 group cursor-default"
              onDoubleClick={() => openFile(file.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id });
              }}
            >
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-105",
                "bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-white/20",
                "shadow-lg group-hover:shadow-blue-500/10"
              )}>
                {file.type === 'app' && file.icon ? (
                  <file.icon size={32} className="text-blue-400" />
                ) : file.type === 'folder' ? (
                  <Folder size={32} className="text-blue-400" />
                ) : (
                  <FileText size={32} className="text-blue-400" />
                )}
              </div>
              {renamingId === file.id ? (
                <input 
                  autoFocus
                  className="bg-blue-600/20 border border-blue-500/50 rounded px-1 text-[10px] text-center w-20 focus:outline-none"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
              ) : (
                <span className="text-[10px] font-medium text-white/80 text-center truncate w-20 px-1 group-hover:bg-white/10 rounded transition-colors">
                  {file.name}
                </span>
              )}
            </div>
          ))}

          {/* Recycle Bin Icon */}
          <div 
            className="flex flex-col items-center gap-2 group cursor-default"
            onDoubleClick={() => openFile('recycle-bin')}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'recycle-bin')}
          >
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-105",
              "bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-white/20",
              "shadow-lg"
            )}>
              <Trash2 size={32} className={cn(deletedFiles.length > 0 ? "text-blue-400" : "text-white/20")} />
            </div>
            <span className="text-[10px] font-medium text-white/80 text-center truncate w-20 px-1 group-hover:bg-white/10 rounded transition-colors">
              Recycle Bin
            </span>
          </div>

          {/* Add New Button */}
          <button 
            onClick={addNewFile}
            className="flex flex-col items-center gap-2 group cursor-default"
          >
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-105",
              "bg-white/5 border border-white/5 border-dashed group-hover:bg-white/10 group-hover:border-white/20",
            )}>
              <Plus size={24} className="text-white/20 group-hover:text-white/40" />
            </div>
            <span className="text-[10px] font-medium text-white/40 text-center truncate w-20 px-1">
              New File
            </span>
          </button>
        </div>
      </main>

      {/* Windows Layer */}
      <AnimatePresence>
        {windows.map(win => {
          const file = win.fileId === 'recycle-bin' 
            ? { id: 'recycle-bin', name: 'Recycle Bin', type: 'app', isDeleted: false, lastModified: new Date() } as FileObject
            : files.find(f => f.id === win.fileId);
          
          if (!file) return null;

          return (
            <Window 
              key={win.id}
              window={win}
              file={file}
              zIndex={win.zIndex}
              onFocus={() => focusWindow(win.id)}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
            >
              {file.type === 'folder' && (
                <div 
                  className="grid grid-cols-4 gap-4 min-h-full"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, file.id)}
                >
                  {files.filter(f => f.parentId === file.id && !f.isDeleted).map(f => (
                    <div 
                      key={f.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, f.id)}
                      className="flex flex-col items-center gap-2 group p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-default"
                      onDoubleClick={(e) => { e.stopPropagation(); openFile(f.id); }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({ x: e.clientX, y: e.clientY, fileId: f.id });
                      }}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        {f.type === 'app' && f.icon ? <f.icon size={24} /> : <FileText size={24} />}
                      </div>
                      <span className="text-[10px] truncate w-full text-center">{f.name}</span>
                    </div>
                  ))}
                  {files.filter(f => f.parentId === file.id && !f.isDeleted).length === 0 && (
                    <div className="col-span-4 flex flex-col items-center justify-center py-12 opacity-30 gap-2 italic">
                      <span>Folder is empty</span>
                    </div>
                  )}
                </div>
              )}
              {win.fileId === 'recycle-bin' && (
                <div className="space-y-4">
                  {deletedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30 gap-2">
                      <Trash2 size={48} />
                      <span>Recycle Bin is empty</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-4">
                      {deletedFiles.map(f => (
                        <div 
                          key={f.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, f.id)}
                          className="flex flex-col items-center gap-2 group p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all relative"
                        >
                          <FileText size={24} className="text-white/40" />
                          <span className="text-[10px] truncate w-full text-center">{f.name}</span>
                          {f.deletedAt && (
                            <span className="text-[8px] text-white/20">
                              {Math.floor((new Date().getTime() - new Date(f.deletedAt).getTime()) / 60000)}m ago
                            </span>
                          )}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                            <button 
                              onClick={() => restoreFile(f.id)}
                              className="p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                              title="Restore"
                            >
                              <Plus size={10} />
                            </button>
                            <button 
                              onClick={() => permanentlyDelete(f.id)}
                              className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              title="Delete Permanently"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Window>
          );
        })}
      </AnimatePresence>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={() => {
            const file = files.find(f => f.id === contextMenu.fileId);
            if (file) startRename(file);
          }}
          onDelete={() => deleteFile(contextMenu.fileId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 h-14 glass rounded-2xl px-3 flex items-center gap-1 z-[2000] shadow-2xl">
        {/* App Launchers */}
        {[
          { id: 'terminal', icon: Terminal, name: 'Terminal' },
          { id: 'monitor', icon: Activity, name: 'Monitor' },
          { id: 'llm-folder', icon: Folder, name: 'Models' },
        ].map((app) => (
          <motion.button 
            key={app.id}
            whileHover={{ scale: 1.2, y: -8 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openFile(app.id)}
            className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all relative group"
            title={app.name}
          >
            <app.icon size={18} />
            {windows.some(w => w.fileId === app.id) && (
              <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
            )}
          </motion.button>
        ))}

        <div className="h-6 w-[1px] bg-white/10 mx-2" />

        {/* Dynamic Active Windows */}
        {windows.filter(w => !['terminal', 'monitor', 'llm-folder', 'recycle-bin'].includes(w.fileId)).map(win => {
          const file = files.find(f => f.id === win.fileId);
          if (!file) return null;
          return (
            <motion.button 
              key={win.id}
              whileHover={{ scale: 1.2, y: -8 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => openFile(win.fileId)}
              className={cn(
                "w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all relative",
                win.isMinimized ? "text-white/20" : "text-blue-400 bg-white/5"
              )}
              title={file.name}
            >
              {file.type === 'folder' ? <Folder size={18} /> : <FileText size={18} />}
              <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </motion.button>
          );
        })}

        {windows.filter(w => !['terminal', 'monitor', 'llm-folder', 'recycle-bin'].includes(w.fileId)).length > 0 && (
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
        )}

        <motion.button 
          whileHover={{ scale: 1.2, y: -8 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => openFile('recycle-bin')}
          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all relative"
          title="Recycle Bin"
        >
          <Trash2 size={18} className={deletedFiles.length > 0 ? "text-blue-400" : ""} />
          {windows.some(w => w.fileId === 'recycle-bin') && (
            <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
