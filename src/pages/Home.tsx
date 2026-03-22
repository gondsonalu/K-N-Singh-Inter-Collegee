import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award, Trophy, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Notice {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}

interface HomeHighlight {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export const Home = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noticesData, highlightsData] = await Promise.all([
          api.get<Notice[]>('/api/notices'),
          api.get<HomeHighlight[]>('/api/home-highlights')
        ]);

        setNotices(noticesData.slice(0, 3));
        setHighlights(highlightsData);
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };
    fetchData();
  }, []);

  const getIcon = (name: string) => {
    switch(name) {
      case 'Users': return <Users className="h-8 w-8" />;
      case 'BookOpen': return <BookOpen className="h-8 w-8" />;
      case 'Award': return <Award className="h-8 w-8" />;
      case 'Trophy': return <Trophy className="h-8 w-8" />;
      default: return <Users className="h-8 w-8" />;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/school/1920/1080" 
            alt="School Building" 
            className="w-full h-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-bold text-white mb-6 font-display"
          >
            K N Singh Inter College
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto"
          >
            Empowering Students with Knowledge and Values in Masuriyapur, Azamgarh.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <Link to="/admissions" className="px-8 py-4 bg-secondary text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg">
              Admission Open
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all">
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">Why Choose Us?</h2>
            <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="text-secondary mb-6">{getIcon(item.iconName)}</div>
                <h3 className="text-xl font-bold mb-4 text-primary">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Notices */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">Latest Notices</h2>
              <div className="h-1 w-20 bg-secondary rounded-full"></div>
            </div>
            <Link to="/notices" className="text-secondary font-bold flex items-center gap-2 hover:gap-3 transition-all">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {notices.length > 0 ? notices.map((notice) => (
              <div key={notice.id} className="glass p-6 rounded-2xl relative overflow-hidden group">
                {notice.isImportant && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Important
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
                  <Bell className="h-4 w-4" />
                  {new Date(notice.createdAt).toLocaleDateString()}
                </div>
                <h3 className="text-lg font-bold mb-3 text-primary group-hover:text-secondary transition-colors">{notice.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">{notice.content}</p>
              </div>
            )) : (
              <div className="col-span-3 text-center py-12 text-slate-400 italic">No recent notices available.</div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Admissions Open for Academic Session</h2>
          <p className="text-slate-300 text-lg mb-10">Join K N Singh Inter College and embark on a journey of academic excellence and personal growth.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/admissions" className="px-10 py-4 bg-secondary text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
              Apply Now
            </Link>
            <Link to="/contact" className="px-10 py-4 border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              Contact School
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
