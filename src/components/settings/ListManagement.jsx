import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const presetColors = [
  '#22c55e', '#f97316', '#a855f7', '#3b82f6', 
  '#ec4899', '#eab308', '#06b6d4', '#ef4444',
];

const presetEmojis = ['📝', '💼', '🏠', '👨‍👩‍👧', '🎮', '💪', '🎨', '✈️'];

export default function ListManagement() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#22c55e', icon: '📝' });
  const queryClient = useQueryClient();

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => base44.entities.List.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.List.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      setIsAdding(false);
      setFormData({ name: '', color: '#22c55e', icon: '📝' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.List.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.List.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const handleSave = () => {
    if (!formData.name.trim()) return;
    createMutation.mutate(formData);
  };

  const handleUpdate = (list) => {
    updateMutation.mutate({ id: list.id, data: list });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this list? Subscriptions will remain but be unassigned.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Lists</h3>
          <p className="text-sm text-gray-400">Organize your subscriptions</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 rounded-full bg-green-500/20 hover:bg-green-500/30 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 text-green-400" />
          </button>
        )}
      </div>

      {/* Add new list form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-3xl"
                onClick={() => {
                  const currentIndex = presetEmojis.indexOf(formData.icon);
                  const nextIndex = (currentIndex + 1) % presetEmojis.length;
                  setFormData({ ...formData, icon: presetEmojis[nextIndex] });
                }}
              >
                {formData.icon}
              </button>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="List name"
                className="flex-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="flex gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    formData.color === color ? 'scale-110 ring-2 ring-white' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!formData.name.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ name: '', color: '#22c55e', icon: '📝' });
                }}
                variant="outline"
                className="border-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lists */}
      <div className="space-y-2">
        {lists.map((list) => (
          <motion.div
            key={list.id}
            layout
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            {editingId === list.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{list.icon || '📝'}</span>
                  <Input
                    value={list.name}
                    onChange={(e) => updateMutation.mutate({ 
                      id: list.id, 
                      data: { ...list, name: e.target.value } 
                    })}
                    className="flex-1 bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setEditingId(null)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${list.color}20` }}
                  >
                    {list.icon || '📝'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{list.name}</p>
                    {list.is_default && (
                      <p className="text-xs text-gray-500">Default</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingId(list.id)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  {!list.is_default && (
                    <button
                      onClick={() => handleDelete(list.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}