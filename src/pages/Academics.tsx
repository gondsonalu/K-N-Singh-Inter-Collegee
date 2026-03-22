import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Microscope, Palette, Calculator, Languages, Globe, History } from 'lucide-react';
import { api } from '../services/api';

interface AcademicStream {
  id: string;
  title: string;
  subjects: string | string[];
  description: string;
  iconName: string;
}

interface AcademicLevel {
  id: string;
  title: string;
  classes: string;
  focus: string;
}

export const Academics = () => {
  const [streams, setStreams] = useState<AcademicStream[]>([]);
  const [levels, setLevels] = useState<AcademicLevel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streamsData, levelsData] = await Promise.all([
          api.get<AcademicStream[]>('/api/academic-streams'),
          api.get<AcademicLevel[]>('/api/academic-levels')
        ]);
        
        setStreams(streamsData);
        setLevels(levelsData);
      } catch (err) {
        console.error("Error fetching academic data:", err);
      }
    };
    fetchData();
  }, []);

  const getIcon = (name: string) => {
    switch(name) {
      case 'Microscope': return <Microscope className="h-12 w-12 text-secondary" />;
      case 'Palette': return <Palette className="h-12 w-12 text-secondary" />;
      default: return <Microscope className="h-12 w-12 text-secondary" />;
    }
  };

  return (
    <div className="pt-24">
      <section className="bg-primary py-20 text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          Academics
        </motion.h1>
        <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-primary mb-6">Academic Excellence</h2>
            <p className="text-slate-600 leading-relaxed">
              We follow the curriculum prescribed by the Uttar Pradesh Board of High School and Intermediate Education. Our academic program is designed to provide a strong foundation and prepare students for competitive exams and future careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
            {levels.map((level, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass p-10 rounded-3xl border-l-8 border-secondary"
              >
                <h3 className="text-2xl font-bold text-primary mb-2">{level.title}</h3>
                <p className="text-secondary font-bold mb-4">{level.classes}</p>
                <p className="text-slate-600">{level.focus}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Intermediate Streams</h2>
            <div className="h-1 w-20 bg-secondary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {streams.map((stream, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-10 rounded-3xl bg-slate-50 border border-slate-100"
              >
                <div className="mb-8">{getIcon(stream.iconName)}</div>
                <h3 className="text-2xl font-bold mb-4 text-primary">{stream.title}</h3>
                <p className="text-slate-600 mb-8">{stream.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  {Array.isArray(stream.subjects) ? stream.subjects.map((sub, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <div className="h-2 w-2 rounded-full bg-secondary"></div>
                      {sub}
                    </div>
                  )) : stream.subjects.split(',').map((sub: string, sIdx: number) => (
                    <div key={sIdx} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <div className="h-2 w-2 rounded-full bg-secondary"></div>
                      {sub.trim()}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Core Subjects</h2>
            <p className="text-slate-500">A wide range of subjects to choose from</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: <Languages />, name: 'Hindi' },
              { icon: <Globe />, name: 'English' },
              { icon: <Calculator />, name: 'Mathematics' },
              { icon: <Microscope />, name: 'Science' },
              { icon: <History />, name: 'History' },
              { icon: <Book />, name: 'Pol. Science' },
            ].map((sub, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-all">
                <div className="text-secondary flex justify-center mb-4">{sub.icon}</div>
                <p className="font-bold text-primary text-sm">{sub.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
