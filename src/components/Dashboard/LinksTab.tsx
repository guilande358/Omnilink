import React, { useState } from 'react';
import { useOmniLink } from '../../context/OmniLinkContext';
import { LinkItem, ButtonAnimation } from '../../types';
import {
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  Wand2,
  BarChart2,
  Edit2,
  Check,
} from 'lucide-react';

export const LinksTab: React.FC = () => {
  const { links, addLink, updateLink, deleteLink, openAiModal } = useOmniLink();

  const [titleInput, setTitleInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isHighlightedInput, setIsHighlightedInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !urlInput) return;

    addLink({
      title: titleInput,
      url: urlInput.startsWith('http') ? urlInput : `https://${urlInput}`,
      icon: 'Sparkles',
      active: true,
      isHighlighted: isHighlightedInput,
      animation: isHighlightedInput ? 'pulse' : 'none',
    });

    setTitleInput('');
    setUrlInput('');
    setIsHighlightedInput(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI CTA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-violet-500/10">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Your High-CTR Links</h2>
          <p className="text-xs text-white/80 mt-0.5">
            Add, reorder, or feature key links. Boost click-through rates with AI headlines.
          </p>
        </div>
        <button
          onClick={openAiModal}
          className="px-3.5 py-2 bg-white text-violet-700 hover:bg-violet-50 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
        >
          <Wand2 className="w-4 h-4 text-violet-600" />
          <span>AI Title Suggestions</span>
        </button>
      </div>

      {/* Add New Link Form */}
      <form
        onSubmit={handleAddLink}
        className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm"
      >
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Add New Link Button
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Title (e.g. ⚡ Download Free SaaS Guide)"
            required
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="URL (e.g. https://yourwebsite.com)"
            required
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isHighlightedInput}
              onChange={(e) => setIsHighlightedInput(e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
            />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Highlight Button (Gradient pulse animation)
            </span>
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Link</span>
          </button>
        </div>
      </form>

      {/* Links List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Active Profile Links ({links.length})
        </h3>

        {links.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No links added yet. Use the form above to create your first button!
            </p>
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm ${
                link.isHighlighted
                  ? 'border-violet-500/50 ring-1 ring-violet-500/20 dark:border-violet-500/40'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 w-full sm:w-auto truncate">
                <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />

                <div className="truncate">
                  {editingId === link.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={link.title}
                        onBlur={(e) => {
                          updateLink(link.id, { title: e.target.value });
                          setEditingId(null);
                        }}
                        autoFocus
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border rounded text-slate-900 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {link.title}
                      </h4>
                      {link.isHighlighted && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  )}

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-violet-600 truncate flex items-center gap-1 mt-0.5"
                  >
                    <span>{link.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                  <BarChart2 className="w-3 h-3 text-violet-500" />
                  <span>{link.clicksCount} clicks</span>
                </div>

                <button
                  onClick={() => updateLink(link.id, { active: !link.active })}
                  className={`p-2 rounded-lg transition-colors ${
                    link.active
                      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
                      : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}
                  title={link.active ? 'Visible on profile' : 'Hidden from profile'}
                >
                  {link.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setEditingId(editingId === link.id ? null : link.id)}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit link title"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteLink(link.id)}
                  className="p-2 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
