import React, { useState, useEffect } from 'react';
import { packagesAPI, destinationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  Search,
  Clock,
  AlertTriangle,
} from 'lucide-react';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    destinationId: '',
    durationDays: 7,
    durationNights: 6,
    pricePerPerson: '',
    maxCapacity: 16,
    category: 'Cultural',
    season: 'Year-Round',
    imageUrl: '',
    itineraryText: 'Day 1: Arrival & Welcome Dinner\nDay 2: Guided Historical Walking Tour\nDay 3: Nature Excursion & Sunset Cruise',
    includedServices: '5-Star Lodging, All Breakfasts, Certified Guide, Private Transport',
    excludedServices: 'International Airfare, Travel Insurance',
    isFeatured: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        packagesAPI.getAll({ limit: 100 }),
        destinationsAPI.getAll({ limit: 100 }),
      ]);
      if (pRes.data?.success) setPackages(pRes.data.data);
      if (dRes.data?.success) setDestinations(dRes.data.data);
    } catch (err) {
      showToast('Failed to load packages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormData({
      title: '',
      destinationId: destinations[0]?.id || '',
      durationDays: 7,
      durationNights: 6,
      pricePerPerson: '',
      maxCapacity: 16,
      category: 'Cultural',
      season: 'Year-Round',
      imageUrl: '',
      itineraryText: 'Day 1: Arrival & Welcome Dinner\nDay 2: Guided Historical Walking Tour\nDay 3: Nature Excursion & Sunset Cruise',
      includedServices: '5-Star Lodging, All Breakfasts, Certified Guide, Private Transport',
      excludedServices: 'International Airfare, Travel Insurance',
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    const itineraryStr = Array.isArray(pkg.itinerary)
      ? pkg.itinerary.map((d) => `Day ${d.day}: ${d.title} - ${d.description}`).join('\n')
      : '';

    setFormData({
      title: pkg.title,
      destinationId: pkg.destinationId,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      pricePerPerson: pkg.pricePerPerson,
      maxCapacity: pkg.maxCapacity,
      category: pkg.category,
      season: pkg.season || '',
      imageUrl: pkg.imageUrl,
      itineraryText: itineraryStr,
      includedServices: Array.isArray(pkg.includedServices) ? pkg.includedServices.join(', ') : '',
      excludedServices: Array.isArray(pkg.excludedServices) ? pkg.excludedServices.join(', ') : '',
      isFeatured: !!pkg.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Parse structured itinerary from text lines
      const itineraryLines = formData.itineraryText.split('\n').filter(Boolean);
      const itinerary = itineraryLines.map((line, idx) => {
        const parts = line.split(':');
        const title = parts.length > 1 ? parts[1].trim() : line.trim();
        return {
          day: idx + 1,
          title: title.split('-')[0].trim(),
          description: title.split('-')[1]?.trim() || title,
        };
      });

      const payload = {
        title: formData.title,
        destinationId: formData.destinationId,
        durationDays: parseInt(formData.durationDays, 10) || 1,
        durationNights: parseInt(formData.durationNights, 10) || 1,
        pricePerPerson: parseFloat(formData.pricePerPerson) || 0,
        maxCapacity: parseInt(formData.maxCapacity, 10) || 10,
        category: formData.category,
        season: formData.season,
        imageUrl: formData.imageUrl,
        itinerary: itinerary.length > 0 ? itinerary : [{ day: 1, title: 'Arrival', description: 'Check-in and welcome.' }],
        includedServices: formData.includedServices.split(',').map((s) => s.trim()).filter(Boolean),
        excludedServices: formData.excludedServices.split(',').map((s) => s.trim()).filter(Boolean),
        isFeatured: formData.isFeatured,
      };

      if (editingPackage) {
        await packagesAPI.update(editingPackage.id, payload);
        showToast('Package updated successfully!', 'success');
      } else {
        await packagesAPI.create(payload);
        showToast('Package created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save travel package.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    setSaving(true);
    try {
      await packagesAPI.delete(packageToDelete.id);
      showToast('Package deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete package.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = packages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Travel Packages</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure guided expeditions, capacity limits, and inclusive travel rates.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Travel Package
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter packages by title..."
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
                  <th className="py-3.5 px-4">Package Title</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Price / Person</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Booked / Capacity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.title}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                      />
                      <span className="font-bold text-white text-sm">{pkg.title}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{pkg.destination?.name}</td>
                    <td className="py-3 px-4">
                      {pkg.durationDays}D / {pkg.durationNights}N
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ${parseFloat(pkg.pricePerPerson).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded-full text-[10px] font-bold text-accent-400">
                        {pkg.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {pkg.bookedCount} / {pkg.maxCapacity}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Edit Package"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setPackageToDelete(pkg);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-400 rounded-lg transition-colors"
                        title="Delete Package"
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

      {/* Package Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackage ? 'Edit Travel Package' : 'Create Travel Package'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          <div>
            <label className="font-bold block mb-1">Package Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Kyoto Cultural Heritage & Tea Masterclasses"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Destination</label>
              <select
                required
                value={formData.destinationId}
                onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="">-- Choose Destination --</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.country})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1">Price Per Person ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.pricePerPerson}
                onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
                placeholder="1450.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="font-bold block mb-1">Days</label>
              <input
                type="number"
                min="1"
                required
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Nights</label>
              <input
                type="number"
                min="0"
                required
                value={formData.durationNights}
                onChange={(e) => setFormData({ ...formData, durationNights: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-xl bg-white"
              >
                <option value="Cultural">Cultural</option>
                <option value="Adventure">Adventure</option>
                <option value="Romantic">Romantic</option>
                <option value="Luxury">Luxury</option>
              </select>
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
            <label className="font-bold block mb-1">Daily Itinerary (one line per day)</label>
            <textarea
              rows={4}
              required
              value={formData.itineraryText}
              onChange={(e) => setFormData({ ...formData, itineraryText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Included Services (comma-separated)</label>
              <textarea
                rows={2}
                value={formData.includedServices}
                onChange={(e) => setFormData({ ...formData, includedServices: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Excluded Services (comma-separated)</label>
              <textarea
                rows={2}
                value={formData.excludedServices}
                onChange={(e) => setFormData({ ...formData, excludedServices: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
              />
            </div>
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
              {saving ? 'Saving...' : editingPackage ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Package Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Package Deletion"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              Permanently delete package <strong>{packageToDelete?.title}</strong>?
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
              {saving ? 'Deleting...' : 'Delete Package'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPackages;
