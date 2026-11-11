import React, { useState, useEffect, useRef } from 'react';
import { Testimonial } from '../types';
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2, MessageSquareQuote, Loader2 } from 'lucide-react';
import { testimonialService, bioService } from '../services/firestoreService';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface SocialProofCarouselProps {
  testimonials?: Testimonial[];
  userId?: string;
  username?: string;
  theme?: string;
  isCompact?: boolean;
  autoPlayIntervalMs?: number;
  showEmptyPlaceholder?: boolean;
  className?: string;
}

export const SocialProofCarousel: React.FC<SocialProofCarouselProps> = ({
  testimonials: initialTestimonials,
  userId,
  username,
  theme = 'violet',
  isCompact = false,
  autoPlayIntervalMs = 5000,
  showEmptyPlaceholder = false,
  className = '',
}) => {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(!initialTestimonials || initialTestimonials.length === 0);
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(userId);

  // Auto-cycle timer and progress bar state
  const [progress, setProgress] = useState(0);

  // Touch Swipe Refs for Mobile Swiping
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // 1. Resolve userId from username if userId wasn't provided directly
  useEffect(() => {
    if (userId) {
      setResolvedUserId(userId);
    } else if (username) {
      bioService.getBioByUsername(username).then((bio) => {
        if (bio?.userId || bio?.id) {
          setResolvedUserId(bio.userId || bio.id);
        }
      });
    }
  }, [userId, username]);

  // 2. Fetch and Listen to Real-Time Testimonials from Firestore
  useEffect(() => {
    if (!resolvedUserId) {
      if (initialTestimonials && initialTestimonials.length > 0) {
        setItems(initialTestimonials);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    const testimonialsPath = `bios/${resolvedUserId}/testimonials`;

    try {
      const q = query(
        collection(db, 'bios', resolvedUserId, 'testimonials'),
        orderBy('rating', 'desc')
      );

      // Listen to real-time Firestore updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            } as Testimonial));
            setItems(fetched);
            setIsLoading(false);
          } else {
            // Fallback: check embedded bio testimonials
            testimonialService.getTestimonialsByUserId(resolvedUserId).then((fallback) => {
              if (fallback && fallback.length > 0) {
                setItems(fallback);
              } else if (initialTestimonials && initialTestimonials.length > 0) {
                setItems(initialTestimonials);
              }
              setIsLoading(false);
            });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, testimonialsPath);
          // Fallback to initial testimonials on network or permissions error
          if (initialTestimonials && initialTestimonials.length > 0) {
            setItems(initialTestimonials);
          }
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      // One-off fallback fetch
      testimonialService.getTestimonialsByUserId(resolvedUserId).then((res) => {
        if (res && res.length > 0) {
          setItems(res);
        } else if (initialTestimonials && initialTestimonials.length > 0) {
          setItems(initialTestimonials);
        }
        setIsLoading(false);
      });
    }
  }, [resolvedUserId, initialTestimonials]);

  const activeTestimonials = items.filter((t) => t.featured !== false);

  // 3. Auto-Cycle Timer with animated progress
  useEffect(() => {
    if (activeTestimonials.length <= 1 || isPaused) {
      setProgress(0);
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / autoPlayIntervalMs) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % activeTestimonials.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [activeTestimonials.length, isPaused, autoPlayIntervalMs, currentIndex]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 45;
    const isSwipeRight = distance < -45;

    if (isSwipeLeft) {
      nextSlide();
    } else if (isSwipeRight) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % activeTestimonials.length);
  };

  const prevSlide = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev === 0 ? activeTestimonials.length - 1 : prev - 1));
  };

  const goToSlide = (idx: number) => {
    setProgress(0);
    setCurrentIndex(idx);
  };

  // Loading Skeleton State
  if (isLoading && activeTestimonials.length === 0) {
    return (
      <div className="w-full rounded-2xl p-4 sm:p-5 bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/15 animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-28 bg-white/20 rounded" />
          <div className="h-3 w-8 bg-white/20 rounded" />
        </div>
        <div className="space-y-2 py-2">
          <div className="h-4 w-full bg-white/15 rounded" />
          <div className="h-4 w-4/5 bg-white/15 rounded" />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <div className="w-7 h-7 rounded-full bg-white/20" />
          <div className="space-y-1">
            <div className="h-3 w-20 bg-white/20 rounded" />
            <div className="h-2 w-14 bg-white/15 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state handling
  if (activeTestimonials.length === 0) {
    if (!showEmptyPlaceholder) return null;
    return (
      <div className="w-full rounded-2xl p-5 text-center bg-white/10 dark:bg-slate-900/60 border border-white/15 backdrop-blur-md text-white/70 space-y-2">
        <MessageSquareQuote className="w-6 h-6 mx-auto text-white/40" />
        <p className="text-xs">Nenhum depoimento de cliente cadastrado no Firestore ainda.</p>
      </div>
    );
  }

  const current = activeTestimonials[currentIndex] || activeTestimonials[0];

  const getThemeAccents = () => {
    switch (theme) {
      case 'emerald':
        return {
          quoteIcon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          activeDot: 'bg-emerald-500 shadow-emerald-500/50',
          progressBar: 'bg-emerald-500',
        };
      case 'sunset':
        return {
          quoteIcon: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          activeDot: 'bg-amber-500 shadow-amber-500/50',
          progressBar: 'bg-amber-500',
        };
      case 'midnight':
        return {
          quoteIcon: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          activeDot: 'bg-indigo-500 shadow-indigo-500/50',
          progressBar: 'bg-indigo-500',
        };
      case 'glass':
        return {
          quoteIcon: 'text-white bg-white/15 border-white/30',
          activeDot: 'bg-white shadow-white/50',
          progressBar: 'bg-white/80',
        };
      case 'slate':
        return {
          quoteIcon: 'text-slate-300 bg-slate-800 border-slate-700',
          activeDot: 'bg-slate-300 shadow-slate-300/50',
          progressBar: 'bg-slate-400',
        };
      default:
        return {
          quoteIcon: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
          activeDot: 'bg-violet-500 shadow-violet-500/50',
          progressBar: 'bg-violet-500',
        };
    }
  };

  const accents = getThemeAccents();

  return (
    <div
      className={`w-full relative rounded-2xl overflow-hidden transition-all duration-300 select-none ${
        theme === 'glass'
          ? 'bg-white/15 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl'
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 shadow-md'
      } ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Slide Progress Bar */}
      {activeTestimonials.length > 1 && (
        <div className="w-full h-1 bg-black/10 dark:bg-white/5">
          <div
            className={`h-full transition-all duration-75 ${accents.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className={`p-1 rounded-md border ${accents.quoteIcon}`}>
              <Quote className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Prova Social & Avaliações
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-400 dark:text-slate-500">
            <span>{currentIndex + 1}</span>
            <span>/</span>
            <span>{activeTestimonials.length}</span>
          </div>
        </div>

        {/* Testimonial Card Content with Slide Animation */}
        <div className="relative overflow-hidden min-h-[105px] flex flex-col justify-between transition-opacity duration-300">
          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < current.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            ))}
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 ml-1">
              {current.rating}.0
            </span>
          </div>

          {/* Comment Quote */}
          <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 font-medium italic leading-relaxed line-clamp-3 mb-3">
            "{current.comment}"
          </p>

          {/* Client Details Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <img
                src={current.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={current.clientName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/20 shrink-0"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100';
                }}
              />
              <div className="truncate">
                <div className="flex items-center gap-1 truncate">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {current.clientName}
                  </h4>
                  <span title="Cliente Verificado" className="inline-flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {current.clientRole}
                </p>
              </div>
            </div>

            {/* Navigation Arrows */}
            {activeTestimonials.length > 1 && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Depoimento anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Próximo depoimento"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Clickable Pagination Dots */}
        {activeTestimonials.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
            {activeTestimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? `w-6 ${accents.activeDot}`
                    : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                aria-label={`Ir para depoimento ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
