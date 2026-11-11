import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import {
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Send,
  Shield,
  Download,
  ChevronRight,
  Filter,
  Loader2,
} from 'lucide-react';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');

  // Active Ticket
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchVendors = async () => {
    try {
      const res = await apiClient.get('/admin/vendors');
      setVendors(res.data.data);
    } catch (err) {
      console.warn('Failed to load vendors for filter', err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/tickets', {
        params: {
          status: statusFilter || undefined,
          vendor_id: vendorFilter || undefined,
        },
      });
      setTickets(res.data.data);
      if (res.data.data.length > 0 && !selectedTicket) {
        loadTicketDetail(res.data.data[0].public_reference);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetail = async (ref) => {
    try {
      setDetailLoading(true);
      const res = await apiClient.get(`/admin/tickets/${ref}`);
      setSelectedTicket(res.data.data);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, vendorFilter]);

  const handleUpdateStatus = async (targetStatus) => {
    if (!selectedTicket) return;

    try {
      const res = await apiClient.patch(`/admin/tickets/${selectedTicket.public_reference}`, {
        status: targetStatus,
      });

      setSelectedTicket(res.data.data);
      setTickets((prev) =>
        prev.map((t) => (t.id === res.data.data.id ? res.data.data : t))
      );
      setActionSuccess(`Admin updated status to ${targetStatus}.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setSubmittingReply(true);
      const formData = new FormData();
      formData.append('message', replyText);

      await apiClient.post(`/admin/tickets/${selectedTicket.public_reference}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReplyText('');
      setActionSuccess('Official administrative mediation message posted.');
      setTimeout(() => setActionSuccess(''), 3000);
      loadTicketDetail(selectedTicket.public_reference);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-2.5 h-2.5 mr-1" /> Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-quantum-50 text-quantum-800 border border-quantum-200">
            In Progress
          </span>
        );
      case 'waiting_for_customer':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Waiting Reply
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Resolved
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ice-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-quantum-700 bg-quantum-50 px-2.5 py-1 rounded-full border border-quantum-200">
                Governance &amp; Mediation
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                Support Tickets &amp; Disputes Console
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Arbitrate customer-vendor disputes, inspect transaction claims, and issue platform rulings.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-ice-300 rounded-xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_customer">Waiting for Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="px-3 py-1.5 border border-ice-300 rounded-xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                >
                  <option value="">All Vendors</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vendor_profile?.store_name || v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center shadow-xs">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
            {actionSuccess}
          </div>
        )}

        {/* Master-Detail Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tickets Queue */}
          <div className="lg:col-span-5 space-y-3">
            <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-stone-400">Moderation Queue</span>
                <div className="font-bold text-stone-900 text-sm mt-0.5">
                  {tickets.length} Active Inquiries
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm font-medium">
                <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mx-auto mb-2" />
                <p className="text-stone-700">Loading inquiries...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center text-xs text-stone-500">
                No tickets matching current filters.
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => loadTicketDetail(t.public_reference)}
                    className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all ${
                      selectedTicket?.public_reference === t.public_reference
                        ? 'border-quantum-500 ring-2 ring-quantum-200 bg-quantum-50/40'
                        : 'hover:border-quantum-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-quantum-700 text-xs">
                        {t.public_reference}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>

                    <div className="font-semibold text-stone-900 text-xs line-clamp-1 mb-1">
                      {t.subject}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span>Store: <strong>{t.vendor?.store_name}</strong></span>
                      <span className="font-mono">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Active Arbitrated Ticket */}
          <div className="lg:col-span-7 space-y-4">
            {detailLoading ? (
              <div className="glass-panel rounded-2xl p-12 text-center text-sm font-medium">
                <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mx-auto mb-2" />
                <p className="text-stone-700">Loading mediation detail...</p>
              </div>
            ) : selectedTicket ? (
              <div className="space-y-4">
                {/* Header Information */}
                <div className="glass-panel-elevated rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-ice-200">
                    <div>
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="font-mono font-bold text-quantum-700 text-xs">
                          {selectedTicket.public_reference}
                        </span>
                        {getStatusBadge(selectedTicket.status)}
                      </div>
                      <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                        {selectedTicket.subject}
                      </h2>
                      <div className="text-xs text-stone-500 mt-1 space-x-3">
                        <span>Customer: <strong>{selectedTicket.customer?.name}</strong></span>
                        <span>Vendor: <strong>{selectedTicket.vendor?.store_name}</strong></span>
                      </div>
                    </div>

                    {/* Status Override Controls */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateStatus('in_progress')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-quantum-50 text-quantum-700 border border-quantum-200 hover:bg-quantum-100"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('resolved')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('closed')}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Initial Claim */}
                  <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed bg-ice-50/70 p-4 rounded-xl border border-ice-200">
                    {selectedTicket.description}
                  </div>

                  {/* Attachments */}
                  {selectedTicket.attachments?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                        Claim Attachments
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1 bg-white border border-ice-300 rounded-lg text-xs font-medium text-stone-800 hover:text-quantum-600 shadow-2xs"
                          >
                            <Paperclip className="w-3 h-3 mr-1 text-quantum-600" />
                            {att.file_name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Audit & Discussion Thread */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Dispute Thread Activity ({selectedTicket.messages?.length || 0})
                  </h3>

                  {selectedTicket.messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`glass-panel p-4 rounded-2xl ${
                        msg.sender?.role === 'super_admin'
                          ? 'border-quantum-300 bg-quantum-50/40'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-ice-200 mb-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-stone-900">{msg.sender?.name}</span>
                          <span className="text-[10px] font-mono text-quantum-700 uppercase">
                            ({msg.sender?.role})
                          </span>
                        </div>
                        <span className="text-stone-400 font-mono text-[10px]">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-800 whitespace-pre-line leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mediation Reply Box */}
                {selectedTicket.status !== 'closed' && (
                  <div className="glass-panel-elevated rounded-2xl p-5 shadow-xs">
                    <form onSubmit={handleReplySubmit} className="space-y-3">
                      <textarea
                        required
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write administrative determination or mediation instruction visible to both parties..."
                        className="w-full px-3 py-2 border border-ice-300 rounded-xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingReply || !replyText.trim()}
                          className="inline-flex items-center px-4 py-2 glass-button text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          Post Ruling Message
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center text-xs text-stone-500">
                Select a ticket from the left queue to review and arbitrate.
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Administrative Disputes.</p>
      </footer>
    </div>
  );
}
