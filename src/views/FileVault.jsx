import React, { useState, useRef, useEffect } from 'react'
import { Upload, Download, Trash2 } from 'lucide-react'
import { hasPermission } from '../data/auth.js'
import { apiGetVault, apiAddVaultFile, apiDeleteVaultFile } from '../data/api.js'
import { Badge, showToast } from '../components/UI.jsx'

export default function FileVault({ user }) {
  const [files, setFiles] = useState([])

  useEffect(() => {
    apiGetVault().then(setFiles).catch(() => {})
  }, [])
  const [drag,  setDrag]  = useState(false)
  const inputRef = useRef(null)
  const canDelete = hasPermission(user, 'fileDelete')

  function addFiles(fileList) {
    const now = new Date()
    const t = [now.getUTCHours(), now.getUTCMinutes()].map(v => String(v).padStart(2,'0')).join(':') + 'Z'
    const newFiles = [...fileList].map(f => ({
      name: f.name,
      ext: f.name.split('.').pop().toUpperCase().slice(0, 3) || 'BIN',
      size: f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : (f.size / 1024).toFixed(0) + ' KB',
      uploader: user?.codename || 'AGENT',
      time: t,
    }))
    // Save each file to backend
    Promise.all(newFiles.map(f => apiAddVaultFile(f))).then(saved => {
      setFiles(prev => [...saved, ...prev])
    }).catch(() => {
      setFiles(prev => [...newFiles.map(f => ({ ...f, id: Math.random().toString(36).slice(2) })), ...prev])
    })
    showToast(`${newFiles.length} file(s) encrypted & uploaded`)
  }

  function deleteFile(id) {
    setFiles(prev => prev.filter(f => f.id !== id))
    apiDeleteVaultFile(id).catch(() => {})
    showToast('File removed from vault')
  }

  return (
    <div className="flex-1 overflow-y-auto p-7 flex flex-col">
      <div className="flex items-end justify-between mb-6 pb-4 border-b border-[#1E2540]">
        <div>
          <h1 className="text-[18px] font-bold text-slate-100">File Vault</h1>
          <p className="font-mono text-[10px] text-slate-500 mt-1">CLASSIFIED DOCUMENT REPOSITORY — ENCRYPTED AT REST</p>
        </div>
        <Badge variant="amber">TS//SCI REQUIRED</Badge>
      </div>

      {/* Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all mb-5
          ${drag ? 'border-blue-500 bg-blue-950/20' : 'border-[#28304E] hover:border-blue-600 hover:bg-blue-950/10'}`}>
        <Upload size={28} className={`mx-auto mb-3 ${drag ? 'text-blue-400' : 'text-slate-600'}`} />
        <div className="text-sm font-semibold text-slate-200 mb-1">Drop Files Here</div>
        <div className="text-xs text-slate-500">or click to browse — all file types — encrypted on upload</div>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
      </div>

      {/* File list */}
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.07em] mb-2">Vault Contents</div>
      {files.length === 0 ? (
        <div className="text-xs text-slate-600 py-4">No files uploaded yet.</div>
      ) : (
        <div className="space-y-1.5">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 bg-[#0C0F1A] border border-[#1E2540] rounded px-3 py-2.5 hover:border-[#28304E] transition-colors">
              <div className="bg-blue-950 text-blue-400 text-[9px] font-bold font-mono px-2 py-1 rounded flex-shrink-0">
                {f.ext}
              </div>
              <span className="flex-1 text-[12px] font-medium text-slate-100">{f.name}</span>
              <div className="font-mono text-[10px] text-slate-500 text-right">
                <div>{f.size}</div>
                <div className="text-blue-500">{f.uploader} · {f.time}</div>
              </div>
              <div className="flex gap-1.5">
                <button className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all">
                  <Download size={13} />
                </button>
                {canDelete && (
                  <button onClick={() => deleteFile(f.id)}
                    className="w-7 h-7 flex items-center justify-center rounded border border-[#1E2540] text-slate-500 hover:border-red-600 hover:text-red-400 hover:bg-red-950 transition-all">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
