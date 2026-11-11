import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import apiClient from '../api/client';
import {
  ArrowLeft,
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Send,
  Shield,
  Store,
  User,
  Download,
  Lock,
  Loader2,
} from 'lucide-react';

export default function CustomerTicketDetail() {
  const { reference } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/tickets/${reference}`);
      setTicket(res.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load support ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [reference]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    try {
      setSubmittingReply(true);
      const formData = new FormData();
      formData.append('message', replyMessage);
      replyAttachments.forEach((file) => {
        formData.append('attachments[]', file);
      });

      await apiClient.post(`/tickets/${reference}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReplyMessage('');
      setReplyAttachments([]);
      setActionSuccess('Reply posted successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Are you sure you want to close this ticket?')) return;

    try {
      const res = await apiClient.post(`/tickets/${reference}/close`);
      setTicket(res.data.data);
      setActionSuccess('Ticket marked as closed.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close ticket.');
    }
  };

  const getSenderBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-quantum-50 text-quantum-700 border border-quantum-200">
            <Shield className="w-2.5 h-2.5 mr-1" /> Support Moderator
          </span>
        );
      case 'vendor':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-ice-100 text-stone-800 border border-ice-300">
            <Store className="w-2.5 h-2.5 mr-1 text-quantum-600" /> Vendor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <User className="w-2.5 h-2.5 mr-1" /> Customer
          </span>
        );
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto py-24 text-center page-transition">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-quantum-600 mb-3" />
            <p className="text-sm font-semibold text-quantum-900">Loading conversation thread...</p>
          </div>
        </div>
        <footer className="py-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} WILRICH STORE
        </footer>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 text-center page-transition">
          <div className="glass-panel-elevated p-8 rounded-2xl">
            <AlertCircle className="w-12 h-12 text-quantum-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-900 mb-2">Ticket Not Found</h2>
            <p className="text-sm text-stone-600 mb-6">{error || 'This support ticket does not exist or access is restricted.'}</p>
            <Link
              to="/app/tickets"
              className="inline-flex items-center px-4 py-2 glass-button text-white rounded-lg text-sm font-semibold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets
            </Link>
          </div>
        </main>
        <footer className="py-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} WILRICH STORE
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between page-transition">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/app/tickets"
            className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-quantum-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Tickets
          </Link>

          {ticket.status !== 'closed' && (
            <button
              onClick={handleCloseTicket}
              className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-white transition-colors"
            >
              Mark Ticket as Closed
            </button>
          )}
        </div>

        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center shadow-xs page-transition">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
            {actionSuccess}
          </div>
        )}

        {/* Ticket Header Card */}
        <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono font-bold text-quantum-700 text-sm">
                  {ticket.public_reference}
                </span>
                {getStatusBadge(ticket.status)}
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider bg-ice-100 px-2 py-0.5 rounded-full border border-ice-200">
                  Priority: {ticket.priority}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {ticket.subject}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                <span>Vendor: <strong className="text-stone-900">{ticket.vendor?.store_name || ticket.vendor?.name}</strong></span>
                {ticket.order && (
                  <span>Linked Order: <Link to={`/app/orders/${ticket.order.public_reference}`} className="text-quantum-600 font-mono underline">{ticket.order.public_reference}</Link></span>
                )}
                <span>Opened: {new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Initial Ticket Description */}
          <div className="mt-6 pt-6 border-t border-ice-200 text-xs text-stone-700 leading-relaxed whitespace-pre-line bg-ice-50/70 p-4 rounded-xl border border-ice-200">
            {ticket.description}
          </div>

          {/* Ticket Attachments */}
          {ticket.attachments?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-ice-200">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Initial Evidence Attachments
              </span>
              <div className="flex flex-wrap gap-2">
                {ticket.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 bg-white border border-ice-300 rounded-lg text-xs font-medium text-stone-800 hover:text-quantum-600 hover:border-quantum-400 transition-colors shadow-2xs"
                  >
                    <Paperclip className="w-3.5 h-3.5 mr-1.5 text-quantum-600" />
                    {att.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Thread */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            Discussion Thread ({ticket.messages?.length || 0})
          </h2>

          {ticket.messages?.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-xs text-stone-500">
              No replies yet. The vendor or a support moderator will review your issue shortly.
            </div>
          ) : (
            <div className="space-y-4">
              {ticket.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`glass-panel rounded-2xl p-5 ${
                    msg.sender?.role === 'super_admin'
                      ? 'border-quantum-300 bg-quantum-50/40'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-ice-200 mb-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-stone-900">{msg.sender?.name}</span>
                      {getSenderBadge(msg.sender?.role)}
                    </div>
                    <span className="text-stone-400 font-mono text-[11px]">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-stone-800 whitespace-pre-line leading-relaxed">
                    {msg.message}
                  </p>

                  {/* Message Attachments */}
                  {msg.attachments?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-ice-200 flex flex-wrap gap-2">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2.5 py-1 bg-white border border-ice-300 rounded-lg text-[11px] font-medium text-stone-800 hover:text-quantum-600"
                        >
                          <Paperclip className="w-3 h-3 mr-1 text-quantum-600" />
                          {att.file_name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Composer */}
        {ticket.status !== 'closed' ? (
          <div className="glass-panel-elevated rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Post Reply
            </h3>

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                aria-label="Reply message"
                className="w-full px-3 py-2 border border-ice-300 rounded-xl text-xs bg-white/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-quantum-500 text-stone-800"
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setReplyAttachments(Array.from(e.target.files))}
                  className="block text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-quantum-50 file:text-quantum-700 hover:file:bg-quantum-100 cursor-pointer"
                />

                <button
                  type="submit"
                  disabled={submittingReply || !replyMessage.trim()}
                  className="inline-flex items-center justify-center px-4 py-2 glass-button text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submittingReply ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-4 text-center text-xs text-stone-500 flex items-center justify-center space-x-2">
            <Lock className="w-4 h-4 text-stone-400" />
            <span>This ticket has been marked as closed. Open a new ticket if further assistance is required.</span>
          </div>
        )}
      </main>

      <footer className="glass-panel border-t border-ice-200 py-6 text-center text-xs text-stone-500 mt-12">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Ticket Thread.</p>
      </footer>
    </div>
  );
}
