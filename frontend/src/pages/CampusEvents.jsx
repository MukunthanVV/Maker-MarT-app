import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';

const EVENTS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `🎉 Campus Event ${i + 1}: ${['Guest Lecture', 'Cultural Fest', 'Music Night', 'Alumni Meet', 'Career Fair', 'Startup Pitch', 'Movie Screening', 'Sports Day', 'Photography Club', 'Literary Meet'][i]}`,
  desc: "Stay updated with all campus activities, including seminars, guest lectures, cultural fests, and generic meetups.",
  date: `Month ${i % 12 + 1}, 2026`,
  location: `Various Campus Venues ${i + 1}`,
  notify: `Weekly Notifications via App`
}));

export const CampusEvents = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans min-h-screen pb-24 relative">
      <header className="bg-[var(--color-surface)] sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="btn-icon">
            <span className="material-symbols-outlined text-[var(--color-primary)]">arrow_back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[var(--color-primary)]">Campus Events</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <section className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {EVENTS.map((event) => (
            <div key={event.id} className="card-standard p-8 flex flex-col">
              <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
              <p className="text-base text-[var(--color-text-secondary)] mb-6 flex-1">{event.desc}</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-500">event</span>
                  <span className="font-semibold text-sm">{event.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-500">location_on</span>
                  <span className="font-semibold text-sm">{event.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-orange-500">campaign</span>
                  <span className="font-semibold text-sm">{event.notify}</span>
                </div>
              </div>
              <button className="btn-primary w-full mt-auto">View Details</button>
            </div>
          ))}
          </section>
          
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 lg:h-[calc(100vh-160px)] lg:overflow-y-auto min-w-0 pr-1 pb-20">
            {/* Mini Calendar Card */}
            <div className="card-standard p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">📅 Calendar</h3>
                <span className="text-sm font-semibold text-[var(--color-primary)]">October 2026</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[var(--color-text-secondary)] mb-2">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                <div className="p-1.5 opacity-30">27</div><div className="p-1.5 opacity-30">28</div><div className="p-1.5 opacity-30">29</div><div className="p-1.5 opacity-30">30</div>
                <div className="p-1.5">1</div><div className="p-1.5">2</div><div className="p-1.5">3</div><div className="p-1.5">4</div>
                <div className="p-1.5">5</div><div className="p-1.5">6</div><div className="p-1.5">7</div><div className="p-1.5">8</div><div className="p-1.5">9</div><div className="p-1.5">10</div>
                <div className="p-1.5">11</div><div className="p-1.5">12</div><div className="p-1.5">13</div><div className="p-1.5">14</div>
                <div className="p-1.5 bg-[var(--color-primary)] text-white rounded-lg font-bold shadow-md">15</div>
                <div className="p-1.5 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg font-bold">16</div>
                <div className="p-1.5 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-lg font-bold">17</div>
                <div className="p-1.5">18</div><div className="p-1.5">19</div><div className="p-1.5">20</div><div className="p-1.5">21</div><div className="p-1.5">22</div><div className="p-1.5">23</div><div className="p-1.5">24</div>
                <div className="p-1.5">25</div><div className="p-1.5">26</div><div className="p-1.5">27</div><div className="p-1.5">28</div><div className="p-1.5">29</div><div className="p-1.5">30</div><div className="p-1.5">31</div>
              </div>
            </div>

            {/* My Events Tracker */}
            <div className="card-standard p-6">
              <h3 className="text-xl font-bold mb-4">📌 My Events</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-center p-3 bg-[var(--color-surface)] hover:bg-[var(--color-background)] cursor-pointer rounded-xl border border-[var(--color-border)] transition-colors">
                  <div className="bg-[var(--color-success)]/10 text-[var(--color-success)] p-2 rounded-lg material-symbols-outlined">event_available</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm line-clamp-1">Campus Hackathon '26</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Oct 15, 2026</p>
                  </div>
                  <span className="material-symbols-outlined text-[var(--color-text-secondary)] text-sm">chevron_right</span>
                </div>
                <div className="flex gap-3 items-center p-3 bg-[var(--color-surface)] hover:bg-[var(--color-background)] cursor-pointer rounded-xl border border-[var(--color-border)] transition-colors">
                  <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-2 rounded-lg material-symbols-outlined">pending_actions</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm line-clamp-1">Robotics Workshop</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Dec 12, 2026</p>
                  </div>
                  <span className="material-symbols-outlined text-[var(--color-text-secondary)] text-sm">chevron_right</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 text-sm font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-xl transition-colors">View All Registrations</button>
            </div>
          </aside>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
