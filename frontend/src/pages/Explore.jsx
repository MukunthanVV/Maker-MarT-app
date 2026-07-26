import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { BottomNav } from '../components/BottomNav';

import { demoProblems, demoNews } from '../data/exploreDemoData';

export const Explore = () => {
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState(demoNews);
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await apiClient.get('/news');
        if (response.data && response.data.length > 0) {
          setNewsData(response.data);
        }
      } catch (error) {
        console.error("Failed to load live news, using demo data", error);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--color-background)] rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined text-[var(--color-text-primary)]">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">Explore Ideas</h1>
        </div>
      </div>

      <div className="p-4 space-y-8">
        {/* Tech Daily News */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-2 pr-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">newspaper</span>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Tech Daily News</h2>
            </div>
            <a href="https://www.bbc.com/news/technology" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 group">
              View More <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-rows-3 grid-flow-col gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 pt-2 px-1 -mx-1">
            {newsData.map(news => (
              <a href={news.link || '#'} target="_blank" rel="noopener noreferrer" key={news.id} className="snap-center shrink-0 w-[75vw] md:w-[280px] lg:w-[320px] bg-[var(--color-card)] rounded-2xl p-4 border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)] transition-colors cursor-pointer group flex flex-col gap-2 justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[var(--color-text-primary)] bg-[var(--color-background)] border border-[var(--color-border)] px-2 py-1 rounded-md">
                      {news.source}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] font-bold">
                      {news.time}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] leading-snug group-hover:text-[var(--color-primary)] transition-colors line-clamp-3">
                    {news.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* SIH Problem Statements */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-8 pr-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">lightbulb</span>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Problem Statements (SIH)</h2>
            </div>
            <a href="https://www.sih.gov.in/sih2023PS" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 group">
              View More <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 pt-2 px-1 -mx-1">
            {demoProblems.slice(0, 7).map(prob => (
              <div key={prob.id} className="snap-center shrink-0 w-[85vw] md:w-[300px] lg:w-[350px] bg-[var(--color-card)] rounded-3xl p-5 border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)] transition-colors cursor-pointer group flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">{prob.org}</div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors">{prob.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed line-clamp-3">{prob.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {prob.tags.map(tag => (
                    <span key={tag} className="bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* India Innovate Problem Statements */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-8 pr-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">emoji_objects</span>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Problem Statements (India Innovate)</h2>
            </div>
            <a href="https://innovateindia.mygov.in/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 group">
              View More <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 pt-2 px-1 -mx-1">
            {demoProblems.slice(7, 14).map(prob => (
              <div key={prob.id} className="snap-center shrink-0 w-[85vw] md:w-[300px] lg:w-[350px] bg-[var(--color-card)] rounded-3xl p-5 border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)] transition-colors cursor-pointer group flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">{prob.org}</div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors">{prob.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed line-clamp-3">{prob.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {prob.tags.map(tag => (
                    <span key={tag} className="bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Startup India Problem Statements */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-8 pr-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">rocket_launch</span>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Problem Statements (Startup India)</h2>
            </div>
            <a href="https://www.startupindia.gov.in/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 group">
              View More <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 pt-2 px-1 -mx-1">
            {demoProblems.slice(14, 20).map(prob => (
              <div key={prob.id} className="snap-center shrink-0 w-[85vw] md:w-[300px] lg:w-[350px] bg-[var(--color-card)] rounded-3xl p-5 border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)] transition-colors cursor-pointer group flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">{prob.org}</div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-tight mb-2 group-hover:text-[var(--color-primary)] transition-colors">{prob.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed line-clamp-3">{prob.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {prob.tags.map(tag => (
                    <span key={tag} className="bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <BottomNav />
    </div>
  );
};
