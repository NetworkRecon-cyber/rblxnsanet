import React, { useState } from 'react'
import { Search, Download, Trash2, ShieldOff, FileText, Upload } from 'lucide-react'
import { showToast } from '../components/UI'
import { hasPermission } from '../data/auth'
import type { User } from '../data/auth'

interface FileVaultProps { user: User }

interface VaultFile {
  id:             string
  name:           string
  classification: 'TOP SECRET' | 'TS//SCI' | 'SECRET' | 'UNCLASSIFIED'
  size:           string
  uploaded:       string
  uploader:       string
}

const FILES: VaultFile[] = [
  { id: 'f001', name: 'BYZANTINE_HADES_BRIEF.pdf',    classification: 'TOP SECRET',   size: '4.2 MB',  uploaded: '2024-03-15', uploader: 'DIRECTOR' },
  { id: 'f002', name: 'SIGINT_REPORT_Q3_2024.pdf',    classification: 'TS//SCI',      size: '11.7 MB', uploaded: '2024-03-14', uploader: 'CIPHER'   },
  { id: 'f003', name: 'QUANTUM_INSERT_PLAYBOOK.docx', classification: 'TOP SECRET',   size: '2.1 MB',  uploaded: '2024-03-12', uploader: 'WRAITH'   },
  { id: 'f004', name: 'TURBINE_IMPLANT_GUIDE.pdf',    classification: 'TS//SCI',      size: '7.8 MB',  uploaded: '2024-03-10', uploader: 'SPECTER'  },
  { id: 'f005', name: 'NETWORK_TOPOLOGY_SIGMA.png',   classification: 'SECRET',       size: '1.3 MB',  uploaded: '2024-03-09', uploader: 'ORACLE'   },
  { id: 'f006', name: 'STAFF_ROSTER_2024.xlsx',       classification: 'SECRET',       size: '0.4 MB',  uploaded: '2024-03-07', uploader: 'RAVEN'    },
  { id: 'f007', name: 'CRYPTO_WEEKLY_2024_11.pdf',    classification: 'SECRET',       size: '2.9 MB',  uploaded: '2024-03-06', uploader: 'ORACLE'   },
  { id: 'f008', name: 'NSANET_USER_HANDBOOK.pdf',     classification: 'UNCLASSIFIED', size: '0.8 MB',  uploaded: '2024-01-01', uploader: 'DIRECTOR' },
]

const CLASS_STYLE: Record<string, string> = {
  'TOP SECRET':   'text-red-400   bg-red-950/40   border-red-800/50',
  'TS//SCI':      'text-red-300   bg-red-950/30   border-red-700/40',
  'SECRET':       'text-amber-400 bg-amber-950/40 border-amber-800/50',
  'UNCLASSIFIED': 'text-green-400 bg-green-950/40 border-green-800/50',
}

export default function FileVault({ user }: FileVaultProps) {
  const [query, setQuery] = useState('')
  const [files, setFiles] = useState(FILES)

  if (!hasPermission(user, 'vaultView')) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <ShieldOff size={32} className="text-red-500/60" />
        <div className="text-red-400 font-mono text-sm tracking-widest">ACCESS DENIED</div>
        <div className="text-slate-600 font-mono text-[11px]">TS//SCI CLEARANCE REQUIRED</div>
      </div>
    )
  }

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.uploader.toLowerCase().includes(query.toLowerCase())
  )

  function handleDelete(id: string) {
    if (!hasPermission(user, 'fileDelete')) { showToast('ACCESS DENIED — insufficient clearance'); return }
    setFiles(prev => prev.filter(f => f.id !== id))
    showToast('File deleted')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100 tracking-wide">File Vault</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">Classified document repository — {filtered.length} files</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search files..."
              className="bg-[#0C0F1A] border border-[#1E2540] rounded-lg pl-8 pr-3 py-2
                text-[12px] text-slate-300 outline-none w-48 focus:border-blue-500/60
                transition-all placeholder:text-slate-600" />
          </div>
          <button onClick={() => showToast('Upload not available in demo')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1E2540]
              text-slate-500 hover:text-slate-300 hover:border-slate-500 text-[12px]
              transition-all bg-transparent cursor-pointer">
            <Upload size={12} />
            Upload
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0C0F1A] border border-[#1E2540] rounded-xl overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#1E2540] bg-[#080B14]">
              {['File', 'Classification', 'Size', 'Uploaded', 'By', ''].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1F35]">
            {filtered.map(f => (
              <tr key={f.id} className="hover:bg-[#111627]/60 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <FileText size={13} className="text-slate-600 flex-shrink-0" />
                    <span className="font-mono text-slate-200 text-[11px]">{f.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block border rounded px-2 py-0.5 text-[9px] font-mono font-bold
                    ${CLASS_STYLE[f.classification]}`}>
                    {f.classification}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">{f.size}</td>
                <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">{f.uploaded}</td>
                <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">{f.uploader}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => showToast('Download not available in demo')}
                      className="p-1.5 rounded border border-[#1E2540] text-slate-500
                        hover:border-blue-500/50 hover:text-blue-400 transition-all
                        bg-transparent cursor-pointer">
                      <Download size={11} />
                    </button>
                    <button onClick={() => handleDelete(f.id)}
                      className="p-1.5 rounded border border-[#1E2540] text-slate-500
                        hover:border-red-500/50 hover:text-red-400 transition-all
                        bg-transparent cursor-pointer">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-600 font-mono text-[11px]">
                  NO FILES MATCHING QUERY
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
