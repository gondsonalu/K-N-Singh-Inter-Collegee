import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, History, School } from 'lucide-react';
import { api } from '../services/api';

interface AboutSection {
  id: string;
  title: string;
  content: string;
  iconName: string;
}

interface Infrastructure {
  id: string;
  title: string;
  description: string;
}

export const About = () => {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsData, infraData] = await Promise.all([
          api.get<AboutSection[]>('/api/about-sections'),
          api.get<Infrastructure[]>('/api/infrastructure')
        ]);
        
        setSections(sectionsData);
        setInfrastructure(infraData);
      } catch (err) {
        console.error("Error fetching about data:", err);
      }
    };
    fetchData();
  }, []);

  const getIcon = (name: string) => {
    switch(name) {
      case 'History': return <History className="h-10 w-10 text-secondary" />;
      case 'Target': return <Target className="h-10 w-10 text-secondary" />;
      case 'Eye': return <Eye className="h-10 w-10 text-secondary" />;
      default: return <History className="h-10 w-10 text-secondary" />;
    }
  };

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="bg-primary py-20 text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          About Our School
        </motion.h1>
        <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">A Legacy of Excellence</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                K N Singh Inter College, located in Masuriyapur Nainijor, Azamgarh, is a beacon of learning in Uttar Pradesh. Affiliated with the UP Board, we offer education from High School to Intermediate levels.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Our commitment to quality education is reflected in our consistent academic results and the overall development of our students. We believe in nurturing not just the mind, but also the character of our students.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img src="https://picsum.photos/seed/campus/800/600" alt="Campus" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {sections.map((sec, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="p-10 rounded-3xl bg-slate-50 border border-slate-100 text-center"
              >
                <div className="flex justify-center mb-6">{getIcon(sec.iconName)}</div>
                <h3 className="text-2xl font-bold mb-4 text-primary">{sec.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{sec.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principal Message */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass p-12 rounded-3xl flex flex-col md:flex-row gap-12 items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-secondary flex-shrink-0">
              <img src="https://picsum.photos/seed/principal/400/400" alt="Principal" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">Principal's Message</h2>
              <p className="text-secondary font-bold mb-6 italic">"Education is the most powerful weapon which you can use to change the world."</p>
              <p className="text-slate-600 leading-relaxed mb-6">
                At K N Singh Inter College, we strive to provide an environment that encourages curiosity, creativity, and a love for learning. Our goal is to prepare our students for the challenges of the future while keeping them rooted in our cultural values.
              </p>
              <p className="font-bold text-primary">Dr. R.K. Singh</p>
              <p className="text-sm text-slate-500">Principal, K N Singh Inter College</p>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">Our Infrastructure</h2>
            <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {infrastructure.map((item, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-primary hover:text-white transition-all group">
                <School className="h-10 w-10 text-secondary mb-6 group-hover:text-white" />
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
