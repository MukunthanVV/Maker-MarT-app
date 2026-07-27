import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import apiClient from '../api/client';

const HACKATHONS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `👨‍💻 Hackathon ${i + 1}: ${['Web3', 'AI/ML', 'IoT', 'FinTech', 'HealthTech', 'EdTech', 'Cybersecurity', 'GameDev', 'Open Source', 'Robotics'][i]}`,
  desc: "Join us for 48 hours of intense coding, problem-solving, and networking. Build the future with your peers!",
  date: `October ${15 + i}-${17 + i}, 2026`,
  location: `Main Library, ${i % 3 + 1} Floor`,
  prize: `₹${(i + 1) * 10},000 Prize Pool`
}));

export const Hackathon = () => {
  const navigate = useNavigate();
  const [externalEvents, setExternalEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExternal = async () => {
      try {
        const res = await apiClient.get('/external-events/hackathons');
        setExternalEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExternal();
  }, []);

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-text-primary)] font-sans min-h-screen pb-24 relative">
      <header className="bg-[var(--color-surface)] sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[var(--color-border)] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="btn-icon">
            <span className="material-symbols-outlined text-[var(--color-primary)]">arrow_back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[var(--color-primary)]">Hackathons</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <section className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {HACKATHONS.map((event) => (
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
                  <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
                  <span className="font-semibold text-sm">{event.prize}</span>
                </div>
              </div>
              <button className="btn-primary w-full mt-auto">Register Team</button>
            </div>
          ))}

          {externalEvents.length > 0 && (
            <>
              <div className="flex items-center gap-3 mt-4 mb-2">
                <div className="h-px flex-1 bg-[var(--color-border)]"></div>
                <h3 className="text-xl font-bold text-[var(--color-text-secondary)] whitespace-nowrap">External Competitions</h3>
                <div className="h-px flex-1 bg-[var(--color-border)]"></div>
              </div>
              
              {externalEvents.map((event) => (
                <div key={event.id} className="card-standard p-8 flex flex-col relative overflow-hidden border-2 border-transparent hover:border-[var(--color-primary)] transition-colors">
                  <div className="absolute top-4 right-4 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {event.source}
                  </div>
                  <h2 className="text-2xl font-bold mb-4 pr-24">{event.title}</h2>
                  <p className="text-base text-[var(--color-text-secondary)] mb-6 flex-1">{event.desc}</p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-500">event</span>
                      <span className="font-semibold text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-blue-500">public</span>
                      <span className="font-semibold text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-yellow-500">emoji_events</span>
                      <span className="font-semibold text-sm">{event.prize}</span>
                    </div>
                  </div>
                  <a href={event.link} target="_blank" rel="noopener noreferrer" className="btn-primary w-full mt-auto text-center !bg-zinc-800 hover:!bg-zinc-700 flex justify-center items-center gap-2">
                    Apply Externally <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>
              ))}
            </>
          )}
          {loading && (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          )}
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
