import React, { useState, useEffect } from 'react';
import { destinationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    continent: 'Asia',
    description: '',
    imageUrl: '',
    priceEstimate: '',
    bestTimeToVisit: '',
    currency: '',
    language: '',
    isFeatured: false,
  });

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await destinationsAPI.getAll({ limit: 100 });
      if (res.data?.success) {
        setDestinations(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load destinations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      country: '',
      continent: 'Asia',
      description: '',
      imageUrl: '',
      priceEstimate: '',
      bestTimeToVisit: '',
      currency: '',
      language: '',
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dest) => {
    setEditingItem(dest);
    setFormData({
      name: dest.name,
      country: dest.country,
      continent: dest.continent || 'Asia',
      description: dest.description,
      imageUrl: dest.imageUrl,
      priceEstimate: dest.priceEstimate,
      bestTimeToVisit: dest.bestTimeToVisit || '',
      currency: dest.currency || '',
      language: dest.language || '',
      isFeatured: !!dest.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        priceEstimate: parseFloat(formData.priceEstimate) || 0,
      };

      if (editingItem) {
        await destinationsAPI.update(editingItem.id, payload);
        showToast('Destination updated successfully!', 'success');
      } else {
        await destinationsAPI.create(payload);
        showToast('Destination created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchDestinations();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save destination.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setSaving(true);
    try {
      await destinationsAPI.delete(itemToDelete.id);
      showToast('Destination deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      fetchDestinations();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete destination.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Destinations Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, edit, or configure global destination packages and regional metadata.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name or country..."
          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-soft">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Continent</th>
                  <th className="py-3.5 px-4">Price Estimate</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Hotels/Packages</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={d.imageUrl}
                        alt={d.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{d.name}</p>
                        <p className="text-[11px] text-slate-400">{d.country}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{d.continent}</td>
                    <td className="py-3 px-4 font-bold text-white">
                      ${parseFloat(d.priceEstimate).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {d.isFeatured ? (
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-bold">
                          Featured
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {d.hotels?.length || 0} Hotels • {d.packages?.length || 0} Pkgs
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Edit Destination"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete(d);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-400 rounded-lg transition-colors"
                        title="Delete Destination"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Destination' : 'Add New Destination'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Destination Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Bali"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. Indonesia"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Continent</label>
              <select
                value={formData.continent}
                onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
                <option value="Americas">Americas</option>
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1">Price Estimate ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.priceEstimate}
                onChange={(e) => setFormData({ ...formData, priceEstimate: e.target.value })}
                placeholder="1200.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Cover Image URL</label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Detailed Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Comprehensive summary of attractions, geography, and culture..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold block mb-1">Best Time</label>
              <input
                type="text"
                value={formData.bestTimeToVisit}
                onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                placeholder="May - Oct"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="EUR, IDR"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="English, French"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isFeatured" className="font-bold text-xs">
              Feature prominently on homepage
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingItem ? 'Update Destination' : 'Create Destination'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              Permanently delete destination <strong>{itemToDelete?.name}</strong>?
              This will cascade delete associated hotels and travel packages.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {saving ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDestinations;
