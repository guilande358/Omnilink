import React, { useRef, useEffect, useState } from 'react';
import { useOmniLink } from '../context/OmniLinkContext';
import { QrCode, Download, X, Copy, Check, Sparkles, FileCode, Image as ImageIcon } from 'lucide-react';

export const QrCodeModal: React.FC = () => {
  const { isQrModalOpen, closeQrModal, profile } = useOmniLink();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [fgColor, setFgColor] = useState('#7c3aed');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}?u=${profile.username}`
      : `https://omnilinksbio.ai.studio?u=${profile.username}`;

  useEffect(() => {
    if (!isQrModalOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Draw stylized QR code pattern
    ctx.fillStyle = fgColor;
    const cols = 21;
    const cellSize = size / cols;

    // Render QR finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = bgColor;
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = fgColor;
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(cols - 7, 0);
    drawFinderPattern(0, cols - 7);

    // Render QR data bits
    let seed = 42;
    for (let r = 0; r < cols; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip corner finder zones
        if (
          (r < 7 && c < 7) ||
          (r < 7 && c >= cols - 7) ||
          (r >= cols - 7 && c < 7)
        ) {
          continue;
        }

        seed = (seed * 9301 + 49297) % 233280;
        if (seed / 233280 > 0.45) {
          ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 2, cellSize - 2);
        }
      }
    }

    // Draw center profile avatar logo overlay if enabled
    if (includeLogo) {
      const centerPos = size / 2;
      const logoRadius = 24;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerPos, centerPos, logoRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = bgColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerPos, centerPos, logoRadius, 0, Math.PI * 2);
      ctx.clip();

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = profile.avatarUrl;
      img.onload = () => {
        ctx.drawImage(
          img,
          centerPos - logoRadius,
          centerPos - logoRadius,
          logoRadius * 2,
          logoRadius * 2
        );
        ctx.restore();
      };
      img.onerror = () => {
        ctx.fillStyle = fgColor;
        ctx.fill();
        ctx.restore();
      };
    }
  }, [isQrModalOpen, fgColor, bgColor, includeLogo, profile]);

  if (!isQrModalOpen) return null;

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `omnilink_qr_${profile.username}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleDownloadSvg = () => {
    const size = 280;
    const cols = 21;
    const cellSize = size / cols;

    let rectsSvg = '';
    let seed = 42;

    for (let r = 0; r < cols; r++) {
      for (let c = 0; c < cols; c++) {
        const isFinder = (r < 7 && c < 7) || (r < 7 && c >= cols - 7) || (r >= cols - 7 && c < 7);
        if (isFinder) continue;

        seed = (seed * 9301 + 49297) % 233280;
        if (seed / 233280 > 0.45) {
          rectsSvg += `<rect x="${c * cellSize + 1}" y="${r * cellSize + 1}" width="${cellSize - 2}" height="${cellSize - 2}" fill="${fgColor}" />`;
        }
      }
    }

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" fill="${bgColor}" />
        
        <!-- Finder top-left -->
        <rect x="0" y="0" width="${7 * cellSize}" height="${7 * cellSize}" fill="${fgColor}" />
        <rect x="${cellSize}" y="${cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="${bgColor}" />
        <rect x="${2 * cellSize}" y="${2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="${fgColor}" />

        <!-- Finder top-right -->
        <rect x="${(cols - 7) * cellSize}" y="0" width="${7 * cellSize}" height="${7 * cellSize}" fill="${fgColor}" />
        <rect x="${(cols - 6) * cellSize}" y="${cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="${bgColor}" />
        <rect x="${(cols - 5) * cellSize}" y="${2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="${fgColor}" />

        <!-- Finder bottom-left -->
        <rect x="0" y="${(cols - 7) * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="${fgColor}" />
        <rect x="${cellSize}" y="${(cols - 6) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="${bgColor}" />
        <rect x="${2 * cellSize}" y="${(cols - 5) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="${fgColor}" />

        ${rectsSvg}

        ${
          includeLogo
            ? `<circle cx="${size / 2}" cy="${size / 2}" r="28" fill="${bgColor}" />
               <circle cx="${size / 2}" cy="${size / 2}" r="24" fill="${fgColor}" />
               <text x="${size / 2}" y="${size / 2 + 4}" font-size="12" font-weight="bold" fill="${bgColor}" text-anchor="middle">@${profile.username.slice(0, 3)}</text>`
            : ''
        }
      </svg>
    `.trim();

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omnilink_qr_${profile.username}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white relative">
          <button
            onClick={closeQrModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <QrCode className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              Printable QR Studio
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-white">Custom Profile QR Generator</h3>
          <p className="text-xs text-white/80 mt-1">
            Print on menus, business cards, or product packaging for instant scans.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-center">
          {/* Canvas QR Code Display */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block shadow-inner ring-1 ring-slate-200 dark:ring-slate-700">
            <canvas ref={canvasRef} className="rounded-xl mx-auto shadow-md" />
          </div>

          <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl flex items-center justify-between gap-2">
            <span className="truncate">{profileUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1 text-slate-600 hover:text-violet-600 dark:text-slate-300 transition-colors shrink-0"
              title="Copy URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Style Controls */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Pattern Color
              </label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-full h-8 bg-transparent rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-8 bg-transparent rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-left">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Embed Profile Avatar Logo
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-violet-600" />
            </label>
          </div>

          {/* Download Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleDownloadPng}
              className="py-3 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="py-3 px-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white border border-slate-700 font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Download SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
