import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Image as ImageIcon, FileText, LogOut, Plus, Trash2, User, ShieldCheck, Mail, Users, Info, BookOpen, GraduationCap as GradIcon, Home as HomeIcon, Download, Menu, X, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

interface Notice {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  category: string;
  createdAt: string;
}

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface FacultyMember {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  photo: string;
}

interface AboutSection {
  id: string;
  title: string;
  content: string;
  iconName: string;
}

interface InfrastructureItem {
  id: string;
  title: string;
  description: string;
}

interface AcademicStream {
  id: string;
  title: string;
  description: string;
  subjects: string[];
}

interface AcademicLevel {
  id: string;
  title: string;
  classes: string;
  focus: string;
}

interface AdmissionStep {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
}

interface AdmissionDocument {
  id: string;
  name: string;
}

interface HomeHighlight {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

interface AdminData {
  notices: Notice[];
  gallery: GalleryItem[];
  enquiries: Enquiry[];
  subscriptions: { id: string, email: string, createdAt: string }[];
  faculty: FacultyMember[];
  aboutSections: AboutSection[];
  infrastructure: InfrastructureItem[];
  academicStreams: AcademicStream[];
  academicLevels: AcademicLevel[];
  admissionSteps: AdmissionStep[];
  admissionDocuments: AdmissionDocument[];
  homeHighlights: HomeHighlight[];
}

export const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('notices');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [data, setData] = useState<AdminData>({ 
    notices: [], 
    gallery: [], 
    enquiries: [], 
    subscriptions: [],
    faculty: [],
    aboutSections: [],
    infrastructure: [],
    academicStreams: [],
    academicLevels: [],
    admissionSteps: [],
    admissionDocuments: [],
    homeHighlights: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', isImportant: false });
  const [galleryForm, setGalleryForm] = useState({ imageUrl: '', caption: '', category: 'Campus' });
  const [facultyForm, setFacultyForm] = useState({ name: '', subject: '', qualification: '', photo: '' });
  const [aboutForm, setAboutForm] = useState({ title: '', content: '', iconName: 'History' });
  const [infraForm, setInfraForm] = useState({ title: '', description: '' });
  const [streamForm, setStreamForm] = useState({ title: '', description: '', subjects: '' });
  const [levelForm, setLevelForm] = useState({ title: '', classes: '', focus: '' });
  const [stepForm, setStepForm] = useState({ title: '', description: '', orderIndex: 0 });
  const [docForm, setDocForm] = useState({ name: '' });
  const [highlightForm, setHighlightForm] = useState({ title: '', description: '', iconName: 'Users' });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [
        notices, gallery, enquiries, subscriptions, 
        faculty, aboutSections, infrastructure, academicStreams, academicLevels, 
        admissionSteps, admissionDocuments, homeHighlights
      ] = await Promise.all([
        api.get<Notice[]>('/api/notices'),
        api.get<GalleryItem[]>('/api/gallery'),
        api.get<Enquiry[]>('/api/enquiries', { headers }),
        api.get<{ id: string, email: string, createdAt: string }[]>('/api/subscriptions', { headers }),
        api.get<FacultyMember[]>('/api/faculty'),
        api.get<AboutSection[]>('/api/about-sections'),
        api.get<InfrastructureItem[]>('/api/infrastructure'),
        api.get<AcademicStream[]>('/api/academic-streams'),
        api.get<AcademicLevel[]>('/api/academic-levels'),
        api.get<AdmissionStep[]>('/api/admission-steps'),
        api.get<AdmissionDocument[]>('/api/admission-documents'),
        api.get<HomeHighlight[]>('/api/home-highlights')
      ]);

      setData({
        notices, gallery, enquiries, subscriptions,
        faculty, aboutSections, infrastructure, academicStreams, academicLevels,
        admissionSteps, admissionDocuments, homeHighlights
      });
    } catch (err) {
      console.error("Error fetching admin data:", err);
      if (err instanceof Error && err.message.includes('401')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsLoggedIn(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await api.post<{ token: string, user: { email: string } }>('/api/admin/login', { email, password });
      localStorage.setItem('admin_token', data.token);
      setIsLoggedIn(true);
      fetchData();
    } catch (err: unknown) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) return;
    const token = localStorage.getItem('admin_token');
    try {
      await api.post('/api/notices', noticeForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNoticeForm({ title: '', content: '', isImportant: false });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error adding notice');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await api.delete(`/api/notices/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error deleting notice');
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.imageUrl) return;
    const token = localStorage.getItem('admin_token');
    try {
      await api.post('/api/gallery', galleryForm, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGalleryForm({ imageUrl: '', caption: '', category: 'Campus' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error adding gallery item');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await api.delete(`/api/gallery/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error deleting gallery item');
    }
  };

  const handleExportEnquiries = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const blob = await api.blob('/api/enquiries/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (blob.size === 0) {
        throw new Error('Received an empty file from the server');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Export error:", err);
      alert(err instanceof Error ? err.message : 'Error exporting enquiries. Please try again.');
    }
  };

  const handleAddGeneric = async (endpoint: string, form: Record<string, string | number | boolean | string[]>, setForm: (val: Record<string, string | number | boolean | string[]>) => void) => {
    const token = localStorage.getItem('admin_token');
    try {
      await api.post(`/api/${endpoint}`, form, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setForm(Object.keys(form).reduce((acc: Record<string, string | number | boolean | string[]>, key) => {
        acc[key] = typeof form[key] === 'number' ? 0 : (typeof form[key] === 'boolean' ? false : '');
        return acc;
      }, {}));
      fetchData();
    } catch (err) {
      console.error(err);
      alert(`Error adding ${endpoint}`);
    }
  };

  const handleDeleteGeneric = async (endpoint: string, id: string) => {
    if (!window.confirm(`Are you sure you want to delete this item?`)) return;
    const token = localStorage.getItem('admin_token');
    try {
      await api.delete(`/api/${endpoint}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(`Error deleting ${endpoint}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-10 rounded-3xl w-full max-w-md shadow-2xl"
        >
          <div className="text-center mb-8">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary">Admin Login</h1>
            <p className="text-slate-500 text-sm">K N Singh Inter College</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg">
              Login to Dashboard
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed">
              Use your registered administrator email to access the management panel.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-primary text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-secondary" />
          <span className="font-bold tracking-tight">Admin Panel</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-40 lg:relative lg:z-auto lg:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-primary text-white flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 text-center border-b border-white/10 hidden lg:block">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-xs text-slate-400 mt-1">School Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'notices', icon: Bell, label: 'Notices' },
            { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
            { id: 'enquiries', icon: FileText, label: 'Enquiries' },
            { id: 'subscriptions', icon: Mail, label: 'Subscriptions' },
            { id: 'faculty', icon: Users, label: 'Faculty' },
            { id: 'about', icon: Info, label: 'About' },
            { id: 'academics', icon: BookOpen, label: 'Academics' },
            { id: 'admissions', icon: GradIcon, label: 'Admissions' },
            { id: 'home', icon: HomeIcon, label: 'Home' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-secondary text-white' : 'hover:bg-white/10'}`}
            >
              <tab.icon className="h-5 w-5" /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-red-400 transition-all">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary capitalize">{activeTab} Management</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                System Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary">Admin Account</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-primary shadow-inner">
              <User size={20} />
            </div>
          </div>
        </header>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-medium flex items-center gap-3"
          >
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            {error}
          </motion.div>
        )}

        {activeTab === 'notices' && (
          <div className="space-y-8">
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add New Notice</h2>
              <form onSubmit={handleAddNotice} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Notice Title" 
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})}
                  className="w-full"
                />
                <textarea 
                  placeholder="Notice Content" 
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({...noticeForm, content: e.target.value})}
                  className="w-full"
                ></textarea>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={noticeForm.isImportant}
                    onChange={(e) => setNoticeForm({...noticeForm, isImportant: e.target.checked})}
                    className="rounded text-secondary focus:ring-secondary"
                  />
                  <span className="text-sm font-bold text-slate-600">Mark as Important</span>
                </label>
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all">
                  Post Notice
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.notices.map((notice) => (
                <div key={notice.id} className="bg-white p-6 rounded-2xl flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-primary">{notice.title}</h3>
                    <p className="text-xs text-slate-400">{new Date(notice.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDeleteNotice(notice.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8">
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Gallery Item</h2>
              <form onSubmit={handleAddGallery} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Image URL" 
                  value={galleryForm.imageUrl}
                  onChange={(e) => setGalleryForm({...galleryForm, imageUrl: e.target.value})}
                  className="w-full"
                />
                <select 
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({...galleryForm, category: e.target.value})}
                  className="w-full"
                >
                  <option value="Campus">Campus</option>
                  <option value="Events">Events</option>
                  <option value="Sports">Sports</option>
                  <option value="Celebrations">Celebrations</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Caption" 
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({...galleryForm, caption: e.target.value})}
                  className="w-full md:col-span-2"
                />
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all w-fit">
                  Upload Item
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.gallery.map((item) => (
                <div key={item.id} className="relative group rounded-2xl overflow-hidden aspect-square">
                  <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleDeleteGallery(item.id)} className="p-3 bg-red-500 text-white rounded-full">
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={handleExportEnquiries}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
              >
                <Download className="h-5 w-5" /> Download Excel
              </button>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Phone</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Message</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary">{enq.name}</td>
                      <td className="px-6 py-4 text-slate-600">{enq.email}</td>
                      <td className="px-6 py-4 text-slate-600">{enq.phone}</td>
                      <td className="px-6 py-4 text-sm font-medium">{enq.subject}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{enq.message}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{new Date(enq.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeleteGeneric('enquiries', enq.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[400px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{sub.email}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteGeneric('subscriptions', sub.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'faculty' && (
          <div className="space-y-8">
            <div className="glass p-4 md:p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Faculty Member</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddGeneric('faculty', facultyForm, setFacultyForm); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Name" value={facultyForm.name} onChange={(e) => setFacultyForm({...facultyForm, name: e.target.value})} className="w-full" />
                <input type="text" placeholder="Subject" value={facultyForm.subject} onChange={(e) => setFacultyForm({...facultyForm, subject: e.target.value})} className="w-full" />
                <input type="text" placeholder="Qualification" value={facultyForm.qualification} onChange={(e) => setFacultyForm({...facultyForm, qualification: e.target.value})} className="w-full" />
                <input type="text" placeholder="Photo URL" value={facultyForm.photo} onChange={(e) => setFacultyForm({...facultyForm, photo: e.target.value})} className="w-full" />
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all w-fit">Add Member</button>
              </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.faculty.map((f) => (
                <div key={f.id} className="bg-white p-6 rounded-2xl flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={f.photo} alt={f.name} className="h-12 w-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h3 className="font-bold text-primary">{f.name}</h3>
                      <p className="text-xs text-slate-400">{f.subject}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteGeneric('faculty', f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-12">
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add About Section</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddGeneric('about-sections', aboutForm, setAboutForm); }} className="space-y-4">
                <input type="text" placeholder="Title" value={aboutForm.title} onChange={(e) => setAboutForm({...aboutForm, title: e.target.value})} className="w-full" />
                <textarea placeholder="Content" rows={4} value={aboutForm.content} onChange={(e) => setAboutForm({...aboutForm, content: e.target.value})} className="w-full" />
                <select value={aboutForm.iconName} onChange={(e) => setAboutForm({...aboutForm, iconName: e.target.value})} className="w-full">
                  <option value="History">History</option>
                  <option value="Target">Mission</option>
                  <option value="Eye">Vision</option>
                </select>
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all">Add Section</button>
              </form>
              <div className="mt-8 space-y-4">
                {data.aboutSections.map((s) => (
                  <div key={s.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="font-bold">{s.title}</span>
                    <button onClick={() => handleDeleteGeneric('about-sections', s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Infrastructure</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddGeneric('infrastructure', infraForm, setInfraForm); }} className="space-y-4">
                <input type="text" placeholder="Title" value={infraForm.title} onChange={(e) => setInfraForm({...infraForm, title: e.target.value})} className="w-full" />
                <input type="text" placeholder="Description" value={infraForm.description} onChange={(e) => setInfraForm({...infraForm, description: e.target.value})} className="w-full" />
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all">Add Item</button>
              </form>
              <div className="mt-8 space-y-4">
                {data.infrastructure.map((i) => (
                  <div key={i.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="font-bold">{i.title}</span>
                    <button onClick={() => handleDeleteGeneric('infrastructure', i.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'academics' && (
          <div className="space-y-12">
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Academic Stream</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddGeneric('academic-streams', { ...streamForm, subjects: streamForm.subjects.split(',').map(s => s.trim()) }, setStreamForm); }} className="space-y-4">
                <input type="text" placeholder="Stream Title" value={streamForm.title} onChange={(e) => setStreamForm({...streamForm, title: e.target.value})} className="w-full" />
                <input type="text" placeholder="Description" value={streamForm.description} onChange={(e) => setStreamForm({...streamForm, description: e.target.value})} className="w-full" />
                <input type="text" placeholder="Subjects (comma separated)" value={streamForm.subjects} onChange={(e) => setStreamForm({...streamForm, subjects: e.target.value})} className="w-full" />
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all">Add Stream</button>
              </form>
              <div className="mt-8 space-y-4">
                {data.academicStreams.map((s) => (
                  <div key={s.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="font-bold">{s.title}</span>
                    <button onClick={() => handleDeleteGeneric('academic-streams', s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Academic Level</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddGeneric('academic-levels', levelForm, setLevelForm); }} className="space-y-4">
                <input type="text" placeholder="Level Title (e.g. High School)" value={levelForm.title} onChange={(e) => setLevelForm({...levelForm, title: e.target.value})} className="w-full" />
                <input type="text" placeholder="Classes (e.g. Class 9th & 10th)" value={levelForm.classes} onChange={(e) => setLevelForm({...levelForm, classes: e.target.value})} className="w-full" />
                <input type="text" placeholder="Focus" value={levelForm.focus} onChange={(e) => setLevelForm({...levelForm, focus: e.target.value})} className="w-full" />
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all">Add Level</button>
              </form>
              <div className="mt-8 space-y-4">
                {data.academicLevels.map((l) => (
                  <div key={l.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="font-bold">{l.title}</span>
                    <button onClick={() => handleDeleteGeneric('academic-levels', l.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admissions' && (
          <div className="space-y-12">
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Admission Step</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddGeneric('admission-steps', stepForm, setStepForm); }} className="space-y-4">
                <input type="text" placeholder="Step Title" value={stepForm.title} onChange={(e) => setStepForm({...stepForm, title: e.target.value})} className="w-full" />
                <input type="text" placeholder="Description" value={stepForm.description} onChange={(e) => setStepForm({...stepForm, description: e.target.value})} className="w-full" />
                <input type="number" placeholder="Order Index" value={stepForm.orderIndex} onChange={(e) => setStepForm({...stepForm, orderIndex: parseInt(e.target.value)})} className="w-full" />
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all">Add Step</button>
              </form>
              <div className="mt-8 space-y-4">
                {data.admissionSteps.map((s) => (
                  <div key={s.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="font-bold">{s.title}</span>
                    <button onClick={() => handleDeleteGeneric('admission-steps', s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Required Document</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddGeneric('admission-documents', docForm, setDocForm); }} className="space-y-4">
                <input type="text" placeholder="Document Name" value={docForm.name} onChange={(e) => setDocForm({...docForm, name: e.target.value})} className="w-full" />
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all">Add Document</button>
              </form>
              <div className="mt-8 space-y-4">
                {data.admissionDocuments.map((d) => (
                  <div key={d.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="font-bold">{d.name}</span>
                    <button onClick={() => handleDeleteGeneric('admission-documents', d.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="space-y-12">
            <div className="glass p-8 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="h-5 w-5" /> Add Home Highlight</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAddGeneric('home-highlights', highlightForm, setHighlightForm); }} className="space-y-4">
                <input type="text" placeholder="Title" value={highlightForm.title} onChange={(e) => setHighlightForm({...highlightForm, title: e.target.value})} className="w-full" />
                <input type="text" placeholder="Description" value={highlightForm.description} onChange={(e) => setHighlightForm({...highlightForm, description: e.target.value})} className="w-full" />
                <select value={highlightForm.iconName} onChange={(e) => setHighlightForm({...highlightForm, iconName: e.target.value})} className="w-full">
                  <option value="Users">Users</option>
                  <option value="BookOpen">Education</option>
                  <option value="Award">Affiliation</option>
                  <option value="Trophy">Sports</option>
                </select>
                <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-opacity-90 transition-all">Add Highlight</button>
              </form>
              <div className="mt-8 space-y-4">
                {data.homeHighlights.map((h) => (
                  <div key={h.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <span className="font-bold">{h.title}</span>
                    <button onClick={() => handleDeleteGeneric('home-highlights', h.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
