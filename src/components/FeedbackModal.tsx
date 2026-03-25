import React, { useState } from 'react';
import { Star, X, MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackModalProps {
  complaintId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FeedbackModal({ complaintId, onClose, onSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert('Please select a rating');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/complaints/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ complaint_id: complaintId, rating, comment })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        alert('Feedback submitted successfully');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Rate Service</h3>
          </div>
          <motion.button 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
          >
            <X size={20} />
          </motion.button>
        </div>

        <p className="text-gray-500 text-sm mb-10 text-center font-medium leading-relaxed px-4">
          How would you rate the cleanliness work done for report <span className="text-primary font-black">#{complaintId.toString().padStart(4, '0')}</span>?
        </p>

        <div className="flex justify-center gap-3 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.8 }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="p-1 relative"
            >
              <Star
                size={40}
                className={`${
                  (hover || rating) >= star 
                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                    : 'text-gray-100'
                } transition-all duration-300`}
              />
              {rating === star && (
                <motion.div 
                  layoutId="star-glow"
                  className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="mb-8">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Optional Comment</label>
          <div className="relative group">
            <MessageSquare className="absolute left-4 top-4 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field pl-12 h-28 resize-none pt-4 font-bold text-sm leading-relaxed"
              placeholder="Tell us more about the service..."
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="btn-primary w-full py-5 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          {loading ? (
            <Loader2 className="animate-spin" size={22} />
          ) : (
            <>
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span className="font-black tracking-widest uppercase text-xs">Submit Feedback</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
