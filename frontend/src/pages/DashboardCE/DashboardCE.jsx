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
  .main { margin-left: 240px; flex: 1; display: flex; flex-direction: column; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-width);
    background: #ffffff;
    border-right: 1px solid #e2e8f0;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 100;
  }
  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 22px 20px 28px;
    font-family: 'Sora', sans-serif; font-weight: 800; font-size: 1.15rem;
    color: var(--navy); text-decoration: none; border-bottom: 1px solid #f1f5f9;
  }
  .sidebar-logo__icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--navy);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .logo-text { font-size: 22px; font-weight: 700; color: var(--navy); letter-spacing: -0.5px; }
  .logo-text span { color: var(--accent-gold); font-weight: 400; font-size: 14px; margin-left: 6px; }
  .sidebar-nav { flex: 1; padding: 14px 12px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px; cursor: pointer;
    transition: all 0.2s; font-size: .9rem; font-weight: 500;
    color: #475569; margin-bottom: 3px;
    border: none; background: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: #f1f5f9; color: var(--navy); }
  .nav-item.active {
    background: var(--navy); color: #ffffff;
    font-weight: 700; box-shadow: 0 4px 14px rgba(26,47,94,0.18);
  }
  .nav-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid #f1f5f9; }
  .logout-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 8px; cursor: pointer;
    color: #ef4444; font-size: .88rem; font-weight: 500;
    transition: background 0.2s; border: none; background: none; width: 100%;
  }
  .logout-btn:hover { background: #fef2f2; }

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

  /* ── STATS ── */
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

  .sem-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
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

  /* ── MODAL générique ── */
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

  .motif-input { width: 100%; padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--text); resize: none; outline: none; transition: border-color 0.2s; margin-top: 8px; }
  .motif-input:focus { border-color: var(--danger); }
  .motif-count { font-size: 11px; color: var(--text-muted); text-align: right; margin-top: 4px; }
  .motif-error { font-size: 12px; color: var(--danger); margin-top: 4px; }

  /* ── MODAL MOT DE PASSE ── */
  .pwd-modal-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,.5);
    z-index: 300; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(3px); padding: 16px;
  }
  .pwd-modal {
    background: #fff; border-radius: 16px; width: 100%; max-width: 420px;
    box-shadow: 0 24px 60px rgba(0,0,0,.18); overflow: hidden;
  }
  .pwd-modal__head {
    padding: 22px 26px 18px; border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .pwd-modal__title {
    font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 1.05rem; color: var(--navy);
    display: flex; align-items: center; gap: 10px;
  }
  .pwd-modal__title-icon {
    width: 36px; height: 36px; border-radius: 10px; background: #eff6ff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .pwd-modal__close {
    background: none; border: none; cursor: pointer; color: #94a3b8;
    font-size: 1.3rem; line-height: 1; padding: 2px; flex-shrink: 0; transition: color .15s;
  }
  .pwd-modal__close:hover { color: var(--navy); }
  .pwd-modal__body { padding: 20px 26px; display: flex; flex-direction: column; gap: 14px; }
  .pwd-field { display: flex; flex-direction: column; gap: 6px; }
  .pwd-label { font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .04em; }
  .pwd-input-wrap { position: relative; }
  .pwd-input {
    width: 100%; padding: 11px 42px 11px 14px;
    border: 1.5px solid #e2e8f0; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; color: #334155;
    outline: none; transition: border-color .2s; box-sizing: border-box;
  }
  .pwd-input:focus { border-color: var(--navy); }
  .pwd-input.error { border-color: var(--danger); }
  .pwd-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #94a3b8;
    display: flex; align-items: center; padding: 0; transition: color .15s;
  }
  .pwd-eye:hover { color: var(--navy); }
  .pwd-strength { display: flex; gap: 4px; margin-top: 4px; }
  .pwd-strength__bar { flex: 1; height: 3px; border-radius: 2px; background: #e2e8f0; transition: background .3s; }
  .pwd-strength__bar.weak   { background: #ef4444; }
  .pwd-strength__bar.medium { background: #f5a623; }
  .pwd-strength__bar.strong { background: #10b981; }
  .pwd-hint { font-size: .75rem; color: #94a3b8; margin-top: 2px; }
  .pwd-hint.error { color: #ef4444; }
  .pwd-modal__footer { padding: 0 26px 22px; }
  .pwd-btn-row { display: flex; gap: 10px; }
  .pwd-btn {
    flex: 1; padding: 11px 16px; border-radius: 9px; border: none;
    font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: .88rem;
    cursor: pointer; transition: all .2s; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  }
  .pwd-btn:disabled { opacity: .55; cursor: not-allowed; }
  .pwd-btn--ghost { background: #f8fafc; color: #475569; border: 1.5px solid #e2e8f0; }
  .pwd-btn--ghost:hover:not(:disabled) { border-color: var(--navy); color: var(--navy); }
  .pwd-btn--primary { background: var(--navy); color: #fff; }
  .pwd-btn--primary:hover:not(:disabled) { background: var(--accent-blue); }

  /* Toast */
  .sa-toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 400;
    background: var(--navy); color: #fff;
    padding: 13px 20px; border-radius: 11px;
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 500;
    box-shadow: 0 8px 30px rgba(0,0,0,.2);
    animation: sa-toast-in .2s ease;
  }
  .sa-toast--error { background: var(--danger); }
  @keyframes sa-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
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
const LockIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

// ── Icône œil toggle (distincte de EyeIcon) ────────────────
function EyeToggleIcon({ show }) {
  return (
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
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

const statutBadge = (s) => {
  if (s === "process")
    return <span className="badge purple">En traitement</span>;
  if (s === "done") return <span className="badge green">Document généré</span>;
  if (s === "refused") return <span className="badge red">Rejetée</span>;
  return <span className="badge gray">En attente</span>;
};

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

/* ─── Indicateur robustesse ───────────────────────────── */
function getStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

/* ─── Modal Modifier Mot de Passe (version complète) ─── */
function ModalMotDePasse({ onClose, onSuccess }) {
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmer, setConfirmer] = useState("");
  const [showActuel, setShowActuel] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);
  const [showConfirmer, setShowConfirmer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const strength = getStrength(nouveau);
  const strengthLabel = ["", "Faible", "Faible", "Moyen", "Fort"][strength];
  const strengthClass =
    strength <= 2 ? "weak" : strength === 3 ? "medium" : "strong";

  const handleSubmit = async () => {
    setErreur("");
    if (!actuel || !nouveau || !confirmer) {
      setErreur("Tous les champs sont obligatoires.");
      return;
    }
    if (nouveau.length < 8) {
      setErreur("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (nouveau !== confirmer) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ancienMotDePasse: actuel,
          nouveauMotDePasse: nouveau,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Mot de passe actuel incorrect.");
      }
      onSuccess("Mot de passe modifié avec succès ✓");
      onClose();
    } catch (e) {
      setErreur(e?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pwd-modal-overlay" onClick={onClose}>
      <div className="pwd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pwd-modal__head">
          <div className="pwd-modal__title">
            <div className="pwd-modal__title-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            Modifier le mot de passe
          </div>
          <button className="pwd-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pwd-modal__body">
          {/* Mot de passe actuel */}
          <div className="pwd-field">
            <label className="pwd-label">Mot de passe actuel</label>
            <div className="pwd-input-wrap">
              <input
                type={showActuel ? "text" : "password"}
                className="pwd-input"
                placeholder="••••••••"
                value={actuel}
                onChange={(e) => setActuel(e.target.value)}
                autoFocus
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowActuel((v) => !v)}
              >
                <EyeToggleIcon show={showActuel} />
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div className="pwd-field">
            <label className="pwd-label">Nouveau mot de passe</label>
            <div className="pwd-input-wrap">
              <input
                type={showNouveau ? "text" : "password"}
                className="pwd-input"
                placeholder="••••••••"
                value={nouveau}
                onChange={(e) => setNouveau(e.target.value)}
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowNouveau((v) => !v)}
              >
                <EyeToggleIcon show={showNouveau} />
              </button>
            </div>
            {nouveau && (
              <>
                <div className="pwd-strength">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`pwd-strength__bar ${
                        strength >= i ? strengthClass : ""
                      }`}
                    />
                  ))}
                </div>
                <div className="pwd-hint">
                  {strengthLabel} — minimum 8 caractères
                </div>
              </>
            )}
          </div>

          {/* Confirmer */}
          <div className="pwd-field">
            <label className="pwd-label">
              Confirmer le nouveau mot de passe
            </label>
            <div className="pwd-input-wrap">
              <input
                type={showConfirmer ? "text" : "password"}
                className={`pwd-input ${
                  confirmer && confirmer !== nouveau ? "error" : ""
                }`}
                placeholder="••••••••"
                value={confirmer}
                onChange={(e) => setConfirmer(e.target.value)}
              />
              <button
                className="pwd-eye"
                type="button"
                onClick={() => setShowConfirmer((v) => !v)}
              >
                <EyeToggleIcon show={showConfirmer} />
              </button>
            </div>
            {confirmer && confirmer !== nouveau && (
              <div className="pwd-hint error">
                Les mots de passe ne correspondent pas
              </div>
            )}
          </div>

          {erreur && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: ".85rem",
                color: "#dc2626",
              }}
            >
              {erreur}
            </div>
          )}
        </div>

        <div className="pwd-modal__footer">
          <div className="pwd-btn-row">
            <button
              className="pwd-btn pwd-btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              className="pwd-btn pwd-btn--primary"
              onClick={handleSubmit}
              disabled={loading || !actuel || !nouveau || !confirmer}
            >
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ────────────────────────────────────
export default function ChefDivisionExamens() {
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [pieces, setPieces] = useState(defaultPieces);
  const [globalComment, setGlobalComment] = useState("");
  const [modal, setModal] = useState(null);
  const [motif, setMotif] = useState("");
  const [motifError, setMotifError] = useState("");
  const [generatedRef, setGeneratedRef] = useState("");
  const [pieceBusy, setPieceBusy] = useState(null);
  const [preview, setPreview] = useState(null);
  const [genBusy, setGenBusy] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState({
    aTraiter: 0,
    enTraitement: 0,
    generes: 0,
    rejetees: 0,
  });

  // État modal mot de passe + toast
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    chargerDemandes();
    chargerStats();
  }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const chargerDemandes = async () => {
    try {
      const data = await getDemandes();
      setDemandes(Array.isArray(data) ? data : data?.demandes ?? []);
    } catch (e) {
      console.error(e);
      setDemandes([]);
    }
  };

  const chargerStats = async () => {
    try {
      const data = await getChefDivisionStats();
      setStats(
        data ?? { aTraiter: 0, enTraitement: 0, generes: 0, rejetees: 0 }
      );
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
        name: p.typePiece,
        fileName: p.nom,
        url: p.url,
        num: `Pièce ${idx + 1}/${(full?.pieces || []).length || 1}`,
        status:
          p.statut === "VALIDEE"
            ? "valid"
            : p.statut === "REJETEE"
            ? "reject"
            : null,
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
      alert("Impossible d'ouvrir le dossier.");
    }
  };

  const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
    (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) ||
    "http://localhost:5000";

  const openPreview = (piece) => {
    const raw = piece?.url || "";
    if (!raw) {
      alert("Fichier introuvable.");
      return;
    }
    const safe = String(raw).replace(/\\/g, "/");
    const fullUrl = `${API_BASE}/${
      safe.startsWith("/") ? safe.slice(1) : safe
    }`;
    setPreview({
      url: encodeURI(fullUrl),
      name: piece.fileName || piece.name || "Document",
    });
  };

  const setPieceComment = (id, comment) =>
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, comment } : p)));

  const setPieceStatus = async (id, status) => {
    const current = pieces.find((p) => p.id === id);
    const comment = (current?.comment || "").trim();
    if (status === "reject" && comment.length < 5) {
      alert("Motif obligatoire (min 5 caractères) pour rejeter une pièce.");
      return;
    }
    setPieces((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    setPieceBusy(id);
    try {
      await validerPiece(
        id,
        status === "valid" ? "VALIDEE" : "REJETEE",
        comment
      );
    } catch (e) {
      console.error(e);
      setPieces((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: null } : p))
      );
      alert("Échec validation pièce.");
    } finally {
      setPieceBusy(null);
    }
  };

  const allValidated = useMemo(
    () => pieces.every((p) => p.status === "valid"),
    [pieces]
  );
  const anyRejected = useMemo(
    () => pieces.some((p) => p.status === "reject"),
    [pieces]
  );
  const allDecided = useMemo(
    () => pieces.every((p) => p.status !== null),
    [pieces]
  );

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

  // ── Fragment commun overlays ─────────────────────────────
  const sharedOverlays = (
    <>
      {toast && (
        <div className={`sa-toast${toast.isError ? " sa-toast--error" : ""}`}>
          {toast.msg}
        </div>
      )}
      {showPwd && (
        <ModalMotDePasse
          onClose={() => setShowPwd(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      )}
    </>
  );

  // ── DASHBOARD ────────────────────────────────────────────
  if (view === "dashboard")
    return (
      <>
        <style>{styles}</style>
        {sharedOverlays}
        <div className="layout">
          <Sidebar onLogout={logout} onChangePwd={() => setShowPwd(true)} />
          <main className="main">
            <Topbar
              title="Chef de Division des Examens — IFRI"
              name="Serge DOSSOU"
              initials="SD"
            />
            <div className="content">
              <div className="page-header">
                <div>
                  <h1 className="page-title">
                    Tableau de bord — Division des Examens
                  </h1>
                  <p className="page-subtitle">
                    Vérifiez et validez les dossiers de relevés de notes.
                  </p>
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

              <div className="stats-grid">
                {[
                  {
                    icon: <ClockIcon />,
                    cls: "pending",
                    val: stats.aTraiter,
                    label: "À traiter",
                  },
                  {
                    icon: <ClipboardCheckIcon />,
                    cls: "process",
                    val: stats.enTraitement,
                    label: "En traitement",
                  },
                  {
                    icon: <CheckCircleIcon />,
                    cls: "done",
                    val: stats.generes,
                    label: "Générés (mois)",
                  },
                  {
                    icon: <AlertCircleIcon />,
                    cls: "refused",
                    val: stats.rejetees,
                    label: "Rejetées",
                  },
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
                          const nom = `${d?.utilisateur?.nom ?? ""} ${
                            d?.utilisateur?.prenom ?? ""
                          }`.toLowerCase();
                          const ref = String(d?.ref ?? "").toLowerCase();
                          return nom.includes(q) || ref.includes(q);
                        })
                        .map((d) => {
                          const nom =
                            `${d.utilisateur?.nom || ""} ${
                              d.utilisateur?.prenom || ""
                            }`.trim() || "—";
                          const num = d.utilisateur?.numeroEtudiant || "—";
                          const ref =
                            d.document?.reference ||
                            (d.id || "")
                              .toString()
                              .substring(0, 8)
                              .toUpperCase() ||
                            "—";
                          const type =
                            d.typeDocument === "RELEVE_NOTES"
                              ? "Relevé de notes"
                              : d.typeDocument === "ATTESTATION_INSCRIPTION"
                              ? "Attestation d'inscription"
                              : d.typeDocument || "—";
                          const date = d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "—";
                          const h = d.createdAt
                            ? Math.floor(
                                (Date.now() - new Date(d.createdAt)) / 3600000
                              )
                            : 0;
                          const delai =
                            h < 24 ? `${h}h` : `${Math.floor(h / 24)} j`;
                          const urgent = h >= 48;
                          return (
                            <tr key={d.id ?? ref}>
                              <td>
                                <span className="td-ref">{ref}</span>
                              </td>
                              <td>
                                <div className="td-student">{nom}</div>
                                <div className="td-sub">N° {num}</div>
                              </td>
                              <td style={{ fontSize: 13 }}>{type}</td>
                              <td
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-muted)",
                                }}
                              >
                                {date}
                              </td>
                              <td>
                                <span
                                  className={`td-delay ${
                                    urgent ? "urgent" : "ok"
                                  }`}
                                >
                                  {delai} {urgent && "⚠"}
                                </span>
                              </td>
                              <td>{statutBadge(d.statut)}</td>
                              <td>
                                <button
                                  className="btn-action primary"
                                  onClick={() => openTraitement(d)}
                                >
                                  <EyeIcon /> Traiter le dossier
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );

  // ── SUCCESS ──────────────────────────────────────────────
  if (view === "success")
    return (
      <>
        <style>{styles}</style>
        {sharedOverlays}
        <div className="layout">
          <Sidebar onLogout={logout} onChangePwd={() => setShowPwd(true)} />
          <main className="main">
            <Topbar
              title="Chef de Division des Examens — IFRI"
              name="Serge DOSSOU"
              initials="SD"
            />
            <div
              className="content"
              style={{ maxWidth: 640, margin: "60px auto" }}
            >
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
                <div className="success-title">
                  Document généré avec succès !
                </div>
                <div className="success-sub">
                  Le relevé de notes a été généré automatiquement depuis les
                  données académiques de l'étudiant.
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
                  <button
                    className="btn-action primary"
                    style={{ padding: "10px 24px", fontSize: 14 }}
                  >
                    <EyeIcon /> Aperçu du document
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );

  // ── TRAITEMENT ───────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      {sharedOverlays}
      <div className="layout">
        <Sidebar onLogout={logout} onChangePwd={() => setShowPwd(true)} />
        <main className="main">
          <Topbar
            title="Chef de Division des Examens — IFRI"
            name="Serge DOSSOU"
            initials="SD"
          />
          <div className="content">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 28,
              }}
            >
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
                  {selected?.id?.substring(0, 8).toUpperCase() || "—"}
                </span>
              </div>
            </div>

            <div className="traitement-layout">
              {/* ── GAUCHE — Infos ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Informations étudiant</div>
                  </div>
                  <div className="panel-body">
                    <div className="info-row">
                      <div className="info-label">Nom complet</div>
                      <div className="info-value">
                        {selected?.utilisateur
                          ? `${selected.utilisateur.nom || ""} ${
                              selected.utilisateur.prenom || ""
                            }`.trim() || "—"
                          : "—"}
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">N° Étudiant</div>
                      <div className="info-value">
                        {selected?.utilisateur?.numeroEtudiant || "—"}
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Filière / Niveau</div>
                      <div className="info-value">
                        {selected?.utilisateur?.filiere
                          ? `${selected.utilisateur.filiere} — ${
                              selected.utilisateur.niveau || ""
                            }`
                          : "—"}
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Institution</div>
                      <div className="info-value">
                        {selected?.institution?.nom || "IFRI — UAC"}
                      </div>
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
                        {selected?.typeDocument === "RELEVE_NOTES"
                          ? "Relevé de notes"
                          : selected?.typeDocument === "ATTESTATION_INSCRIPTION"
                          ? "Attestation d'inscription"
                          : selected?.typeDocument || "—"}
                      </div>
                    </div>
                    {selected?.typeDocument === "RELEVE_NOTES" && (
                      <div className="info-row">
                        <div className="info-label">Semestre</div>
                        <div className="sem-pills">
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <span
                              key={n}
                              className={`sem-pill ${
                                (selected?.semestres || []).includes(n)
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              S{n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="divider-h" />
                    <div className="info-row">
                      <div className="info-label">Date de soumission</div>
                      <div className="info-value">
                        {selected?.createdAt
                          ? new Date(selected.createdAt).toLocaleDateString(
                              "fr-FR",
                              { day: "2-digit", month: "long", year: "numeric" }
                            )
                          : "—"}
                      </div>
                    </div>
                    <div className="info-row">
                      <div className="info-label">Référence</div>
                      <div className="info-value mono">
                        {selected?.documents?.[0]?.reference || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CENTRE — Pièces ── */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: ".95rem",
                      color: "var(--navy)",
                    }}
                  >
                    Vérification des pièces justificatives
                  </div>
                  <span className="badge blue">
                    {pieces.filter((p) => p.status === "valid").length}/
                    {pieces.length} pièces validées
                  </span>
                </div>

                {pieces.map((piece) => (
                  <div className="piece-card" key={piece.id}>
                    <div className="piece-header">
                      <div className="piece-name">
                        <FileIcon />
                        {piece.name}
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
                      {piece.status === null && (
                        <span className="badge gray">En attente</span>
                      )}
                    </div>
                    <div className="piece-footer">
                      <button
                        className="btn-action outline"
                        onClick={() => openPreview(piece)}
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          marginBottom: 10,
                        }}
                        type="button"
                      >
                        <EyeIcon /> Consulter le fichier
                      </button>
                      <div className="piece-actions">
                        <button
                          disabled={pieceBusy === piece.id}
                          className={`btn-valider valid ${
                            piece.status === "valid" ? "selected" : ""
                          }`}
                          onClick={() => setPieceStatus(piece.id, "valid")}
                          type="button"
                        >
                          <CheckIcon /> Valider ✓
                        </button>
                        <button
                          disabled={pieceBusy === piece.id}
                          className={`btn-valider reject ${
                            piece.status === "reject" ? "selected" : ""
                          }`}
                          onClick={() => setPieceStatus(piece.id, "reject")}
                          type="button"
                        >
                          <XIcon /> Rejeter ✗
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {allValidated && (
                  <div className="info-box green" style={{ marginTop: 8 }}>
                    <strong>✓ Toutes les pièces sont validées.</strong> Vous
                    pouvez déclencher la génération.
                  </div>
                )}
                {anyRejected && !allValidated && (
                  <div
                    className="info-box"
                    style={{
                      background: "#fef2f2",
                      color: "#991b1b",
                      border: "1px solid #fca5a5",
                      marginTop: 8,
                    }}
                  >
                    <strong>⚠ Une ou plusieurs pièces rejetées.</strong> Rejetez
                    la demande avec un motif.
                  </div>
                )}
              </div>

              {/* ── DROITE — Récap + Actions ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      Récapitulatif de validation
                    </div>
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
                          <div className="check-name">
                            {p.name || (p.id === "cip" ? "CIP" : "Quittance")}
                          </div>
                          <div
                            className={`check-status ${
                              p.status === "valid"
                                ? "v"
                                : p.status === "reject"
                                ? "r"
                                : "p"
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
                    <div className="comment-global-label">
                      Commentaire général
                    </div>
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
                    <button
                      className="btn-main generate"
                      disabled={!allValidated}
                      onClick={() => setModal("generate")}
                    >
                      <SparkleIcon /> Valider et générer le document
                    </button>
                    <button
                      className="btn-main reject-all"
                      style={{
                        opacity: !allDecided || !anyRejected ? 0.4 : 1,
                        cursor:
                          !allDecided || !anyRejected
                            ? "not-allowed"
                            : "pointer",
                      }}
                      onClick={() => {
                        if (allDecided && anyRejected) setModal("reject");
                      }}
                    >
                      <XIcon /> Rejeter la demande
                    </button>
                    {!allDecided && (
                      <div className="info-box blue" style={{ marginTop: 4 }}>
                        Validez ou rejetez chaque pièce avant de pouvoir prendre
                        une décision finale.
                      </div>
                    )}
                    {allValidated && (
                      <div className="info-box green" style={{ marginTop: 4 }}>
                        La génération injectera automatiquement les notes et UE
                        depuis la base de données académique.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal génération */}
      {modal === "generate" && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">
              <SparkleIcon /> Confirmer la génération
            </div>
            <div className="modal-body">
              Vous allez déclencher la génération automatique du relevé de notes
              pour <strong>{selected?.etudiant}</strong> (
              <span className="modal-ref">{selected?.ref}</span>).
              <br />
              <br />
              Le système va automatiquement récupérer les données académiques
              (notes, UE, crédits, résultats) et les injecter dans le template
              officiel de l'IFRI.{" "}
              <strong>Cette action est irréversible.</strong>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setModal(null)}
                disabled={genBusy}
              >
                Annuler
              </button>
              <button
                className="modal-btn confirm-gen"
                onClick={handleGenerate}
                disabled={genBusy}
              >
                {genBusy
                  ? "Génération en cours..."
                  : "✓ Confirmer la génération"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal rejet */}
      {modal === "reject" && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">
              <XIcon /> Rejeter la demande
            </div>
            <div className="modal-body">
              Vous allez rejeter la demande{" "}
              <span className="modal-ref">{selected?.ref}</span> de{" "}
              <strong>{selected?.etudiant}</strong>.<br />
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
            <div className="motif-count">
              {motif.length} / 20 caractères minimum
            </div>
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
              <button
                className="modal-btn confirm-rej"
                onClick={handleReject}
                disabled={genBusy}
              >
                {genBusy ? "Traitement..." : "✗ Confirmer le rejet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview fichier */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
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
              <iframe
                title="preview"
                src={preview.url}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
            <div className="modal-actions" style={{ marginTop: 14 }}>
              <button
                className="modal-btn cancel"
                onClick={() => setPreview(null)}
              >
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
function Sidebar({ onLogout, onChangePwd }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo__icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <span>
          EtuDocs{" "}
          <span
            style={{ fontSize: ".75rem", fontWeight: 500, color: "#f5a623" }}
          >
            Agent
          </span>
        </span>
      </div>
      <nav className="sidebar-nav">
        <button className="nav-item active" type="button">
          <span className="nav-icon">
            <GridIcon />
          </span>
          Tableau de bord
        </button>
        <button className="nav-item" type="button" onClick={onChangePwd}>
          <span className="nav-icon">
            <LockIcon />
          </span>
          Modifier mot de passe
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" type="button" onClick={onLogout}>
          <LogoutIcon /> Déconnexion
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
