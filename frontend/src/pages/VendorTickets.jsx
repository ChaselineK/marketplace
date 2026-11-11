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
  Lock,
  ChevronRight,
  User,
} from 'lucide-react';

export default function VendorTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Active Selected Ticket for Detail Pane
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyFiles, setReplyFiles] = useState([]);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/vendor/tickets');
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
      const res = await apiClient.get(`/vendor/tickets/${ref}`);
      setSelectedTicket(res.data.data);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (targetStatus) => {
    if (!selectedTicket) return;

    try {
      const res = await apiClient.patch(`/vendor/tickets/${selectedTicket.public_reference}`, {
        status: targetStatus,
      });

      setSelectedTicket(res.data.data);
      setTickets((prev) =>
        prev.map((t) => (t.id === res.data.data.id ? res.data.data : t))
      );
      setActionSuccess(`Ticket status updated to ${targetStatus}.`);
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
      replyFiles.forEach((f) => formData.append('attachments[]', f));

      await apiClient.post(`/vendor/tickets/${selectedTicket.public_reference}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReplyText('');
      setReplyFiles([]);
      setActionSuccess('Vendor response posted.');
      setTimeout(() => setActionSuccess(''), 3000);
      loadTicketDetail(selectedTicket.public_reference);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Open</span>;
      case 'in_progress':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">In Progress</span>;
      case 'waiting_for_customer':
        return <span className="text-[11px] font-semibold text-torch-700 bg-torch-50 px-2 py-0.5 rounded border border-torch-200">Awaiting Customer</span>;
      case 'resolved':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Resolved</span>;
      case 'closed':
        return <span className="text-[11px] font-semibold text-stone-500 bg-cream-200 px-2 py-0.5 rounded border border-cream-300">Closed</span>;
      default:
        return <span className="text-[11px] font-semibold text-stone-700 bg-cream-200 px-2 py-0.5 rounded">{status}</span>;
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
                Vendor Workspace
              </span>
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-2.5">
                Support Tickets &amp; Disputes
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Respond to customer disputes, review evidence files, and manage resolution statuses.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-1.5 bg-cream-200 p-1 rounded-lg border border-cream-300 text-xs font-medium overflow-x-auto">
              {['all', 'open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded capitalize whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-torch-500 text-white shadow-xs font-semibold'
                      : 'text-stone-700 hover:text-torch-600'
                  }`}
                >
                  {tab.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 mb-6 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {actionSuccess}
          </div>
        )}

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tickets Queue (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-cream-300 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-cream-100 border-b border-cream-200 text-xs font-bold text-stone-700 uppercase tracking-wider">
              Assigned Tickets ({filteredTickets.length})
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-stone-500 font-medium">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                No tickets matching current filter.
              </div>
            ) : (
              <div className="divide-y divide-cream-100 max-h-[700px] overflow-y-auto">
                {filteredTickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => loadTicketDetail(t.public_reference)}
                    className={`w-full text-left p-4 transition-colors hover:bg-cream-50 flex items-start justify-between cursor-pointer ${
                      selectedTicket?.public_reference === t.public_reference
                        ? 'bg-torch-50/70 border-l-4 border-torch-500'
                        : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-bold text-torch-700">
                          {t.public_reference}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>
                      <div className="font-bold text-xs text-stone-900 line-clamp-1">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Customer: {t.customer?.name}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Ticket Conversation & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!selectedTicket ? (
              <div className="bg-white border border-cream-300 rounded-xl p-12 text-center text-stone-500 text-xs shadow-xs">
                Select a ticket from the left queue to view details and reply.
              </div>
            ) : detailLoading ? (
              <div className="bg-white border border-cream-300 rounded-xl p-12 text-center text-stone-500 text-xs shadow-xs">
                Loading ticket thread...
              </div>
            ) : (
              <>
                {/* Ticket Header & Status Switcher Card */}
                <div className="bg-white border border-cream-300 rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-cream-200">
                    <div>
                      <span className="font-mono text-xs font-bold text-torch-700">
                        {selectedTicket.public_reference}
                      </span>
                      <h2 className="text-lg font-bold text-stone-900 mt-1">
                        {selectedTicket.subject}
                      </h2>
                    </div>
                    <div>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-stone-700 bg-cream-100 p-3.5 rounded-lg border border-cream-200">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Customer</span>
                      <span className="font-semibold text-stone-900">{selectedTicket.customer?.name}</span>
                      <div className="text-[11px] font-mono text-stone-500">{selectedTicket.customer?.email}</div>
                    </div>
                    {selectedTicket.order && (
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Linked Order</span>
                        <span className="font-mono font-bold text-torch-700">{selectedTicket.order.public_reference}</span>
                        <div className="text-[11px] text-stone-500">{selectedTicket.order.item_title_snapshot}</div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-stone-700 bg-white p-3.5 border border-cream-200 rounded-lg whitespace-pre-line leading-relaxed">
                    {selectedTicket.description}
                  </div>

                  {/* Private Evidence Attachments */}
                  {selectedTicket.attachments?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] uppercase font-bold text-stone-400 block mb-2">
                        Attached Evidence
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1.5 rounded bg-cream-100 hover:bg-cream-200 border border-cream-300 text-xs font-medium text-stone-800 transition-colors"
                          >
                            <Paperclip className="w-3 h-3 mr-1 text-torch-600" />
                            {att.file_name}
                            <Download className="w-3 h-3 ml-2 text-stone-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Transition Controls */}
                  <div className="pt-3 border-t border-cream-200 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 mr-2">Set Status:</span>
                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('waiting_for_customer')}
                      className="px-2.5 py-1 bg-torch-50 text-torch-700 border border-torch-200 rounded text-xs font-semibold hover:bg-torch-100 cursor-pointer"
                    >
                      Awaiting Customer
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold hover:bg-emerald-100 cursor-pointer"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('closed')}
                      className="px-2.5 py-1 bg-cream-200 text-stone-700 border border-cream-300 rounded text-xs font-semibold hover:bg-cream-300 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="bg-white border border-cream-300 rounded-xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-cream-200">
                    Thread History ({selectedTicket.messages?.length || 0})
                  </h3>

                  {selectedTicket.messages?.length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400">
                      No replies on this ticket yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTicket.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-4 rounded-lg text-xs leading-relaxed ${
                            m.sender.role === 'vendor'
                              ? 'bg-torch-50/40 border border-torch-100 ml-6'
                              : 'bg-cream-50 border border-cream-200 mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-1 mb-1 border-b border-cream-200/80">
                            <span className="font-bold text-stone-900">
                              {m.sender.name} ({m.sender.role})
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {new Date(m.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="whitespace-pre-line text-stone-800">{m.message}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  <form onSubmit={handleReplySubmit} className="pt-4 border-t border-cream-200 space-y-3">
                    <textarea
                      required
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response to the customer..."
                      className="w-full px-3 py-2 border border-cream-300 rounded text-xs bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800"
                    />

                    <div className="flex items-center justify-between">
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setReplyFiles(Array.from(e.target.files))}
                        className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-cream-200 file:text-stone-800 hover:file:bg-cream-300 cursor-pointer"
                      />

                      <button
                        type="submit"
                        disabled={submittingReply}
                        className="inline-flex items-center px-4 py-2 bg-torch-500 hover:bg-torch-600 text-white rounded text-xs font-semibold transition-colors shadow-xs disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        {submittingReply ? 'Posting...' : 'Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Vendor Support Tickets Management.</p>
      </footer>
    </div>
  );
}
