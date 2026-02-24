import Sidebar from "./Sidebar.jsx";
import TopBar from "./Topbar.jsx";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
  .dash-layout { display:flex; min-height:100vh; background:#f8fafc; font-family:'DM Sans',sans-serif; }
  .dash-main   { margin-left:200px; padding-top:64px; flex:1; min-width:0; }
  .dash-content { padding:28px 32px; display:flex; flex-direction:column; gap:24px; padding-bottom:48px; }
`;

export default function DashboardLayout({ children }) {
  return (
    <div className="dash-layout">
      <style>{css}</style>
      <Sidebar />
      <div className="dash-main">
        <TopBar name="Koffi AGUEH" meta="20220001 • IFRI" initials="KA" notifCount={1} />
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
