import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, User, Phone, Mail, GraduationCap, Send, Download } from 'lucide-react';
import { api } from '../services/api';

interface AdmissionStep {
  id: string;
  title: string;
  description: string;
}

interface AdmissionDocument {
  id: string;
  name: string;
}

export const Admissions = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    phone: '',
    email: '',
    classApplied: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [steps, setSteps] = useState<AdmissionStep[]>([]);
  const [documents, setDocuments] = useState<AdmissionDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stepsData, docsData] = await Promise.all([
          api.get<AdmissionStep[]>('/api/admission-steps'),
          api.get<AdmissionDocument[]>('/api/admission-documents')
        ]);
        
        setSteps(stepsData);
        setDocuments(docsData);
      } catch (err) {
        console.error("Error fetching admission data:", err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting enquiry...' });
    try {
      await api.post('/api/enquiries', {
        name: formData.studentName,
        email: formData.email,
        phone: formData.phone,
        subject: `Admission Enquiry - Class ${formData.classApplied}`,
        message: `Parent: ${formData.parentName}\nPhone: ${formData.phone}\nClass: ${formData.classApplied}\n\n${formData.message}`
      });
      
      setStatus({ type: 'success', message: 'Enquiry submitted successfully! We will contact you soon.' });
      setFormData({ studentName: '', parentName: '', phone: '', email: '', classApplied: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to submit enquiry. Please try again.' });
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const blob = await api.blob(`/api/download/${filename}`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert(err instanceof Error ? err.message : 'Error downloading file. Please try again.');
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
          Admissions
        </motion.h1>
        <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full mb-8"></div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={() => handleDownload('prospectus.pdf')}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary rounded-full font-bold hover:bg-slate-100 transition-all shadow-lg"
          >
            <Download className="h-5 w-5" /> Download Prospectus
          </button>
        </motion.div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Process & Docs */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-8">Admission Process</h2>
              <div className="space-y-8 mb-16">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xl">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                      <p className="text-slate-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-3xl font-bold text-primary mb-8">Required Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle className="h-5 w-5 text-secondary" />
                    <span className="text-sm font-medium text-slate-700">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enquiry Form */}
            <div id="enquiry-form">
              <div className="glass p-10 rounded-3xl shadow-2xl">
                <h2 className="text-2xl font-bold text-primary mb-2">Admission Enquiry</h2>
                <p className="text-slate-500 text-sm mb-8">Please fill out the form below and our admission team will get back to you.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          value={formData.studentName}
                          onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                          className="w-full pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          value={formData.parentName}
                          onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                          className="w-full pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input 
                          required
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email (Optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Applying For</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <select 
                        required
                        value={formData.classApplied}
                        onChange={(e) => setFormData({...formData, classApplied: e.target.value})}
                        className="w-full pl-10 appearance-none"
                      >
                        <option value="">Select Class</option>
                        <option value="9th">Class 9th</option>
                        <option value="10th">Class 10th</option>
                        <option value="11th">Class 11th</option>
                        <option value="12th">Class 12th</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                    <textarea 
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full"
                    ></textarea>
                  </div>

                  <button 
                    disabled={status.type === 'loading'}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg"
                  >
                    {status.type === 'loading' ? 'Submitting...' : (
                      <>Submit Enquiry <Send className="h-5 w-5" /></>
                    )}
                  </button>

                  {status.message && (
                    <p className={`text-center text-sm font-bold ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {status.message}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
