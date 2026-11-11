import React, { useState } from 'react';
import { useOmniLink } from '../../context/OmniLinkContext';
import { GalleryPhoto } from '../../types';
import { Image as ImageIcon, Plus, Trash2, Video, Sparkles, ExternalLink, Play } from 'lucide-react';

export const MediaTab: React.FC = () => {
  const { profile, updateProfile, addGalleryPhoto, deleteGalleryPhoto } = useOmniLink();

  const [imageUrl, setImageUrl] = useState('');
  const [photoTitle, setPhotoTitle] = useState('');
  const [priceCaption, setPriceCaption] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !photoTitle) return;

    addGalleryPhoto({
      imageUrl,
      title: photoTitle,
      priceCaption: priceCaption || undefined,
      linkUrl: linkUrl || undefined,
    });

    setImageUrl('');
    setPhotoTitle('');
    setPriceCaption('');
    setLinkUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white shadow-lg shadow-pink-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Multimedia Photo Gallery & Video Reel</h2>
          <p className="text-xs text-white/80 mt-0.5">
            Add product showcase photos, work portfolio items, and YouTube/TikTok video embeds.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1 shrink-0">
          <ImageIcon className="w-4 h-4" />
          <span>HD Media Showcase</span>
        </div>
      </div>

      {/* Featured Video Reel Settings */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Video className="w-4 h-4 text-pink-500" />
          <span>Featured Video Reel Embed</span>
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            YouTube / TikTok Video Link
          </label>
          <input
            type="url"
            value={profile.featuredVideoUrl || ''}
            onChange={(e) => updateProfile({ featuredVideoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
          />
        </div>
      </div>

      {/* Add Gallery Photo Form */}
      <form
        onSubmit={handleAddPhoto}
        className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm"
      >
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-pink-500" />
          <span>Add Product / Portfolio Photo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={photoTitle}
            onChange={(e) => setPhotoTitle(e.target.value)}
            placeholder="Photo Title (e.g. Minimalist Design System)"
            required
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="text"
            value={priceCaption}
            onChange={(e) => setPriceCaption(e.target.value)}
            placeholder="Price / Tag Caption (e.g. 500 MT / $15)"
            className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (Unsplash, imgur, or hosted photo URL)"
          required
          className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
        />

        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Destination URL when clicked (Optional)"
          className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
        />

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Photo to Gallery</span>
          </button>
        </div>
      </form>

      {/* Gallery Photos Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Active Gallery Items ({(profile.galleryPhotos || []).length})
        </h3>

        {(profile.galleryPhotos || []).length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No gallery photos added yet. Add product photos above to showcase work on your bio link.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(profile.galleryPhotos || []).map((photo) => (
              <div
                key={photo.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1512290900673-3e13d9646b9a?w=400';
                    }}
                  />
                  {photo.priceCaption && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-300 font-mono font-bold text-[10px] backdrop-blur-md">
                      {photo.priceCaption}
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {photo.title}
                  </h4>

                  <div className="flex items-center justify-between pt-1">
                    {photo.linkUrl ? (
                      <a
                        href={photo.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1 truncate max-w-[120px]"
                      >
                        <span>View link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">Photo only</span>
                    )}

                    <button
                      onClick={() => deleteGalleryPhoto(photo.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
