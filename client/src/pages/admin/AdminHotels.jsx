import React, { useState, useEffect } from 'react';
import { hotelsAPI, destinationsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import {
  Hotel,
  Plus,
  Pencil,
  Trash2,
  Search,
  Star,
  Bed,
  AlertTriangle,
} from 'lucide-react';

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [activeHotelRooms, setActiveHotelRooms] = useState(null);
  const [saving, setSaving] = useState(false);

  // Hotel form
  const [formData, setFormData] = useState({
    name: '',
    destinationId: '',
    address: '',
    city: '',
    country: '',
    description: '',
    imageUrl: '',
    starRating: 5,
    pricePerNight: '',
    amenities: 'Free WiFi, Infinity Pool, Spa, Airport Shuttle',
    isFeatured: false,
  });

  // Room type form
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    capacity: 2,
    pricePerNight: '',
    bedType: '1 King Bed',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, dRes] = await Promise.all([
        hotelsAPI.getAll({ limit: 100 }),
        destinationsAPI.getAll({ limit: 100 }),
      ]);
      if (hRes.data?.success) setHotels(hRes.data.data);
      if (dRes.data?.success) setDestinations(dRes.data.data);
    } catch (err) {
      showToast('Failed to load hotels data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      destinationId: destinations[0]?.id || '',
      address: '',
      city: '',
      country: '',
      description: '',
      imageUrl: '',
      starRating: 5,
      pricePerNight: '',
      amenities: 'Free WiFi, Infinity Pool, Spa, Airport Shuttle',
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h) => {
    setEditingHotel(h);
    setFormData({
      name: h.name,
      destinationId: h.destinationId,
      address: h.address,
      city: h.city,
      country: h.country,
      description: h.description,
      imageUrl: h.imageUrl,
      starRating: h.starRating,
      pricePerNight: h.pricePerNight,
      amenities: Array.isArray(h.amenities) ? h.amenities.join(', ') : h.amenities,
      isFeatured: !!h.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleSubmitHotel = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        starRating: parseInt(formData.starRating, 10) || 5,
        pricePerNight: parseFloat(formData.pricePerNight) || 0,
        amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editingHotel) {
        await hotelsAPI.update(editingHotel.id, payload);
        showToast('Hotel updated successfully!', 'success');
      } else {
        await hotelsAPI.create(payload);
        showToast('Hotel created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save hotel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!hotelToDelete) return;
    setSaving(true);
    try {
      await hotelsAPI.delete(hotelToDelete.id);
      showToast('Hotel deleted successfully.', 'success');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete hotel.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Rooms management
  const handleOpenRooms = (hotel) => {
    setActiveHotelRooms(hotel);
    setRoomFormData({
      name: '',
      capacity: 2,
      pricePerNight: '',
      bedType: '1 King Bed',
    });
    setIsRoomsModalOpen(true);
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!activeHotelRooms) return;
    setSaving(true);
    try {
      const payload = {
        ...roomFormData,
        capacity: parseInt(roomFormData.capacity, 10) || 2,
        pricePerNight: parseFloat(roomFormData.pricePerNight) || 0,
      };
      await hotelsAPI.addRoom(activeHotelRooms.id, payload);
      showToast('Room type added to hotel catalog!', 'success');
      setRoomFormData({ name: '', capacity: 2, pricePerNight: '', bedType: '1 King Bed' });
      // Refresh current hotel
      const updated = await hotelsAPI.getById(activeHotelRooms.id);
      if (updated.data?.success) {
        setActiveHotelRooms(updated.data.data);
      }
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add room type.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!activeHotelRooms) return;
    try {
      await hotelsAPI.deleteRoom(roomId);
      showToast('Room type removed.', 'success');
      const updated = await hotelsAPI.getById(activeHotelRooms.id);
      if (updated.data?.success) {
        setActiveHotelRooms(updated.data.data);
      }
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove room.', 'error');
    }
  };

  const filtered = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Hotels & Accommodations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage resort catalog, room types, pricing, and amenities inventory.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Hotel
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter hotel by name or city..."
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
                  <th className="py-3.5 px-4">Hotel Property</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Base Nightly Rate</th>
                  <th className="py-3.5 px-4">Room Types</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={h.imageUrl}
                        alt={h.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-white text-sm">{h.name}</p>
                        <p className="text-[11px] text-slate-400">{h.city}, {h.country}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{h.destination?.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {h.starRating}.0
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ${parseFloat(h.pricePerNight).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenRooms(h)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        <Bed className="w-3 h-3 text-primary-400" />
                        {h.roomTypes?.length || 0} Rooms
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(h)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Edit Hotel"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setHotelToDelete(h);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-400 rounded-lg transition-colors"
                        title="Delete Hotel"
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

      {/* Hotel Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHotel ? 'Edit Hotel Property' : 'Add New Hotel'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmitHotel} className="space-y-4 text-xs text-slate-700">
          <div>
            <label className="font-bold block mb-1">Hotel / Resort Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Canaves Oia Suites"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold block mb-1">Destination Region</label>
              <select
                required
                value={formData.destinationId}
                onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="">-- Select Destination --</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.country})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1">Nightly Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.pricePerNight}
                onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                placeholder="250.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-bold block mb-1">City / District</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Oia"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Greece"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">Star Rating</label>
              <select
                value={formData.starRating}
                onChange={(e) => setFormData({ ...formData, starRating: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Street Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Main Street, Caldera Cliff"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
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
            <label className="font-bold block mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">Amenities (comma-separated)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="Free WiFi, Pool, Spa, Airport Shuttle"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
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
              {saving ? 'Saving...' : editingHotel ? 'Update Hotel' : 'Create Hotel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Room Types Modal */}
      <Modal
        isOpen={isRoomsModalOpen}
        onClose={() => setIsRoomsModalOpen(false)}
        title={`Room Types - ${activeHotelRooms?.name}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-6 text-xs text-slate-700">
          {/* Current room types list */}
          <div>
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Existing Rooms Inventory
            </h4>
            {activeHotelRooms?.roomTypes && activeHotelRooms.roomTypes.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                {activeHotelRooms.roomTypes.map((rt) => (
                  <div key={rt.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{rt.name}</p>
                      <p className="text-[11px] text-slate-500">
                        ${parseFloat(rt.pricePerNight).toFixed(2)}/night • {rt.bedType} • {rt.capacity} Guests
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteRoom(rt.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                      title="Remove Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic">No custom room types added yet.</p>
            )}
          </div>

          {/* Add new room type form */}
          <form onSubmit={handleAddRoom} className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider">
              Add New Room Type
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                  placeholder="e.g. Deluxe Sea View Suite"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Nightly Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={roomFormData.pricePerNight}
                  onChange={(e) => setRoomFormData({ ...roomFormData, pricePerNight: e.target.value })}
                  placeholder="350.00"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Bed Configuration</label>
                <input
                  type="text"
                  value={roomFormData.bedType}
                  onChange={(e) => setRoomFormData({ ...roomFormData, bedType: e.target.value })}
                  placeholder="1 King Bed"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Guest Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData({ ...roomFormData, capacity: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {saving ? 'Adding...' : 'Add Room to Hotel'}
            </button>
          </form>
        </div>
      </Modal>

      {/* Delete Hotel Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Hotel Deletion"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              Permanently delete hotel <strong>{hotelToDelete?.name}</strong>?
              This will remove all associated room types and cancel pending hotel reservations.
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
              onClick={handleDeleteHotel}
              disabled={saving}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl disabled:opacity-50"
            >
              {saving ? 'Deleting...' : 'Delete Hotel'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminHotels;
