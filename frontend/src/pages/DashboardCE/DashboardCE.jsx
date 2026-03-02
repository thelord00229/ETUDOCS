import { useEffect, useMemo, useState } from "react";
import {
  getDemandes,
  getDemandeById,
  avancerDemande,
  getChefDivisionStats,
  validerPiece,
} from "../../services/api";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #1a2f5e;
    --navy-dark: #142347;
    --accent-blue: #1e4db7;
    --accent-gold: #f5a623;
    --teal: #0d9488;
    --bg: #f0f4f8;
    --white: #ffffff;
    --text: #1a2f5e;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --success: #10b981;
    --danger: #ef4444;
    --orange: #f97316;
    --purple: #7c3aed;
    --sidebar-width: 240px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); }
  .layout { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-width);
    background: var(--navy);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100;
  }
  .sidebar-logo { padding: 28px 20px; }
  .logo-text { font-size: 22px; font-weight: 700; color: white; letter-spacing: -0.5px; }
  .logo-text span { color: var(--accent-gold); font-weight: 400; font-size: 14px; margin-left: 6px; }
  .sidebar-nav { flex: 1; padding: 8px 12px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 10px; cursor: pointer;
    transition: all 0.2s; font-size: 14px; font-weight: 500;
    color: rgba(255,255,255,0.6); margin-bottom: 2px;
    border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
  .nav-item.active {
    background: var(--accent-gold); color: var(--navy-dark);
    font-weight: 700; box-shadow: 0 4px 14px rgba(245,166,35,0.35);
  }
  .nav-icon { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sidebar-footer { padding: 20px 12px; }
  .logout-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; border-radius: 8px; cursor: pointer;
    color: #f87171; font-size: 14px; font-weight: 500;
    transition: background 0.2s; border: none; background: none; width: 100%;
  }
  .logout-btn:hover { background: rgba(239,68,68,0.1); }

  /* ── MAIN ── */
  .main { margin-left: var(--sidebar-width); flex: 1; display: flex; flex-direction: column; }

  /* ── TOPBAR ── */
  .topbar {
    background: white; border-bottom: 1px solid var(--border);
    padding: 0 36px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .breadcrumb {
    background: var(--bg); border: 1px solid var(--border);
    padding: 6px 16px; border-radius: 20px;
    font-size: 13px; font-weight: 500; color: var(--navy);
  }
  .topbar-right { display: flex; align-items: center; gap: 20px; }
  .notif-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; color: var(--text-muted); display: flex; align-items: center; }
  .notif-dot { position: absolute; top: 2px; right: 2px; width: 9px; height: 9px; background: #f59e0b; border-radius: 50%; border: 2px solid white; }
  .user-info { text-align: right; }
  .user-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
  .user-org { font-size: 12px; color: var(--text-muted); }
  .avatar { width: 40px; height: 40px; background: var(--purple); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: white; letter-spacing: 0.5px; flex-shrink: 0; }

  /* ── CONTENT ── */
  .content { padding: 36px; flex: 1; }
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
  .page-title { font-size: 28px; font-weight: 700; color: var(--navy); letter-spacing: -0.5px; }
  .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 6px; }

  .actualiser-btn {
    background: var(--navy); color: white; border: none;
    padding: 12px 28px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; flex-shrink: 0;
  }
  .actualiser-btn:hover { background: var(--accent-blue); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(30,77,183,0.28); }

  /* ── STATS 4 cards ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: white; border-radius: 16px; padding: 24px 20px;
    display: flex; align-items: center; gap: 16px;
    border: 1px solid var(--border); transition: transform 0.2s, box-shadow 0.2s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .stat-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 2px solid; }
  .stat-icon.pending  { border-color: #bfdbfe; color: #3b82f6; background: #eff6ff; }
  .stat-icon.process  { border-color: #c4b5fd; color: var(--purple); background: #f5f3ff; }
  .stat-icon.done     { border-color: #6ee7b7; color: var(--success); background: #ecfdf5; }
  .stat-icon.refused  { border-color: #fca5a5; color: var(--danger); background: #fef2f2; }
  .stat-value { font-size: 34px; font-weight: 700; color: var(--navy); letter-spacing: -1px; line-height: 1; }
  .stat-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.2px; margin-top: 5px; }

  /* ── TABLE CARD ── */
  .table-card { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  .table-header { padding: 20px 28px; display: flex; align-items: center; justify-content: space-between; }
  .table-title { font-size: 15px; font-weight: 700; color: var(--navy); display: flex; align-items: center; gap: 10px; }
  .badge-count { background: var(--accent-blue); color: white; font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px; min-width: 22px; text-align: center; }
  .search-box { position: relative; display: flex; align-items: center; }
  .search-icon-wrap { position: absolute; left: 12px; color: var(--text-muted); pointer-events: none; display: flex; align-items: center; }
  .search-input { padding: 9px 14px 9px 36px; border: 1px solid var(--border); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--text); background: var(--bg); outline: none; width: 230px; transition: border-color 0.2s; }
  .search-input:focus { border-color: var(--accent-blue); background: white; box-shadow: 0 0 0 3px rgba(30,77,183,0.08); }
  .search-input::placeholder { color: var(--text-muted); }
  .table-divider { height: 1px; background: var(--border); }
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  thead th { padding: 13px 24px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.1px; background: white; white-space: nowrap; }
  tbody tr { border-top: 1px solid var(--border); transition: background 0.15s; }
  tbody tr:hover { background: #f8fafc; }
  td { padding: 14px 24px; font-size: 14px; color: var(--text); vertical-align: middle; }
  .td-ref { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent-blue); font-weight: 500; white-space: nowrap; }
  .td-student { font-weight: 600; }
  .td-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .td-delay { font-size: 13px; }
  .td-delay.urgent { color: var(--orange); font-weight: 600; }
  .td-delay.ok { color: var(--text-muted); }

  /* BADGES statut */
  .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .badge.blue   { background: #eff6ff; color: #1d4ed8; }
  .badge.purple { background: #f5f3ff; color: #6d28d9; }
  .badge.green  { background: #ecfdf5; color: #059669; }
  .badge.red    { background: #fef2f2; color: #dc2626; }
  .badge.orange { background: #fff7ed; color: #c2410c; }
  .badge.gray   { background: #f1f5f9; color: #475569; }

  /* ACTION BTN */
  .btn-action {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-action.primary { background: var(--navy); color: white; }
  .btn-action.primary:hover { background: var(--accent-blue); }
  .btn-action.outline { background: white; color: var(--navy); border: 1.5px solid var(--border); }
  .btn-action.outline:hover { border-color: var(--navy); }

  /* ── TRAITEMENT VIEW ── */
  .traitement-layout { display: grid; grid-template-columns: 280px 1fr 300px; gap: 20px; align-items: start; }

  /* Panneau gauche */
  .panel { background: white; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; }
  .panel-header { padding: 18px 20px; border-bottom: 1px solid var(--border); }
  .panel-title { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
  .panel-body { padding: 20px; }

  .info-row { margin-bottom: 14px; }
  .info-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px; }
  .info-value { font-size: 14px; font-weight: 600; color: var(--text); }
  .info-value.mono { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--accent-blue); }

  .doc-type-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: #eff6ff; color: var(--accent-blue);
    padding: 6px 12px; border-radius: 8px;
    font-size: 13px; font-weight: 600; margin-top: 4px;
  }

  .sem-pills { display: flex; gap: 8px; margin-top: 6px; }
  .sem-pill { padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
  .sem-pill.active { background: var(--navy); color: white; }
  .sem-pill.inactive { background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); }

  .divider-h { height: 1px; background: var(--border); margin: 16px 0; }

  /* Timeline */
  .timeline { display: flex; flex-direction: column; gap: 0; }
  .tl-item { display: flex; gap: 12px; padding-bottom: 16px; position: relative; }
  .tl-item:last-child { padding-bottom: 0; }
  .tl-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .tl-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
  .tl-dot.done { background: var(--success); }
  .tl-dot.active { background: var(--accent-blue); box-shadow: 0 0 0 3px rgba(30,77,183,0.2); }
  .tl-dot.todo { background: #cbd5e1; border: 2px solid #e2e8f0; }
  .tl-line { width: 2px; flex: 1; background: var(--border); margin-top: 4px; }
  .tl-text { flex: 1; }
  .tl-step { font-size: 13px; font-weight: 600; color: var(--text); }
  .tl-step.muted { color: var(--text-muted); font-weight: 400; }
  .tl-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

  /* Visionneuse pièces */
  .piece-card { background: white; border-radius: 16px; border: 1px solid var(--border); margin-bottom: 16px; overflow: hidden; }
  .piece-header { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
  .piece-name { font-size: 14px; font-weight: 700; color: var(--navy); display: flex; align-items: center; gap: 8px; }
  .piece-num { font-size: 11px; color: var(--text-muted); background: var(--bg); padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  .piece-preview {
    background: #f8fafc;
    height: 260px;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .piece-preview-inner {
    background: white;
    width: 200px; height: 220px;
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px; color: #94a3b8;
  }
  .piece-preview-inner svg { opacity: 0.3; }
  .piece-preview-inner span { font-size: 12px; }
  .piece-footer { padding: 16px 20px; }
  .piece-actions { display: flex; gap: 10px; margin-bottom: 12px; }
  .btn-valider {
    flex: 1; padding: 10px; border-radius: 9px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700; cursor: pointer; border: 2px solid; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .btn-valider.valid { border-color: var(--success); color: var(--success); background: white; }
  .btn-valider.valid.selected,
  .btn-valider.valid:hover { background: var(--success); color: white; }
  .btn-valider.reject { border-color: var(--danger); color: var(--danger); background: white; }
  .btn-valider.reject.selected,
  .btn-valider.reject:hover { background: var(--danger); color: white; }
  .piece-comment-area {
    width: 100%; padding: 10px 12px;
    border: 1.5px solid var(--border); border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--text);
    resize: none; outline: none; transition: border-color 0.2s;
    background: var(--bg);
  }
  .piece-comment-area:focus { border-color: var(--accent-blue); background: white; }
  .piece-comment-area::placeholder { color: #94a3b8; }

  /* Panneau droit — checklist + actions */
  .checklist { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .check-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--bg); }
  .check-item.valid-state { border-color: #6ee7b7; background: #f0fdf4; }
  .check-item.reject-state { border-color: #fca5a5; background: #fef2f2; }
  .check-item.pending-state { border-color: var(--border); background: var(--bg); }
  .check-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .check-status { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 4px; }
  .check-status.v { color: var(--success); }
  .check-status.r { color: var(--danger); }
  .check-status.p { color: var(--text-muted); }

  .comment-global-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }

  .btn-main {
    width: 100%; padding: 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
    cursor: pointer; border: none; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 10px; letter-spacing: 0.2px;
  }
  .btn-main.generate { background: var(--success); color: white; }
  .btn-main.generate:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,0.3); }
  .btn-main.generate:disabled { background: #d1fae5; color: #6ee7b7; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-main.reject-all { background: white; color: var(--danger); border: 2px solid var(--danger); }
  .btn-main.reject-all:hover { background: var(--danger); color: white; }

  .info-box { padding: 12px 14px; border-radius: 10px; font-size: 12px; line-height: 1.6; }
  .info-box.blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .info-box.green { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

  /* ── MODAL ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px); }
  .modal { background: white; border-radius: 20px; padding: 32px; width: 480px; max-width: 95vw; box-shadow: 0 24px 64px rgba(0,0,0,0.2); }
  .modal-title { font-size: 18px; font-weight: 700; color: var(--navy); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .modal-body { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 24px; }
  .modal-ref { font-family: 'DM Mono', monospace; font-size: 13px; color: var(--accent-blue); background: #eff6ff; padding: 3px 8px; border-radius: 6px; }
  .modal-actions { display: flex; gap: 12px; }
  .modal-btn { flex: 1; padding: 12px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
  .modal-btn.confirm-gen { background: var(--success); color: white; }
  .modal-btn.confirm-gen:hover { background: #059669; }
  .modal-btn.confirm-gen:disabled { opacity: 0.6; cursor: not-allowed; }
  .modal-btn.confirm-rej { background: var(--danger); color: white; }
  .modal-btn.confirm-rej:hover { background: #dc2626; }
  .modal-btn.confirm-rej:disabled { opacity: 0.6; cursor: not-allowed; }
  .modal-btn.cancel { background: var(--bg); color: var(--text); border: 1.5px solid var(--border); }
  .modal-btn.cancel:hover { border-color: var(--navy); }
  .modal-btn.cancel:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── SUCCESS STATE ── */
  .success-card { background: white; border-radius: 20px; border: 2px solid #6ee7b7; padding: 40px; text-align: center; }
  .success-icon { width: 72px; height: 72px; background: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; border: 2px solid #6ee7b7; }
  .success-title { font-size: 22px; font-weight: 700; color: var(--success); margin-bottom: 8px; }
  .success-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
  .success-ref-box { background: #f0fdf4; border: 1px solid #6ee7b7; border-radius: 10px; padding: 14px 20px; display: inline-block; margin-bottom: 28px; }
  .success-ref-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .success-ref { font-family: 'DM Mono', monospace; font-size: 14px; color: var(--accent-blue); font-weight: 600; }
  .success-note { font-size: 13px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 6px; }
  .success-actions { display: flex; gap: 12px; justify-content: center; margin-top: 24px; }

  /* motif rejet */
  .motif-input { width: 100%; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--text); resize: none; outline: none; transition: border-color 0.2s; margin-top: 8px; }
  .motif-input:focus { border-color: var(--danger); }
  .motif-count { font-size: 11px; color: var(--text-muted); text-align: right; margin-top: 4px; }
  .motif-error { font-size: 12px; color: var(--danger); margin-top: 4px; }
`;

// ── SVG Icons ──────────────────────────────────────────────
const GridIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const BellIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FileIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const SparkleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const statutBadge = (s) => {
  if (s === "process") return <span className="badge purple">En traitement</span>;
  if (s === "done") return <span className="badge green">Document généré</span>;
  if (s === "refused") return <span className="badge red">Rejetée</span>;
  return <span className="badge gray">En attente</span>;
};

// ── PIECE STATE initial ─────────────────────────────────────
const defaultPieces = [
  {
    id: "cip",
    name: "Carte d'Identification Personnelle (CIP)",
    num: "Pièce 1/2",
    status: null,
    comment: "",
    fileName: "",
    url: "",
  },
  {
    id: "quittance",
    name: "Quittance de paiement",
    num: "Pièce 2/2",
    status: null,
    comment: "",
    fileName: "",
    url: "",
  },
];

// ── COMPOSANT PRINCIPAL ────────────────────────────────────
export default function ChefDivisionExamens() {
  const [view, setView] = useState("dashboard"); // dashboard | traitement | success
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [pieces, setPieces] = useState(defaultPieces);
  const [globalComment, setGlobalComment] = useState("");
  const [modal, setModal] = useState(null); // null | "generate" | "reject"
  const [motif, setMotif] = useState("");
  const [motifError, setMotifError] = useState("");
  const [generatedRef, setGeneratedRef] = useState("");
  const [pieceBusy, setPieceBusy] = useState(null); // id pièce en cours
  const [preview, setPreview] = useState(null); // { url, name }
  const [genBusy, setGenBusy] = useState(false);

  const [demandes, setDemandes] = useState([]);

  // 🔥 STATE STATS
  const [stats, setStats] = useState({
    aTraiter: 0,
    enTraitement: 0,
    generes: 0,
    rejetees: 0,
  });

  useEffect(() => {
    chargerDemandes();
    chargerStats();
  }, []);

  const chargerDemandes = async () => {
    try {
      const data = await getDemandes();
      const list = Array.isArray(data) ? data : data?.demandes ?? [];
      setDemandes(list);
    } catch (e) {
      console.error(e);
      setDemandes([]);
    }
  };

  // 🔥 Charger les stats depuis le backend
  const chargerStats = async () => {
    try {
      const data = await getChefDivisionStats();
      setStats(data ?? { aTraiter: 0, enTraitement: 0, generes: 0, rejetees: 0 });
    } catch (e) {
      console.error(e);
      setStats({ aTraiter: 0, enTraitement: 0, generes: 0, rejetees: 0 });
    }
  };

  const openTraitement = async (d) => {
    try {
      const full = await getDemandeById(d.id);
      setSelected(full);

      const mapped = (full?.pieces || []).map((p, idx) => ({
        id: p.id,
        name: p.typePiece, // ex: CIP
        fileName: p.nom, // nom original
        url: p.url, // uploads\xxxx.pdf ou uploads/xxxx.pdf
        num: `Pièce ${idx + 1}/${(full?.pieces || []).length || 1}`,
        status: p.statut === "VALIDEE" ? "valid" : p.statut === "REJETEE" ? "reject" : null,
        comment: p.commentaire || "",
      }));

      setPieces(mapped.length ? mapped : defaultPieces);
      setGlobalComment(full?.commentaireChefDivision || "");
      setMotif("");
      setMotifError("");
      setModal(null);
      setPreview(null);

      setView("traitement");
    } catch (e) {
      console.error(e);
      alert("Impossible d’ouvrir le dossier (API getDemandeById).");
    }
  };

  // ✅ Preview (Consulter)
  const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) ||
    "http://localhost:5000";

  const openPreview = (piece) => {
    const raw = piece?.url || "";
    if (!raw) {
      alert("Fichier introuvable (url vide).");
      return;
    }

    const safe = String(raw).replace(/\\/g, "/");
    const fullUrl = `${API_BASE}/${safe.startsWith("/") ? safe.slice(1) : safe}`;

    setPreview({
      url: encodeURI(fullUrl),
      name: piece.fileName || piece.name || "Document",
    });
  };

  const closePreview = () => setPreview(null);

  const setPieceComment = (id, comment) => {
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, comment } : p)));
  };

  const setPieceStatus = async (id, status) => {
    // commentaire récupéré AVANT les setState (évite “stale state”)
    const current = pieces.find((p) => p.id === id);
    const comment = (current?.comment || "").trim();

    // 🔥 Si rejet => commentaire obligatoire
    if (status === "reject" && comment.length < 5) {
      alert("Motif obligatoire (au moins 5 caractères) pour rejeter une pièce.");
      return;
    }

    // ✅ Update UI immédiat
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    setPieceBusy(id);

    try {
      await validerPiece(id, status === "valid" ? "VALIDEE" : "REJETEE", comment);
    } catch (e) {
      console.error(e);
      // ❌ Revert si erreur API
      setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, status: null } : p)));
      alert("Échec validation. Vérifie l’API / endpoint.");
    } finally {
      setPieceBusy(null);
    }
  };

  const allValidated = useMemo(() => pieces.every((p) => p.status === "valid"), [pieces]);
  const anyRejected = useMemo(() => pieces.some((p) => p.status === "reject"), [pieces]);
  const allDecided = useMemo(() => pieces.every((p) => p.status !== null), [pieces]);

  const handleGenerate = async () => {
    if (!selected?.id) return;

    try {
      setGenBusy(true);
      await avancerDemande(selected.id, "GENERER_DOCUMENT");
      await Promise.all([chargerDemandes(), chargerStats()]);
      setModal(null);
      setView("dashboard");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erreur lors de la génération");
    } finally {
      setGenBusy(false);
    }
  };

  const handleReject = async () => {
    if (!selected?.id) return;

    if (motif.trim().length < 20) {
      setMotifError("Le motif doit contenir au moins 20 caractères.");
      return;
    }

    try {
      setGenBusy(true);
      await avancerDemande(selected.id, "REJETER", motif);
      await Promise.all([chargerDemandes(), chargerStats()]);
      setModal(null);
      setView("dashboard");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Erreur lors du rejet");
    } finally {
      setGenBusy(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("etudocs_token");
      localStorage.removeItem("token");
      localStorage.removeItem("etudocs_user");
    } catch {}
    window.location.href = "/login";
  };

  // ── DASHBOARD ─────────────────────────────────────────────
  if (view === "dashboard")
    return (
      <>
        <style>{styles}</style>
        <div className="layout">
          <Sidebar onLogout={logout} />
          <main className="main">
            <Topbar title="Chef de Division des Examens — IFRI" name="Serge DOSSOU" initials="SD" />
            <div className="content">
              <div className="page-header">
                <div>
                  <h1 className="page-title">Tableau de bord — Division des Examens</h1>
                  <p className="page-subtitle">Vérifiez et validez les dossiers de relevés de notes.</p>
                </div>
                <button
                  className="actualiser-btn"
                  onClick={() => {
                    chargerDemandes();
                    chargerStats();
                  }}
                >
                  Actualiser
                </button>
              </div>

              {/* Stats */}
              <div className="stats-grid">
                {[
                  { icon: <ClockIcon />, cls: "pending", val: stats.aTraiter, label: "À traiter" },
                  { icon: <ClipboardCheckIcon />, cls: "process", val: stats.enTraitement, label: "En traitement" },
                  { icon: <CheckCircleIcon />, cls: "done", val: stats.generes, label: "Générés (mois)" },
                  { icon: <AlertCircleIcon />, cls: "refused", val: stats.rejetees, label: "Rejetées" },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
                    <div>
                      <div className="stat-value">{s.val}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">
                    Demandes en attente de traitement
                    <span className="badge-count">{demandes.length}</span>
                  </div>
                  <div className="search-box">
                    <span className="search-icon-wrap">
                      <SearchIcon />
                    </span>
                    <input
                      className="search-input"
                      placeholder="Rechercher..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="table-divider" />
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Étudiant</th>
                        <th>Document</th>
                        <th>Date soumission</th>
                        <th>Délai écoulé</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandes
                        .filter((d) => {
                          const q = (search ?? "").trim().toLowerCase();
                          if (!q) return true;

                          const etu = String(d?.etudiant ?? "").toLowerCase();
                          const ref = String(d?.ref ?? "").toLowerCase();
                          const fil = String(d?.filiere ?? "").toLowerCase();
                          const num = String(d?.num ?? "").toLowerCase();

                          return etu.includes(q) || ref.includes(q) || fil.includes(q) || num.includes(q);
                        })
                        .map((d) => (
                          <tr key={d.id ?? d.ref}>
                            <td>
                              <span className="td-ref">{d.ref}</span>
                            </td>
                            <td>
                              <div className="td-student">{d.etudiant}</div>
                              <div className="td-sub">
                                N° {d.num} — {d.filiere}
                              </div>
                            </td>
                            <td style={{ fontSize: 13 }}>{d.type}</td>
                            <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                              {d.date || (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-")}
                            </td>
                            <td>
                              <span className={`td-delay ${d.urgent ? "urgent" : "ok"}`}>
                                {d.delai} {d.urgent && "⚠"}
                              </span>
                            </td>
                            <td>{statutBadge(d.statut)}</td>
                            <td>
                              <button className="btn-action primary" onClick={() => openTraitement(d)}>
                                <EyeIcon /> Traiter le dossier
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );

  // ── SUCCESS STATE ──────────────────────────────────────────
  if (view === "success")
    return (
      <>
        <style>{styles}</style>
        <div className="layout">
          <Sidebar onLogout={logout} />
          <main className="main">
            <Topbar title="Chef de Division des Examens — IFRI" name="Serge DOSSOU" initials="SD" />
            <div className="content" style={{ maxWidth: 640, margin: "60px auto" }}>
              <div className="success-card">
                <div className="success-icon">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="success-title">Document généré avec succès !</div>
                <div className="success-sub">
                  Le relevé de notes a été généré automatiquement depuis les données académiques de l'étudiant.
                </div>
                <div className="success-ref-box">
                  <div className="success-ref-label">Référence générée</div>
                  <div className="success-ref">{generatedRef}</div>
                </div>
                <div className="success-note">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Le Directeur Adjoint a été notifié pour approbation.
                </div>
                <div className="success-actions">
                  <button
                    className="btn-action outline"
                    style={{ padding: "10px 24px", fontSize: 14 }}
                    onClick={() => setView("dashboard")}
                  >
                    <ArrowLeftIcon /> Retour au tableau de bord
                  </button>
                  <button className="btn-action primary" style={{ padding: "10px 24px", fontSize: 14 }}>
                    <EyeIcon /> Aperçu du document
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );

  // ── TRAITEMENT ─────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="layout">
        <Sidebar onLogout={logout} />
        <main className="main">
          <Topbar title="Chef de Division des Examens — IFRI" name="Serge DOSSOU" initials="SD" />
          <div className="content">
            {/* Back + header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
              <button
                className="btn-action outline"
                onClick={() => {
                  setView("dashboard");
                  setSelected(null);
                  setPieces(defaultPieces);
                  setModal(null);
                  setPreview(null);
                }}
                style={{ padding: "8px 14px" }}
              >
                <ArrowLeftIcon /> Retour
              </button>
              <div>
                <h1 className="page-title" style={{ fontSize: 22 }}>
                  Traitement du dossier
                </h1>
                <span className="td-ref" style={{ fontSize: 13 }}>
                  {selected?.ref}
                </span>
              </div>
            </div>

            <div className="traitement-layout">
              {/* ── PANNEAU GAUCHE — Infos étudiant ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Informations étudiant</div>
                  </div>
                  <div className="panel-body">
                    <div className="info-row">
                      <div className="info-label">Nom complet</div>
                      <div className="info-value">{selected?.etudiant}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">N° Étudiant</div>
                      <div className="info-value">{selected?.num}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Filière / Niveau</div>
                      <div className="info-value">{selected?.filiere}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Institution</div>
                      <div className="info-value">IFRI — UAC</div>
                    </div>
                    <div className="divider-h" />
                    <div className="info-row">
                      <div className="info-label">Type de document</div>
                      <div className="doc-type-pill">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        Relevé de notes
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Semestre</div>
                      <div className="sem-pills">
                        <span
                          className={`sem-pill ${
                            String(selected?.type ?? "").includes("S2") ? "inactive" : "active"
                          }`}
                        >
                          Semestre 1
                        </span>
                        <span
                          className={`sem-pill ${
                            String(selected?.type ?? "").includes("S2") ? "active" : "inactive"
                          }`}
                        >
                          Semestre 2
                        </span>
                      </div>
                    </div>
                    <div className="divider-h" />
                    <div className="info-row">
                      <div className="info-label">Date de soumission</div>
                      <div className="info-value">{selected?.date}</div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Référence</div>
                      <div className="info-value mono">{selected?.ref}</div>
                    </div>
                  </div>
                </div>

                {/* Timeline (actuellement statique, mais propre) */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Parcours de la demande</div>
                  </div>
                  <div className="panel-body">
                    <div className="timeline">
                      {[
                        { label: "Soumise par l'étudiant", time: "—", st: "done" },
                        { label: "Reçue — Secrétaire Adjoint", time: "—", st: "done" },
                        { label: "Transmise — Secrétaire Général", time: "—", st: "done" },
                        { label: "En traitement — Chef de Division", time: "En cours", st: "active" },
                        { label: "En attente de signature — Dir. Adj.", time: "—", st: "todo" },
                        { label: "Signature finale — Directeur", time: "—", st: "todo" },
                      ].map((t, i, arr) => (
                        <div className="tl-item" key={t.label}>
                          <div className="tl-left">
                            <div className={`tl-dot ${t.st}`} />
                            {i < arr.length - 1 && <div className="tl-line" />}
                          </div>
                          <div className="tl-text">
                            <div className={`tl-step ${t.st === "todo" ? "muted" : ""}`}>{t.label}</div>
                            <div className="tl-time">{t.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CENTRE — Visionneuse pièces ── */}
              <div>
                <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--navy)" }}>
                    Vérification des pièces justificatives
                  </div>
                  <span className="badge blue">
                    {pieces.filter((p) => p.status === "valid").length}/{pieces.length} pièces validées
                  </span>
                </div>

                {pieces.map((piece) => (
                  <div className="piece-card" key={piece.id}>
                    <div className="piece-header">
                      <div className="piece-name">
                        <FileIcon />
                        {piece.name}
                        <span className="piece-num">{piece.num || ""}</span>
                      </div>
                      {piece.status === "valid" && (
                        <span className="badge green">
                          <CheckIcon /> Validée
                        </span>
                      )}
                      {piece.status === "reject" && (
                        <span className="badge red">
                          <XIcon /> Rejetée
                        </span>
                      )}
                      {piece.status === null && <span className="badge gray">En attente de décision</span>}
                    </div>

                    <div className="piece-preview">
                      <div className="piece-preview-inner">
                        <FileIcon />
                        <span>Aperçu du document</span>
                        <span style={{ fontSize: 11 }}>JPG / PDF</span>
                      </div>
                    </div>

                    <div className="piece-footer">
                      <button
                        className="btn-action outline"
                        onClick={() => openPreview(piece)}
                        style={{ width: "100%", marginBottom: 10, justifyContent: "center" }}
                      >
                        <EyeIcon /> Consulter
                      </button>

                      <div className="piece-actions">
                        <button
                          disabled={pieceBusy === piece.id}
                          className={`btn-valider valid ${piece.status === "valid" ? "selected" : ""}`}
                          onClick={() => setPieceStatus(piece.id, "valid")}
                        >
                          <CheckIcon /> Valider ✓
                        </button>

                        <button
                          disabled={pieceBusy === piece.id}
                          className={`btn-valider reject ${piece.status === "reject" ? "selected" : ""}`}
                          onClick={() => setPieceStatus(piece.id, "reject")}
                        >
                          <XIcon /> Rejeter ✗
                        </button>
                      </div>

                      <textarea
                        className="piece-comment-area"
                        rows={2}
                        placeholder={
                          piece.status === "reject"
                            ? "Motif du rejet de cette pièce (obligatoire)..."
                            : "Commentaire optionnel sur cette pièce..."
                        }
                        value={piece.comment || ""}
                        onChange={(e) => setPieceComment(piece.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                {allValidated && (
                  <div className="info-box green" style={{ marginTop: 8 }}>
                    <strong>✓ Toutes les pièces sont validées.</strong> Vous pouvez déclencher la génération automatique du document.
                  </div>
                )}

                {anyRejected && !allValidated && (
                  <div
                    className="info-box"
                    style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5", marginTop: 8 }}
                  >
                    <strong>⚠ Une ou plusieurs pièces ont été rejetées.</strong> Vous devrez rejeter la demande avec un motif explicatif.
                  </div>
                )}
              </div>

              {/* ── PANNEAU DROIT — Checklist + Actions ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Récapitulatif de validation</div>
                  </div>
                  <div className="panel-body">
                    <div className="checklist">
                      {pieces.map((p) => (
                        <div
                          key={p.id}
                          className={`check-item ${
                            p.status === "valid"
                              ? "valid-state"
                              : p.status === "reject"
                              ? "reject-state"
                              : "pending-state"
                          }`}
                        >
                          <div className="check-name">{p.name || (p.id === "cip" ? "CIP" : "Quittance")}</div>
                          <div
                            className={`check-status ${
                              p.status === "valid" ? "v" : p.status === "reject" ? "r" : "p"
                            }`}
                          >
                            {p.status === "valid" ? (
                              <>
                                <CheckIcon /> Validée
                              </>
                            ) : p.status === "reject" ? (
                              <>
                                <XIcon /> Rejetée
                              </>
                            ) : (
                              "— En attente"
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="divider-h" />
                    <div className="comment-global-label">Commentaire général</div>
                    <textarea
                      className="piece-comment-area"
                      rows={3}
                      placeholder="Commentaire général sur ce dossier (optionnel)..."
                      value={globalComment}
                      onChange={(e) => setGlobalComment(e.target.value)}
                    />
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Actions disponibles</div>
                  </div>
                  <div className="panel-body">
                    <button className="btn-main generate" disabled={!allValidated} onClick={() => setModal("generate")}>
                      <SparkleIcon /> Valider et générer le document
                    </button>

                    <button
                      className="btn-main reject-all"
                      style={{
                        opacity: !allDecided || !anyRejected ? 0.4 : 1,
                        cursor: !allDecided || !anyRejected ? "not-allowed" : "pointer",
                      }}
                      onClick={() => {
                        if (allDecided && anyRejected) setModal("reject");
                      }}
                    >
                      <XIcon /> Rejeter la demande
                    </button>

                    {!allDecided && (
                      <div className="info-box blue" style={{ marginTop: 4 }}>
                        Validez ou rejetez chaque pièce avant de pouvoir prendre une décision finale.
                      </div>
                    )}
                    {allValidated && (
                      <div className="info-box green" style={{ marginTop: 4 }}>
                        La génération injectera automatiquement les notes et UE depuis la base de données académique.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL GÉNÉRATION ── */}
      {modal === "generate" && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">
              <SparkleIcon /> Confirmer la génération
            </div>
            <div className="modal-body">
              Vous allez déclencher la génération automatique du relevé de notes pour{" "}
              <strong>{selected?.etudiant}</strong> (<span className="modal-ref">{selected?.ref}</span>).
              <br />
              <br />
              Le système va automatiquement récupérer les données académiques (notes, UE, crédits, résultats) et les injecter
              dans le template officiel de l'IFRI. <strong>Cette action est irréversible.</strong>
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModal(null)} disabled={genBusy}>
                Annuler
              </button>
              <button className="modal-btn confirm-gen" onClick={handleGenerate} disabled={genBusy}>
                {genBusy ? "Génération en cours..." : "✓ Confirmer la génération"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL REJET ── */}
      {modal === "reject" && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">
              <XIcon /> Rejeter la demande
            </div>
            <div className="modal-body">
              Vous allez rejeter la demande <span className="modal-ref">{selected?.ref}</span> de{" "}
              <strong>{selected?.etudiant}</strong>.
              <br />
              L'étudiant sera notifié par email avec le motif de rejet.
            </div>
            <div className="comment-global-label">
              Motif de rejet <span style={{ color: "var(--danger)" }}>*</span>
            </div>
            <textarea
              className="motif-input"
              rows={4}
              placeholder="Expliquez précisément la raison du rejet (minimum 20 caractères)..."
              value={motif}
              onChange={(e) => {
                setMotif(e.target.value);
                setMotifError("");
              }}
            />
            <div className="motif-count">{motif.length} / 20 caractères minimum</div>
            {motifError && <div className="motif-error">{motifError}</div>}
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button
                className="modal-btn cancel"
                onClick={() => {
                  setModal(null);
                  setMotif("");
                  setMotifError("");
                }}
                disabled={genBusy}
              >
                Annuler
              </button>
              <button className="modal-btn confirm-rej" onClick={handleReject} disabled={genBusy}>
                {genBusy ? "Traitement..." : "✗ Confirmer le rejet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ PREVIEW (CONSULTER) */}
      {preview && (
        <div className="modal-overlay" onClick={closePreview}>
          <div
            className="modal"
            style={{ width: "900px", maxWidth: "95vw", height: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title">
              <EyeIcon /> {preview.name}
            </div>

            <div
              style={{
                height: "calc(85vh - 90px)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <iframe title="preview" src={preview.url} style={{ width: "100%", height: "100%", border: "none" }} />
            </div>

            <div className="modal-actions" style={{ marginTop: 14 }}>
              <button className="modal-btn cancel" onClick={closePreview}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Composants partagés ────────────────────────────────────
function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">
          EtuDocs <span>Agent</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <button className="nav-item active" type="button">
          <span className="nav-icon">
            <GridIcon />
          </span>
          Tableau de bord
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" type="button" onClick={onLogout}>
          <LogoutIcon />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, name, initials }) {
  return (
    <header className="topbar">
      <div className="breadcrumb">{title}</div>
      <div className="topbar-right">
        <button className="notif-btn" type="button" aria-label="Notifications">
          <BellIcon />
          <span className="notif-dot" />
        </button>
        <div className="user-info">
          <div className="user-name">{name}</div>
          <div className="user-org">IFRI</div>
        </div>
        <div className="avatar">{initials}</div>
      </div>
    </header>
  );
}