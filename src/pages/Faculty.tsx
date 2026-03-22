import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, GraduationCap } from 'lucide-react';
import { api } from '../services/api';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  photoUrl: string;
}

export const Faculty = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const data = await api.get<Teacher[]>('/api/faculty');
        setTeachers(data);
      } catch (err) {
        console.error("Error fetching faculty:", err);
      }
    };
    fetchFaculty();
  }, []);

  return (
    <div className="pt-24">
      <section className="bg-primary py-20 text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          Our Faculty
        </motion.h1>
        <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-primary mb-6">Meet Our Educators</h2>
            <p className="text-slate-600 leading-relaxed">
              Our faculty members are more than just teachers; they are mentors and guides who are committed to the academic and personal growth of every student.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group glass rounded-3xl overflow-hidden hover:shadow-2xl transition-all"
              >
                <div className="h-64 overflow-hidden relative">
                   <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <button className="text-white flex items-center gap-2 text-sm font-bold">
                      <Mail className="h-4 w-4" /> Contact
                    </button>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-primary mb-1">{teacher.name}</h3>
                  <p className="text-secondary font-bold text-sm mb-2">{teacher.subject}</p>
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                    <GraduationCap className="h-4 w-4" />
                    {teacher.qualification}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
