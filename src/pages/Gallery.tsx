import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Camera } from 'lucide-react';
import { api } from '../services/api';

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  category: string;
  createdAt: string;
}

export const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await api.get<GalleryItem[]>('/api/gallery');
        setItems(data);
      } catch (err) {
        console.error("Error fetching gallery:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const categories = ['All', 'Campus', 'Events', 'Sports', 'Celebrations'];

  const filteredItems = filter === 'All' ? items : items.filter((item) => item.category === filter);

  return (
    <div className="pt-24">
      <section className="bg-primary py-20 text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4"
        >
          School Gallery
        </motion.h1>
        <div className="h-1.5 w-24 bg-secondary mx-auto rounded-full"></div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  filter === cat ? 'bg-secondary text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 flex justify-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredItems.length > 0 ? filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={item.id}
                className="group relative rounded-3xl overflow-hidden shadow-lg cursor-pointer aspect-square"
                onClick={() => setSelectedImage(item)}
              >
                <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-6">
                  <ZoomIn className="h-10 w-10 mb-4" />
                  <p className="text-center font-bold">{item.caption}</p>
                  <span className="text-xs mt-2 bg-secondary px-2 py-1 rounded-full uppercase tracking-wider">{item.category}</span>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-3 text-center py-24 text-slate-400">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No images found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-white hover:text-secondary">
              <X className="h-10 w-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedImage.imageUrl} alt={selectedImage.caption} className="w-full h-auto rounded-2xl shadow-2xl" referrerPolicy="no-referrer" />
              <div className="mt-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.caption}</h3>
                <p className="text-secondary font-bold uppercase tracking-widest text-sm">{selectedImage.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
