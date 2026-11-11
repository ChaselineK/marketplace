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

      const data = new FormData();
      data.append('vendor_id', formData.vendor_id);
      if (formData.order_id) data.append('order_id', formData.order_id);
      data.append('subject', formData.subject);
      data.append('description', formData.description);
      data.append('priority', formData.priority);

      attachments.forEach((file) => {
        data.append('attachments[]', file);
      });

      const res = await apiClient.post('/tickets', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowModal(false);
      setFormData({ vendor_id: '', order_id: '', subject: '', description: '', priority: 'normal' });
      setAttachments([]);
      navigate(`/app/tickets/${res.data.data.public_reference}`);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit ticket. Please check input.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </span>
        );
      case 'waiting_for_customer':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-torch-50 text-torch-700 border border-torch-200">
            Action Required
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cream-200 text-stone-700 border border-cream-300">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cream-200 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[11px] font-bold text-torch-700 bg-torch-50 px-2 py-0.5 rounded border border-torch-200">Urgent</span>;
      case 'high':
        return <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">High</span>;
      case 'low':
        return <span className="text-[11px] font-semibold text-stone-500 bg-cream-200 px-2 py-0.5 rounded">Low</span>;
      default:
        return <span className="text-[11px] font-semibold text-stone-700 bg-cream-200 px-2 py-0.5 rounded border border-cream-300">Normal</span>;
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="bg-white border border-cream-300 rounded-xl p-6 mb-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-torch-700 bg-torch-50 px-2.5 py-1 rounded border border-torch-200">
                Customer Support &amp; Disputes
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                Support Tickets
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Open tickets directly with vendors and upload private evidence screenshots.
              </p>
            </div>

            <button
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-torch-500 hover:bg-torch-600 text-white rounded text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Open Support Ticket
            </button>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 pt-6 border-t border-cream-200 flex items-center space-x-1.5 overflow-x-auto text-xs font-medium">
            {['all', 'open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded capitalize whitespace-nowrap transition-colors ${
                  statusFilter === tab
                    ? 'bg-torch-500 text-white font-semibold shadow-xs'
                    : 'bg-cream-200 text-stone-700 hover:text-torch-600'
                }`}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-sm text-stone-500 font-medium">Loading support tickets...</div>
        ) : error ? (
          <div className="p-4 bg-torch-50 border border-torch-200 rounded-xl text-sm text-torch-800 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-torch-600" />
            {error}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white border border-cream-300 rounded-xl p-12 text-center shadow-xs">
            <LifeBuoy className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-900">No support tickets</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">
              {statusFilter === 'all'
                ? 'You have not submitted any support tickets.'
                : `No tickets found matching "${statusFilter.replace(/_/g, ' ')}".`}
            </p>
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-torch-500 text-white rounded text-xs font-semibold hover:bg-torch-600 shadow-xs transition-colors"
            >
              Submit a Ticket
            </button>
          </div>
        ) : (
          <div className="bg-white border border-cream-300 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-cream-200 text-left text-sm">
                <thead className="bg-cream-100 text-stone-700 text-xs uppercase font-semibold">
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
                <tbody className="divide-y divide-cream-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-cream-50/75 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-torch-700 text-xs">
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
                          className="inline-flex items-center font-semibold text-torch-700 hover:text-torch-800 bg-cream-200 hover:bg-cream-300 px-3 py-1.5 rounded transition-colors"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto border border-cream-300">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <h3 className="text-base font-bold text-stone-900">Open New Support Ticket</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-base font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-torch-50 border border-torch-200 rounded text-xs text-torch-800 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 mt-0.5 text-torch-600" />
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
                    className="w-full px-3 py-2 border border-cream-300 rounded text-xs bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800"
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
                      className="w-full px-3 py-2 border border-cream-300 rounded text-xs bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 font-mono text-stone-800"
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

                {/* Priority */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-cream-300 rounded text-xs bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800"
                  >
                    <option value="low">Low - General Question</option>
                    <option value="normal">Normal - Standard Verification</option>
                    <option value="high">High - Credential Issue</option>
                    <option value="urgent">Urgent - Transaction Discrepancy</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of the problem..."
                    className="w-full px-3 py-2 border border-cream-300 rounded text-xs bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Detailed Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full context, chat logs summary, or details for the vendor and moderator..."
                    className="w-full px-3 py-2 border border-cream-300 rounded text-xs bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800"
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Private Evidence Images (Max 5MB each, JPEG/PNG/WebP)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="w-full text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-cream-200 file:text-stone-800 hover:file:bg-cream-300 cursor-pointer"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Evidence is stored privately and accessible only to you, the selected vendor, and Super Admins.
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-3 border-t border-cream-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-2 px-3 border border-cream-300 rounded text-xs font-semibold text-stone-700 hover:bg-cream-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-1/2 py-2 px-3 bg-torch-500 hover:bg-torch-600 text-white rounded text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Customer Support &amp; Disputes.</p>
      </footer>
    </div>
  );
}
