import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) return;
    setLoading(true);
    try {
      await api.post('/api/enquiries', form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      console.error("Error sending enquiry:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
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
          Contact Us
        </motion.h1>
        <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <div>
              <h2 className="text-3xl font-bold text-primary mb-8">Get in Touch</h2>
              <div className="space-y-8 mb-12">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1">Our Address</h3>
                    <p className="text-slate-600 text-sm">Masuriyapur, Nainijor, Azamgarh, Uttar Pradesh, India - 276001</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1">Phone Number</h3>
                    <p className="text-slate-600 text-sm">+91 1234567890</p>
                    <p className="text-slate-600 text-sm">+91 0987654321</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1">Email Address</h3>
                    <p className="text-slate-600 text-sm">info@knsinghintercollege.com</p>
                    <p className="text-slate-600 text-sm">admissions@knsinghintercollege.com</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-1">Office Hours</h3>
                    <p className="text-slate-600 text-sm">Monday - Saturday: 8:00 AM - 2:00 PM</p>
                    <p className="text-slate-600 text-sm">Sunday: Closed</p>
                  </div>
                </div>
              </div>

              <a 
                href="https://wa.me/911234567890" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
              >
                <MessageCircle className="h-6 w-6" /> Chat on WhatsApp
              </a>
            </div>

            {/* Form */}
            <div>
              <div className="glass p-10 rounded-3xl shadow-2xl">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-primary mb-2">Message Sent!</h2>
                    <p className="text-slate-500 mb-8">Thank you for contacting us. We will get back to you soon.</p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-secondary font-bold hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-primary mb-8">Send a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={form.name}
                          onChange={(e) => setForm({...form, name: e.target.value})}
                          className="w-full" 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                          <input 
                            type="email" 
                            required
                            value={form.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                            className="w-full" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                          <input 
                            type="tel" 
                            required
                            value={form.phone}
                            onChange={(e) => setForm({...form, phone: e.target.value})}
                            className="w-full" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                        <input 
                          type="text" 
                          value={form.subject}
                          onChange={(e) => setForm({...form, subject: e.target.value})}
                          className="w-full" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
                        <textarea 
                          rows={5} 
                          required
                          value={form.message}
                          onChange={(e) => setForm({...form, message: e.target.value})}
                          className="w-full"
                        ></textarea>
                      </div>
                      <button 
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send Message'} <Send className="h-5 w-5" />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[500px] w-full bg-slate-200">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3591.673894451458!2d83.1234567!3d26.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDAwJzQ0LjQiTiA4M8KwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen 
          loading="lazy"
          title="School Location"
        ></iframe>
      </section>
    </div>
  );
};
