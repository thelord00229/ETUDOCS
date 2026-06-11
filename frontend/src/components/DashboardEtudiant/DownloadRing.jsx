const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_DOWNLOADS = 3;

function FileTextIcon({ color }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

/**
 * @param {{
 *   downloadCount?: number,
 *   maxDownloads?: number
 * }} props
 */
export function DownloadRing({ downloadCount = 0, maxDownloads = MAX_DOWNLOADS }) {
  const safeMax = Number(maxDownloads || MAX_DOWNLOADS);
  const used = Math.min(Math.max(Number(downloadCount || 0), 0), safeMax);
  const remaining = Math.max(safeMax - used, 0);
  const progress = safeMax > 0 ? remaining / safeMax : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const exhausted = remaining <= 0;
  const accent = exhausted ? "#ef4444" : "#22c55e";

  return (
    <div
      className="download-ring"
      title={`${remaining} téléchargements restants sur ${safeMax}`}
    >
      <style>{`
        .download-ring {
          align-items: center;
          display: inline-flex;
          height: 48px;
          justify-content: center;
          position: relative;
          width: 48px;
        }

        .download-ring__svg {
          height: 48px;
          transform: rotate(-90deg);
          width: 48px;
        }

        .download-ring__progress {
          transition: stroke-dashoffset .7s ease-out, stroke .25s ease;
        }

        .download-ring__icon {
          align-items: center;
          display: flex;
          inset: 0;
          justify-content: center;
          position: absolute;
        }
      `}</style>
      <svg className="download-ring__svg" viewBox="0 0 48 48" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          fill="none"
          r={RADIUS}
          stroke="#e5e7eb"
          strokeWidth="5"
        />
        <circle
          className="download-ring__progress"
          cx="24"
          cy="24"
          fill="none"
          r={RADIUS}
          stroke={accent}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth="5"
        />
      </svg>
      <span className="download-ring__icon">
        <FileTextIcon color={accent} />
      </span>
    </div>
  );
}
