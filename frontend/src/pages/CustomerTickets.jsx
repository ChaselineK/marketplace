import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Paperclip,
  X,
  Store,
  Loader2,
} from 'lucide-react';

export default function CustomerTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    vendor_id: '',
    order_id: '',
    subject: '',
    description: '',
    priority: 'normal',
  });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tickets');
      setTickets(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load support tickets.');
    } finally {
      setLoading(false);
    }
  };

  const loadVendorsAndOrders = async () => {
    try {
      const [vendorRes, orderRes] = await Promise.allSettled([
        apiClient.get('/vendors'),
        apiClient.get('/orders'),
      ]);
      if (vendorRes.status === 'fulfilled') setVendors(vendorRes.value.data.data || []);
      if (orderRes.status === 'fulfilled') setOrders(orderRes.value.data.data || []);
    } catch (err) {
      console.warn('Failed to load form options:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenModal = () => {
    loadVendorsAndOrders();
    setShowModal(true);
    setFormError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setFormError('Attachments must be valid JPEG, PNG, or WebP images.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Each image must not exceed 5MB in file size.');
        return;
      }
    }
    setAttachments(files);
    setFormError('');
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!formData.vendor_id) {
      setFormError('Please select the vendor this ticket concerns.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const postData = new FormData();
      postData.append('vendor_id', formData.vendor_id);
      if (formData.order_id) postData.append('order_id', formData.order_id);
      postData.append('subject', formData.subject);
      postData.append('description', formData.description);
      postData.append('priority', formData.priority);

      attachments.forEach((file) => {
        postData.append('attachments[]', file);
      });

      const res = await apiClient.post('/tickets', postData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowModal(false);
      setFormData({
        vendor_id: '',
        order_id: '',
        subject: '',
        description: '',
        priority: 'normal',
      });
      setAttachments([]);
      navigate(`/app/tickets/${res.data.data.public_reference}`);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setFormError(Object.values(errors)[0][0]);
      } else {
        setFormError(err.response?.data?.message || 'Failed to submit ticket.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-quantum-50 text-quantum-800 border border-quantum-200">
            <Clock className="w-3 h-3 mr-1 text-quantum-600" /> In Progress
          </span>
        );
      case 'waiting_for_customer':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Waiting for Reply
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ice-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Urgent</span>;
      case 'high':
        return <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">High</span>;
      case 'low':
        return <span className="text-[11px] font-semibold text-stone-500 bg-ice-100 px-2 py-0.5 rounded-full">Low</span>;
      default:
        return <span className="text-[11px] font-semibold text-quantum-700 bg-quantum-50 px-2 py-0.5 rounded-full border border-quantum-200">Normal</span>;
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="glass-panel-elevated rounded-2xl p-6 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Support Tickets
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Open tickets directly with vendors and upload private evidence screenshots.
              </p>
            </div>

            <button
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center px-4 py-2.5 glass-button text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Open Support Ticket
            </button>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 pt-6 border-t border-ice-200 flex items-center space-x-1.5 overflow-x-auto text-xs font-medium">
            {['all', 'open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-all ${
                  statusFilter === tab
                    ? 'glass-button font-semibold shadow-xs'
                    : 'bg-white/70 text-stone-700 hover:text-quantum-600'
                }`}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content (Loading, Empty, Populated States) */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium page-transition">
            <div className="glass-panel p-8 rounded-2xl max-w-sm mx-auto flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
              <p className="text-stone-700">Loading support tickets...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-panel p-6 rounded-2xl text-sm text-red-800 border-red-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchTickets}
              className="px-3 py-1.5 glass-button text-xs rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="glass-panel-elevated rounded-2xl p-12 text-center max-w-md mx-auto shadow-xs page-transition">
            <LifeBuoy className="w-12 h-12 text-quantum-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-stone-900">No support tickets</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">
              {statusFilter === 'all'
                ? 'You have not submitted any support tickets.'
                : `No tickets found matching "${statusFilter.replace(/_/g, ' ')}".`}
            </p>
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 glass-button text-xs font-semibold rounded-xl"
            >
              Submit a Ticket
            </button>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ice-200 text-left text-sm">
                <thead className="bg-ice-50/70 text-stone-700 text-xs uppercase font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Reference</th>
                    <th scope="col" className="px-6 py-3.5">Subject</th>
                    <th scope="col" className="px-6 py-3.5">Vendor</th>
                    <th scope="col" className="px-6 py-3.5">Priority</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Date</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-100">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-quantum-700 text-xs">
                          {ticket.public_reference}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900 text-xs sm:text-sm">
                          {ticket.subject}
                        </div>
                        {ticket.order && (
                          <div className="text-[11px] font-mono text-stone-500">
                            Linked Order: {ticket.order.public_reference}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-stone-800">
                        {ticket.vendor?.store_name || ticket.vendor?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-500 font-mono">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <Link
                          to={`/app/tickets/${ticket.public_reference}`}
                          className="inline-flex items-center font-semibold text-quantum-700 hover:text-quantum-900 bg-quantum-50 hover:bg-quantum-100 px-3 py-1.5 rounded-lg border border-quantum-200 transition-colors"
                        >
                          View Thread <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Ticket Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 page-transition">
            <div className="glass-panel-elevated rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-ice-200">
                <h3 className="text-base font-bold text-stone-900">Open New Support Ticket</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-lg font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 mr-1 shrink-0 mt-0.5 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                {/* Vendor Select */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Vendor *</label>
                  <select
                    required
                    value={formData.vendor_id}
                    onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-ice-300 rounded-xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                  >
                    <option value="">Select Vendor Store</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.store_name} (@{v.store_slug})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Optional Order Select */}
                {orders.length > 0 && (
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Related Order (Optional)</label>
                    <select
                      value={formData.order_id}
                      onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                      className="w-full px-3 py-2 border border-ice-300 rounded-xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 font-mono text-stone-800"
                    >
                      <option value="">None / General Inquiry</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.public_reference} &bull; {o.item_title_snapshot} ({o.price_currency} {Number(o.total_price_amount).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Subject */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of the problem..."
                    className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-ice-300 rounded-xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                  >
                    <option value="low">Low &bull; Non-urgent question</option>
                    <option value="normal">Normal &bull; Standard inquiry or fulfillment query</option>
                    <option value="high">High &bull; Delayed delivery or verification failure</option>
                    <option value="urgent">Urgent &bull; Credential issue or dispute</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full context, chat logs summary, or details for the vendor and moderator..."
                    className="w-full px-3 py-2 border border-ice-300 rounded-xl bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Evidence Attachments (Optional, Max 5MB per file)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-quantum-50 file:text-quantum-700 hover:file:bg-quantum-100 cursor-pointer"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center space-x-3 pt-3 border-t border-ice-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-2 px-3 border border-ice-300 rounded-xl font-semibold text-stone-700 hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2 px-3 glass-button text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Customer Support.</p>
      </footer>
    </div>
  );
}
