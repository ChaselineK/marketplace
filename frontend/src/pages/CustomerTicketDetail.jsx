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
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-torch-50 text-torch-700 border border-torch-200">
            <Shield className="w-2.5 h-2.5 mr-1" /> Support Moderator
          </span>
        );
      case 'vendor':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cream-200 text-stone-800 border border-cream-300">
            <Store className="w-2.5 h-2.5 mr-1 text-torch-600" /> Vendor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cream-100 text-stone-800 border border-cream-300">
            <User className="w-2.5 h-2.5 mr-1 text-torch-600" /> Customer (You)
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-24 text-center text-sm text-stone-500 font-medium">Loading ticket thread...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-torch-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Ticket Not Found</h2>
          <p className="text-sm text-stone-600 mb-6">{error || 'This ticket does not exist or you do not have permission to view it.'}</p>
          <Link
            to="/app/tickets"
            className="inline-flex items-center px-4 py-2 bg-torch-500 text-white rounded text-sm font-semibold hover:bg-torch-600 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Tickets
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Breadcrumb & Actions */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/app/tickets"
            className="inline-flex items-center text-xs font-semibold text-stone-600 hover:text-torch-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Support Tickets
          </Link>

          {ticket.status !== 'closed' && (
            <button
              onClick={handleCloseTicket}
              className="px-3 py-1.5 border border-cream-300 rounded text-xs font-semibold text-stone-700 bg-cream-50 hover:bg-cream-200 transition-colors cursor-pointer"
            >
              Close Ticket
            </button>
          )}
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 mb-6 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {actionSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Conversation Thread */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Subject Card */}
            <div className="bg-white border border-cream-300 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <span className="font-mono text-xs font-bold text-torch-700">
                  {ticket.public_reference}
                </span>
                <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded bg-cream-200 text-stone-800 border border-cream-300">
                  Status: {ticket.status.replace(/_/g, ' ')}
                </span>
              </div>

              <h1 className="text-xl font-bold text-stone-900 mt-4 mb-2">
                {ticket.subject}
              </h1>

              <div className="bg-cream-50 p-4 rounded-lg border border-cream-200 text-xs text-stone-700 whitespace-pre-line leading-relaxed mt-4">
                {ticket.description}
              </div>

              {/* Initial Attachments */}
              {ticket.attachments?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-cream-200">
                  <div className="text-xs font-bold text-stone-500 mb-2 flex items-center">
                    <Lock className="w-3.5 h-3.5 text-torch-600 mr-1" /> Private Evidence Files
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ticket.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded bg-cream-100 hover:bg-cream-200 border border-cream-300 text-xs font-semibold text-stone-800 transition-colors"
                      >
                        <Paperclip className="w-3 h-3 mr-1 text-torch-600" />
                        {att.file_name}
                        <Download className="w-3 h-3 ml-2 text-stone-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Conversation Messages */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-stone-900">
                Conversation Thread ({ticket.messages?.length || 0})
              </h2>

              {ticket.messages?.length === 0 ? (
                <div className="p-6 bg-white border border-cream-300 rounded-xl text-center text-xs text-stone-500 shadow-xs">
                  No replies yet. The assigned vendor has been notified.
                </div>
              ) : (
                ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-stone-900">{msg.sender.name}</span>
                        {getSenderBadge(msg.sender.role)}
                      </div>
                      <span className="text-[11px] font-mono text-stone-400">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed pt-1">
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Box */}
            {ticket.status !== 'closed' ? (
              <form onSubmit={handleReplySubmit} className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Post a Reply
                </h3>

                <textarea
                  required
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your message to the vendor or moderator..."
                  className="w-full px-3 py-2 border border-cream-300 rounded text-xs bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-torch-500 focus:border-torch-500 text-stone-800"
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setReplyAttachments(Array.from(e.target.files))}
                    className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-cream-200 file:text-stone-800 hover:file:bg-cream-300 cursor-pointer"
                  />

                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="inline-flex items-center justify-center px-4 py-2 bg-torch-500 hover:bg-torch-600 text-white rounded text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {submittingReply ? 'Posting...' : 'Send Message'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-cream-200 border border-cream-300 rounded-xl text-center text-xs text-stone-700">
                This ticket is closed. If you have a new inquiry, please open a new support ticket.
              </div>
            )}
          </div>

          {/* Right Column: Vendor & Order Context */}
          <div className="space-y-6">
            {/* Vendor Card */}
            <div className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs">
              <div className="text-xs uppercase font-bold text-stone-400 mb-3">Concerned Vendor</div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-torch-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {ticket.vendor?.store_name?.charAt(0) || 'V'}
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    {ticket.vendor?.store_name || ticket.vendor?.name}
                  </div>
                  <div className="text-xs font-mono text-stone-500">
                    @{ticket.vendor?.store_slug}
                  </div>
                </div>
              </div>

              {ticket.vendor?.whatsapp_number && (
                <div className="pt-3 border-t border-cream-200 text-xs text-stone-600 font-mono">
                  WhatsApp: +{ticket.vendor.whatsapp_number}
                </div>
              )}
            </div>

            {/* Linked Order Card (if present) */}
            {ticket.order && (
              <div className="bg-white border border-cream-300 rounded-xl p-5 shadow-xs">
                <div className="text-xs uppercase font-bold text-stone-400 mb-3">Linked Order</div>
                <div className="font-mono text-xs font-bold text-torch-700 mb-1">
                  {ticket.order.public_reference}
                </div>
                <div className="text-xs font-semibold text-stone-800 mb-2">
                  {ticket.order.item_title_snapshot}
                </div>
                <div className="text-xs text-stone-600 mb-4">
                  Snapshot Price: {ticket.order.price_currency} {Number(ticket.order.total_price_amount).toLocaleString()}
                </div>
                <Link
                  to={`/app/orders/${ticket.order.public_reference}`}
                  className="w-full inline-flex items-center justify-center px-3 py-1.5 bg-cream-100 hover:bg-cream-200 border border-cream-300 rounded text-xs font-semibold text-stone-800 transition-colors"
                >
                  View Order Details
                </Link>
              </div>
            )}

            {/* Private Storage Guarantee */}
            <div className="bg-cream-50 border border-cream-300 rounded-xl p-4 text-xs text-stone-600">
              <div className="font-semibold text-stone-900 mb-1 flex items-center">
                <Lock className="w-3.5 h-3.5 text-torch-600 mr-1.5" />
                Strict Privacy Guarantee
              </div>
              All messages and evidence files are restricted to you, the selected vendor, and Super Admins. Other vendors on the platform cannot view or access this ticket.
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-cream-50 border-t border-cream-300 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} WILRICH STORE. Ticket: {ticket.public_reference}.</p>
      </footer>
    </div>
  );
}
