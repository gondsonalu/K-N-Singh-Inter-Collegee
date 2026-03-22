import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar } from 'lucide-react';
import { api } from '../services/api';

interface Notice {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}

export const Notices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await api.get<Notice[]>('/api/notices');
        setNotices(data);
      } catch (err) {
        console.error("Error fetching notices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  return (
    <div className="pt-24">
      <section className="bg-primary py-20 text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          Notice Board
        </motion.h1>
        <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : notices.length > 0 ? notices.map((notice, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={notice.id}
                className={`p-8 rounded-3xl border-l-8 transition-all hover:shadow-xl ${
                  notice.isImportant ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-primary'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 text-slate-500 text-sm">
                    <Calendar className="h-4 w-4" />
                    {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  {notice.isImportant && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Important
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">{notice.title}</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
              </motion.div>
            )) : (
              <div className="text-center py-24 text-slate-400 italic">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No notices have been posted yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
